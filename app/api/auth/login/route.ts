import { NextResponse } from 'next/server'
import { authenticateLocalUser, createSessionToken } from '@/lib/server/local-auth'

const SESSION_COOKIE = 'mrv_session'

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ email: '', password: '' }))

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: { message: 'Informe e-mail e senha.' } }, { status: 400 })
  }

  try {
    const user = authenticateLocalUser(email, password)
    const token = createSessionToken(user)

    const response = NextResponse.json({ id: user.id, nome: user.nome, email: user.email, role: user.role })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível autenticar.'
    return NextResponse.json({ error: { message } }, { status: 401 })
  }
}
