import { randomUUID } from 'node:crypto'
import { getDb } from '@/lib/server/db'
import type { MaloteStatus } from '@/lib/domain/status'

export interface MaloteInput {
  rotaId: string
  quemEnviou: string
  quemRecebe: string
  chamado: string
  centroCusto: string
  conteudo: string
  peso: number
}

export interface MaloteRecord extends MaloteInput {
  id: string
  status: MaloteStatus
  createdAt: string
  updatedAt: string
}

interface MaloteRow {
  id: string
  dados_json: string
  status: string
  created_at: string
  updated_at: string
}

function rowToRecord(row: MaloteRow): MaloteRecord {
  return { ...(JSON.parse(row.dados_json) as MaloteInput), id: row.id, status: row.status as MaloteStatus, createdAt: row.created_at, updatedAt: row.updated_at }
}

export function createSqliteMaloteRepository() {
  const db = getDb()

  return {
    async create(input: MaloteInput) {
      const id = `MAL-${randomUUID().slice(0, 8)}`
      const now = new Date().toISOString()
      db.prepare('INSERT INTO malotes (id, dados_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .run(id, JSON.stringify(input), 'aguardando_coleta', now, now)
      return { ...input, id, status: 'aguardando_coleta' as MaloteStatus, createdAt: now, updatedAt: now }
    },

    async updateStatus(id: string, status: MaloteStatus) {
      db.prepare('UPDATE malotes SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), id)
    },

    async list(): Promise<MaloteRecord[]> {
      const rows = db.prepare('SELECT * FROM malotes ORDER BY created_at DESC').all() as MaloteRow[]
      return rows.map(rowToRecord)
    },
  }
}
