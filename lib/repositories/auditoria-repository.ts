import { randomUUID } from 'node:crypto'
import { getDb } from '@/lib/server/db'
import type { AuditRepository } from '@/lib/server/audit'

export function createSqliteAuditRepository(): AuditRepository {
  const db = getDb()

  return {
    async append(event) {
      db.prepare(
        'INSERT INTO auditoria (id, usuario_id, acao, entidade, detalhes_json, ocorrido_em) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(`AUD-${randomUUID().slice(0, 8)}`, event.userId, event.action, event.entity, JSON.stringify(event.details), event.occurredAt)
    },
  }
}

export function listAuditEvents() {
  const db = getDb()
  return db.prepare('SELECT * FROM auditoria ORDER BY ocorrido_em DESC').all()
}
