import { ApiError } from './errors'

interface RequestOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10_000, retries = 2, ...init } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      const body = await response.json().catch(() => null)

      if (response.ok) return body as T
      if (response.status === 401) throw new ApiError('Credenciais inválidas para o serviço externo.', 'UNAUTHORIZED', 502)
      if (response.status === 429) throw new ApiError('O serviço externo limitou as requisições.', 'RATE_LIMITED', 429, true, body)
      if (response.status >= 500 && attempt < retries) {
        lastError = new ApiError('O serviço externo está indisponível.', 'UPSTREAM_ERROR', 502, true, body)
        continue
      }
      throw new ApiError('O serviço externo rejeitou a requisição.', 'UPSTREAM_ERROR', 502, false, body)
    } catch (error) {
      lastError = error
      if (error instanceof ApiError && !error.retryable) throw error
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new ApiError('Tempo limite excedido ao consultar o serviço externo.', 'TIMEOUT', 504, true)
      }
      if (attempt === retries) throw lastError
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError instanceof Error ? lastError : new ApiError('Falha de comunicação.', 'INTERNAL_ERROR')
}