// Adapter real dos Correios, baseado no fluxo validado manualmente:
// autenticação (usuário + código de acesso) -> pré-postagem -> etiqueta assíncrona -> DCe.
import { ApiError } from './errors'
import { requestJson } from './http'

function getCorreiosConfig() {
  const baseUrl = (process.env.CORREIOS_API_BASE_URL || 'https://api.correios.com.br').replace(/\/$/, '')
  const usuario = process.env.CORREIOS_USUARIO
  const codigoAcesso = process.env.CORREIOS_CODIGO_ACESSO
  if (!usuario || !codigoAcesso) {
    throw new ApiError('A integração com os Correios ainda não foi configurada.', 'CONFIGURATION_ERROR', 503)
  }
  return { baseUrl, usuario, codigoAcesso }
}

interface TokenCache {
  token: string
  expiresAt: number
}

let cachedToken: TokenCache | null = null
// Os Correios não informam expiração fixa no retorno do token; renovamos com folga de segurança.
const TOKEN_TTL_MS = 3 * 60 * 60 * 1000 - 60_000

async function obterToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token

  const { baseUrl, usuario, codigoAcesso } = getCorreiosConfig()
  const basicAuth = Buffer.from(`${usuario}:${codigoAcesso}`).toString('base64')

  const data = await requestJson<{ token: string }>(`${baseUrl}/token/v1/autentica`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth}` },
    retries: 0,
  })

  cachedToken = { token: data.token, expiresAt: Date.now() + TOKEN_TTL_MS }
  return cachedToken.token
}

async function authorizedRequest<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
  const { baseUrl } = getCorreiosConfig()
  const token = await obterToken()

  try {
    return await requestJson<T>(`${baseUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
      retries: 0,
    })
  } catch (error) {
    if (error instanceof ApiError && error.code === 'UNAUTHORIZED' && attempt === 0) {
      cachedToken = null
      return authorizedRequest<T>(path, init, 1)
    }
    throw error
  }
}

export interface PrePostagemResponse {
  id: string
  codigoObjeto: string
}

export function criarPrePostagem(payload: unknown) {
  return authorizedRequest<PrePostagemResponse>('/prepostagem/v1/prepostagens', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface SolicitarEtiquetaResponse {
  idRecibo: string
}

export function solicitarEtiqueta(idsPrePostagem: string[]) {
  return authorizedRequest<SolicitarEtiquetaResponse>('/prepostagem/v1/prepostagens/rotulo/assincrono/pdf', {
    method: 'POST',
    body: JSON.stringify({ idsPrePostagem, tipoRotulo: 'P', formatoRotulo: 'ET' }),
  })
}

export interface ArquivoPdfResponse {
  nome: string
  dados: string
}

export function baixarEtiqueta(idRecibo: string) {
  return authorizedRequest<ArquivoPdfResponse>(`/prepostagem/v1/prepostagens/rotulo/download/assincrono/${idRecibo}`)
}

export function gerarDeclaracaoConteudo(idsPrePostagens: string[]) {
  return authorizedRequest<ArquivoPdfResponse>('/prepostagem/v1/prepostagens/dce/dace/impressao', {
    method: 'POST',
    body: JSON.stringify({ idsPrePostagens, tipoDace: 'C' }),
  })
}

export interface PrazoResponse {
  prazoEntrega: number
}

export function consultarPrazo(cepOrigem: string, cepDestino: string, codigoServico: string) {
  return authorizedRequest<PrazoResponse>(
    `/prazo/v1/prazo/${codigoServico}?cepOrigem=${cepOrigem}&cepDestino=${cepDestino}`,
  )
}

export interface PrecoResponse {
  valorSemAdicionais: string
  pesoTotal: string
}

export function consultarPreco(cepOrigem: string, cepDestino: string, codigoServico: string, peso: number) {
  return authorizedRequest<PrecoResponse[]>(
    `/preco/v1/nacional/${codigoServico}?cepOrigem=${cepOrigem}&cepDestino=${cepDestino}&psObjeto=${peso}`,
  )
}

export interface RastreioEvento {
  data: string
  descricao: string
  local?: string
}

export function consultarRastreio(codigoObjeto: string) {
  return authorizedRequest<{ eventos: RastreioEvento[] }>(`/srorastro/v1/objetos/${codigoObjeto}`)
}

/** Fluxo completo: cria a pré-postagem, gera a etiqueta e a DCe a partir do payload já validado. */
export async function criarPostagemCompleta(payload: unknown) {
  const prePostagem = await criarPrePostagem(payload)
  const { idRecibo } = await solicitarEtiqueta([prePostagem.id])

  // A geração do PDF é assíncrona nos Correios; uma pequena espera evita a primeira tentativa falhar.
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const etiqueta = await baixarEtiqueta(idRecibo)
  const dce = await gerarDeclaracaoConteudo([prePostagem.id])

  return {
    idPrePostagem: prePostagem.id,
    codigoObjeto: prePostagem.codigoObjeto,
    etiqueta,
    dce,
  }
}
