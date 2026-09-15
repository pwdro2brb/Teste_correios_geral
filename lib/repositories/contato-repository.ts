import { randomUUID } from 'node:crypto'
import { getDb } from '@/lib/server/db'

export interface ContatoInput {
  tipo: 'remetente' | 'destinatario'
  nome: string
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  telefone?: string
  centroCusto: string
}

export interface ContatoRecord extends ContatoInput {
  id: string
  createdAt: string
}

interface ContatoRow {
  id: string
  tipo: string
  dados_json: string
  created_at: string
}

function rowToRecord(row: ContatoRow): ContatoRecord {
  return { ...(JSON.parse(row.dados_json) as ContatoInput), id: row.id, createdAt: row.created_at }
}

export function createSqliteContatoRepository() {
  const db = getDb()

  return {
    async create(input: ContatoInput) {
      const id = `CT-${randomUUID().slice(0, 8)}`
      const now = new Date().toISOString()
      db.prepare('INSERT INTO contatos (id, tipo, dados_json, created_at) VALUES (?, ?, ?, ?)')
        .run(id, input.tipo, JSON.stringify(input), now)
      return { ...input, id, createdAt: now }
    },

    async list(tipo?: ContatoInput['tipo']): Promise<ContatoRecord[]> {
      const rows = tipo
        ? (db.prepare('SELECT * FROM contatos WHERE tipo = ? ORDER BY created_at DESC').all(tipo) as ContatoRow[])
        : (db.prepare('SELECT * FROM contatos ORDER BY created_at DESC').all() as ContatoRow[])
      return rows.map(rowToRecord)
    },
  }
}
