import { ApiError } from '../api/errors.ts'

export interface CriarPostagemInput {
  remetenteNome: string
  destinatarioNome: string
  remetenteCep: string
  destinatarioCep: string
  remetenteRua: string
  destinatarioRua: string
  remetenteNumero: string
  destinatarioNumero: string
  remetenteBairro: string
  destinatarioBairro: string
  remetenteCidade: string
  destinatarioCidade: string
  remetenteUf: string
  destinatarioUf: string
  servico: string
  peso: number
  altura: number
  largura: number
  comprimento: number
  conteudo: string
  chamado: string
  centroCusto: string
}

const requiredFields: (keyof CriarPostagemInput)[] = [
  'remetenteNome', 'destinatarioNome', 'remetenteCep', 'destinatarioCep',
  'remetenteRua', 'destinatarioRua', 'remetenteNumero', 'destinatarioNumero',
  'remetenteBairro', 'destinatarioBairro', 'remetenteCidade', 'destinatarioCidade',
  'remetenteUf', 'destinatarioUf', 'servico', 'conteudo', 'chamado', 'centroCusto',
]

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function validateCriarPostagem(input: unknown): CriarPostagemInput {
  if (!input || typeof input !== 'object') throw new ApiError('Payload inválido.', 'BAD_REQUEST', 400)
  const value = input as Record<string, unknown>
  const missing = requiredFields.filter((field) => !clean(value[field]))
  const numbers = ['peso', 'altura', 'largura', 'comprimento']
  const invalidNumbers = numbers.filter((field) => typeof value[field] !== 'number' || Number(value[field]) <= 0)
  const invalidCeps = ['remetenteCep', 'destinatarioCep'].filter((field) => !/^\d{5}-?\d{3}$/.test(clean(value[field])))
  const invalidUfs = ['remetenteUf', 'destinatarioUf'].filter((field) => !/^[A-Za-z]{2}$/.test(clean(value[field])))

  if (missing.length || invalidNumbers.length || invalidCeps.length || invalidUfs.length) {
    throw new ApiError('Revise os campos obrigatórios da postagem.', 'BAD_REQUEST', 400, false, {
      missing,
      invalidNumbers,
      invalidCeps,
      invalidUfs,
    })
  }

  const text = (field: string) => String(value[field] ?? '')
  const number = (field: string) => Number(value[field])

  return {
    remetenteNome: text('remetenteNome'),
    destinatarioNome: text('destinatarioNome'),
    remetenteCep: text('remetenteCep'),
    destinatarioCep: text('destinatarioCep'),
    remetenteRua: text('remetenteRua'),
    destinatarioRua: text('destinatarioRua'),
    remetenteNumero: text('remetenteNumero'),
    destinatarioNumero: text('destinatarioNumero'),
    remetenteBairro: text('remetenteBairro'),
    destinatarioBairro: text('destinatarioBairro'),
    remetenteCidade: text('remetenteCidade'),
    destinatarioCidade: text('destinatarioCidade'),
    remetenteUf: text('remetenteUf'),
    destinatarioUf: text('destinatarioUf'),
    servico: text('servico'),
    peso: number('peso'),
    altura: number('altura'),
    largura: number('largura'),
    comprimento: number('comprimento'),
    conteudo: text('conteudo'),
    chamado: text('chamado'),
    centroCusto: text('centroCusto'),
  }
}