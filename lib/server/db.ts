// Local SQLite persistence: zero external dependencies, uses Node's built-in node:sqlite.
// Swap this module for a real Postgres/MySQL client later without touching the repositories' public API.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

let db: DatabaseSync | null = null

function resolveDatabasePath() {
  const configured = process.env.DATABASE_URL || 'sqlite:./data/app.db'
  if (configured.startsWith('memory') || configured === ':memory:') return ':memory:'
  const filePath = configured.replace(/^sqlite:/, '')
  mkdirSync(dirname(filePath), { recursive: true })
  return filePath
}

function migrate(instance: DatabaseSync) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      role TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      senha_salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS postagens (
      id TEXT PRIMARY KEY,
      dados_json TEXT NOT NULL,
      codigo_rastreio TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS malotes (
      id TEXT PRIMARY KEY,
      dados_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contatos (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      dados_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS centros_custo (
      codigo TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS auditoria (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      acao TEXT NOT NULL,
      entidade TEXT NOT NULL,
      detalhes_json TEXT NOT NULL,
      ocorrido_em TEXT NOT NULL
    );
  `)
}

export function getDb(): DatabaseSync {
  if (db) return db
  db = new DatabaseSync(resolveDatabasePath())
  migrate(db)
  return db
}
