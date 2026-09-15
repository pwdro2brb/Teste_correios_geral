import { getDb } from '@/lib/server/db'

export interface CentroCustoRecord {
  codigo: string
  nome: string
  ativo: boolean
}

interface CentroCustoRow {
  codigo: string
  nome: string
  ativo: number
}

export function createSqliteCentroCustoRepository() {
  const db = getDb()

  return {
    /** Substitui toda a lista pela planilha importada (comportamento de "fonte única" pedido no requisito). */
    async importarPlanilha(itens: { codigo: string; nome: string }[]) {
      const insert = db.prepare('INSERT OR REPLACE INTO centros_custo (codigo, nome, ativo) VALUES (?, ?, 1)')
      db.exec('DELETE FROM centros_custo')
      for (const item of itens) insert.run(item.codigo, item.nome)
    },

    async list(): Promise<CentroCustoRecord[]> {
      const rows = db.prepare('SELECT * FROM centros_custo WHERE ativo = 1 ORDER BY codigo').all().map((row) => ({
        codigo: String(row.codigo),
        nome: String(row.nome),
        ativo: Number(row.ativo),
      }))
      return rows.map((row) => ({ codigo: row.codigo, nome: row.nome, ativo: Boolean(row.ativo) }))
    },
  }
}
