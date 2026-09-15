import test from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_URL = 'memory'
process.env.AUTH_SECRET = 'test-secret'

import { createLocalUser, authenticateLocalUser, createSessionToken, verifySessionToken } from '../lib/server/local-auth.ts'

test('creates and authenticates a local mrv.com.br user', () => {
  createLocalUser('pedro.teste@mrv.com.br', 'Pedro Teste', 'admin', 'senha-forte')
  const user = authenticateLocalUser('pedro.teste@mrv.com.br', 'senha-forte')
  assert.equal(user.role, 'admin')
})

test('rejects non-corporate email domains', () => {
  assert.throws(() => authenticateLocalUser('pedro@gmail.com', 'qualquer'), /corporativo/)
})

test('rejects wrong password', () => {
  createLocalUser('outra.pessoa@mrv.com.br', 'Outra Pessoa', 'colaborador', 'correta123')
  assert.throws(() => authenticateLocalUser('outra.pessoa@mrv.com.br', 'errada123'), /inválidos/)
})

test('round-trips a signed session token', () => {
  const user = authenticateLocalUser('pedro.teste@mrv.com.br', 'senha-forte')
  const token = createSessionToken(user)
  const verified = verifySessionToken(token)
  assert.equal(verified?.email, user.email)
})

test('rejects a tampered session token', () => {
  const user = authenticateLocalUser('pedro.teste@mrv.com.br', 'senha-forte')
  const token = createSessionToken(user)
  const tampered = `${token}x`
  assert.equal(verifySessionToken(tampered), null)
})
