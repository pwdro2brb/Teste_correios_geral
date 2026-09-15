// Temporary local login, used only until the Entra ID (SSO corporativo) adapter is configured.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'
// Node's native TypeScript runner requires the explicit extension here.
// @ts-expect-error The application compiler resolves this module through the bundler.
import { getDb } from './db.ts'
import type { Role } from '@/lib/roles'

const EMAIL_DOMAIN = '@mrv.com.br'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 horas

export interface LocalUser {
  id: string
  email: string
  nome: string
  role: Role
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

export function createLocalUser(email: string, nome: string, role: Role, password: string): LocalUser {
  if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
    throw new Error(`Apenas e-mails ${EMAIL_DOMAIN} podem ser cadastrados.`)
  }
  const { hash, salt } = hashPassword(password)
  const id = `U-${randomBytes(6).toString('hex')}`
  getDb()
    .prepare(
      'INSERT INTO usuarios (id, email, nome, role, senha_hash, senha_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(id, email.toLowerCase(), nome, role, hash, salt, new Date().toISOString())
  return { id, email: email.toLowerCase(), nome, role }
}

export function authenticateLocalUser(email: string, password: string): LocalUser {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail.endsWith(EMAIL_DOMAIN)) {
    throw new Error(`Use um e-mail corporativo (${EMAIL_DOMAIN}).`)
  }

  const row = getDb()
    .prepare('SELECT id, email, nome, role, senha_hash, senha_salt FROM usuarios WHERE email = ?')
    .get(normalizedEmail) as
    | { id: string; email: string; nome: string; role: Role; senha_hash: string; senha_salt: string }
    | undefined

  if (!row) throw new Error('Usuário ou senha inválidos.')

  const { hash } = hashPassword(password, row.senha_salt)
  const expected = Buffer.from(row.senha_hash, 'hex')
  const actual = Buffer.from(hash, 'hex')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error('Usuário ou senha inválidos.')
  }

  return { id: row.id, email: row.email, nome: row.nome, role: row.role }
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET não configurado.')
  return secret
}

export function createSessionToken(user: LocalUser): string {
  const payload = JSON.stringify({ ...user, exp: Date.now() + SESSION_TTL_MS })
  const encodedPayload = Buffer.from(payload).toString('base64url')
  const signature = createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string | undefined): LocalUser | null {
  if (!token) return null
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('base64url')
  const expected = Buffer.from(expectedSignature)
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'))
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return { id: payload.id, email: payload.email, nome: payload.nome, role: payload.role }
  } catch {
    return null
  }
}
