import test from 'node:test'
import assert from 'node:assert/strict'
// Node's native TypeScript runner requires the explicit extension here.
// @ts-expect-error The application compiler resolves this module through the bundler.
import { validateCriarMalote } from '../lib/validation/malote.ts'

const validInput = {
  rotaId: 'R1',
  quemEnviou: 'Ana Ribeiro',
  quemRecebe: 'Carlos Menezes',
  chamado: 'INC-20508',
  centroCusto: 'CC-4021',
  conteudo: 'Documentos',
  peso: 2,
}

test('accepts a valid malote payload', () => {
  assert.equal(validateCriarMalote(validInput).rotaId, 'R1')
})

test('reports missing malote fields', () => {
  assert.throws(() => validateCriarMalote({ ...validInput, conteudo: '' }), /Conteúdo do malote/)
})

test('reports zero malote weight', () => {
  assert.throws(() => validateCriarMalote({ ...validInput, peso: 0 }), /Peso deve ser maior que zero/)
})
