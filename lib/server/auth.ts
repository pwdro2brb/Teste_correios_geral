import { cookies } from 'next/headers'
import { ApiError } from '@/lib/api/errors'
import { verifySessionToken } from '@/lib/server/local-auth'

export interface AuthenticatedUser {
  id: string
  name: string
  role: 'colaborador' | 'operador' | 'admin'
}

/**
 * Autenticação temporária via login local (e-mail @mrv.com.br + senha).
 * Substituir por validação de token Entra ID assim que o SSO corporativo estiver disponível.
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies()
  const session = verifySessionToken(cookieStore.get('mrv_session')?.value)

  if (!session) {
    throw new ApiError('Sessão inválida ou expirada. Faça login novamente.', 'UNAUTHORIZED', 401)
  }

  return { id: session.id, name: session.nome, role: session.role }
}