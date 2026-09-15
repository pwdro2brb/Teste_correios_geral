import test from 'node:test'
import assert from 'node:assert/strict'
// Node's native TypeScript runner requires the explicit extension here.
import { validateCriarPostagem } from '../lib/validation/postagem.ts'

const validInput = {
  remetenteNome: 'MRV',
  destinatarioNome: 'Cliente',
  remetenteCep: '30455-610',
  destinatarioCep: '30140-071',
  remetenteRua: 'Avenida Professor Mário Werneck',
  destinatarioRua: 'Rua dos Aimorés',
  remetenteNumero: '621',
  destinatarioNumero: '1000',
  remetenteBairro: 'Estoril',
  destinatarioBairro: 'Boa Viagem',
  remetenteCidade: 'Belo Horizonte',
  destinatarioCidade: 'Belo Horizonte',
  remetenteUf: 'MG',
  destinatarioUf: 'MG',
  servico: 'PAC',
  peso: 1,
  altura: 15,
  largura: 15,
  comprimento: 30,
  conteudo: 'Documentação',
  chamado: '1234567',
  centroCusto: 'CC-4021',
}

test('accepts a valid postagem payload', () => {
  assert.equal(validateCriarPostagem(validInput).servico, 'PAC')
})

test('rejects invalid CEP and non-positive dimensions', () => {
  assert.throws(() => validateCriarPostagem({ ...validInput, remetenteCep: '123', peso: 0 }), /Revise os campos obrigatórios/)
})

test('rejects missing required fields', () => {
  assert.throws(() => validateCriarPostagem({ ...validInput, conteudo: '' }), /Revise os campos obrigatórios/)
})