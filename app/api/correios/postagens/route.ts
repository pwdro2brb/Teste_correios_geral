import { NextResponse } from 'next/server'
import { toApiError } from '@/lib/api/errors'
import { criarPostagemCompleta } from '@/lib/api/correios'
import { requireAuthenticatedUser } from '@/lib/server/auth'
import { createAuditLogger } from '@/lib/server/audit'
import { validateCriarPostagem } from '@/lib/validation/postagem'
import { createSqlitePostagemRepository } from '@/lib/repositories/postagem-repository'
import { createSqliteAuditRepository } from '@/lib/repositories/auditoria-repository'

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser()
    const input = validateCriarPostagem(await request.json())
    const registrarAuditoria = createAuditLogger(user, createSqliteAuditRepository())

    const correios = await criarPostagemCompleta(input)
    const saved = await createSqlitePostagemRepository().create(input, correios.codigoObjeto)

    await registrarAuditoria({
      action: 'Gerou postagem',
      entity: saved.id,
      details: { codigoObjeto: correios.codigoObjeto, servico: input.servico },
    })

    return NextResponse.json({ ...saved, correios }, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error)
    return NextResponse.json(
      { error: { code: apiError.code, message: apiError.message, details: apiError.details } },
      { status: apiError.status },
    )
  }
}

export async function GET() {
  try {
    await requireAuthenticatedUser()
    const postagens = await createSqlitePostagemRepository().list()
    return NextResponse.json(postagens)
  } catch (error) {
    const apiError = toApiError(error)
    return NextResponse.json(
      { error: { code: apiError.code, message: apiError.message, details: apiError.details } },
      { status: apiError.status },
    )
  }
}
