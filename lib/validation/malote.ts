// Node's native TypeScript runner requires the explicit extension here.
import { ApiError } from '../api/errors.ts'

export interface CriarMaloteInput {
  rotaId: string
  quemEnviou: string
  quemRecebe: string
  chamado: string
  centroCusto: string
  conteudo: string
  peso: number
}

const labels: Record<keyof CriarMaloteInput, string> = {
  rotaId: 'Rota de malote',
  quemEnviou: 'Quem enviou',
  quemRecebe: 'Quem recebe',
  chamado: 'Chamado Agilis',
  centroCusto: 'Centro de custo',
  conteudo: 'Conteúdo do malote',
  peso: 'Peso',
}

export function validateCriarMalote(input: CriarMaloteInput) {
  const missing = (Object.keys(labels) as (keyof CriarMaloteInput)[]).filter((field) => {
    const value = input[field]
    return typeof value === 'string' ? !value.trim() : !value
  })
  const invalidNumbers: (keyof CriarMaloteInput)[] = input.peso <= 0 ? ['peso'] : []

  if (missing.length || invalidNumbers.length) {
    const messages: string[] = []
    if (missing.length) messages.push(`Preencha: ${missing.map((field) => labels[field]).join(', ')}.`)
    if (invalidNumbers.length) messages.push(`${invalidNumbers.map((field) => labels[field]).join(', ')} deve ser maior que zero.`)
    throw new ApiError(messages.join(' '), 'BAD_REQUEST', 400, false, { missing, invalidNumbers })
  }

  return input
}
