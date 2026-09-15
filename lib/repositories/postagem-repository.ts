import { randomUUID } from 'node:crypto'
import { getDb } from '@/lib/server/db'
import type { CriarPostagemInput } from '@/lib/validation/postagem'
import type { PostagemStatus } from '@/lib/domain/status'

export interface PostagemRecord extends CriarPostagemInput {
  id: string
  codigoRastreio?: string
  status: PostagemStatus
  createdAt: string
  updatedAt: string
}

export interface PostagemRepository {
  create: (input: CriarPostagemInput, codigoRastreio?: string) => Promise<PostagemRecord>
  findById: (id: string) => Promise<PostagemRecord | null>
  list: () => Promise<PostagemRecord[]>
}

interface PostagemRow {
  id: string
  dados_json: string
  codigo_rastreio: string | null
  status: string
  created_at: string
  updated_at: string
}

function rowToRecord(row: PostagemRow): PostagemRecord {
  return {
    ...(JSON.parse(row.dados_json) as CriarPostagemInput),
    id: row.id,
    codigoRastreio: row.codigo_rastreio ?? undefined,
    status: row.status as PostagemStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createSqlitePostagemRepository(): PostagemRepository {
  const db = getDb()

  return {
    async create(input, codigoRastreio) {
      const id = `PST-${randomUUID().slice(0, 8)}`
      const now = new Date().toISOString()
      db.prepare(
        'INSERT INTO postagens (id, dados_json, codigo_rastreio, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(id, JSON.stringify(input), codigoRastreio ?? null, 'postado', now, now)
      return { ...input, id, codigoRastreio, status: 'postado', createdAt: now, updatedAt: now }
    },

    async findById(id) {
      const row = db.prepare('SELECT * FROM postagens WHERE id = ?').get(id) as PostagemRow | undefined
      return row ? rowToRecord(row) : null
    },

    async list() {
      const rows = db.prepare('SELECT * FROM postagens ORDER BY created_at DESC').all().map((row) => ({
        id: String(row.id),
        dados_json: String(row.dados_json),
        codigo_rastreio: row.codigo_rastreio === null ? null : String(row.codigo_rastreio),
        status: String(row.status),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      }))
      return rows.map(rowToRecord)
    },
  }
}
