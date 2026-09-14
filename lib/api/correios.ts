import { ApiError } from './errors'
import { requestJson } from './http'

function getCorreiosConfig() {
  const baseUrl = process.env.CORREIOS_API_BASE_URL
  const token = process.env.CORREIOS_API_TOKEN
  if (!baseUrl || !token) {
    throw new ApiError('A integração com os Correios ainda não foi configurada.', 'CONFIGURATION_ERROR', 503)
  }
  return { baseUrl: baseUrl.replace(/\/$/, ''), token }
}

export interface CorreiosPostagemResponse {
  codigoRastreio: string
  status: string
  etiquetaUrl?: string
  dceUrl?: string
}

export function criarPostagemCorreios(payload: unknown) {
  const { baseUrl, token } = getCorreiosConfig()
  return requestJson<CorreiosPostagemResponse>(`${baseUrl}/postagens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}