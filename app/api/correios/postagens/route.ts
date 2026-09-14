import { NextResponse } from 'next/server'
import { toApiError } from '@/lib/api/errors'
import { criarPostagemCorreios } from '@/lib/api/correios'
import { requireAuthenticatedUser } from '@/lib/server/auth'
import { validateCriarPostagem } from '@/lib/validation/postagem'
import { createUnavailablePostagemRepository } from '@/lib/repositories/postagem-repository'

export async function POST(request: Request) {
  try {
    const user = requireAuthenticatedUser()
    const input = validateCriarPostagem(await request.json())
    const repository = createUnavailablePostagemRepository()
    const saved = await repository.create(input)
    const correios = await criarPostagemCorreios(input)

    return NextResponse.json({ ...saved, correios, requestedBy: user.id }, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error)
    return NextResponse.json(
      { error: { code: apiError.code, message: apiError.message, details: apiError.details } },
      { status: apiError.status },
    )
  }
}