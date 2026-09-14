import { ApiError } from '@/lib/api/errors'

export interface AuthenticatedUser {
  id: string
  name: string
  role: 'colaborador' | 'operador' | 'admin'
}

export function requireAuthenticatedUser(): AuthenticatedUser {
  throw new ApiError(
    'Autenticação corporativa ainda não configurada. Configure o adaptador Entra ID antes de liberar este endpoint.',
    'UNAUTHORIZED',
    401,
  )
}