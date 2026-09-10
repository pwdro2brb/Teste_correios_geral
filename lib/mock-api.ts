// Simulated network layer: wraps the static mocks in async calls so views already
// handle loading/error states and can be pointed at a real API later without UI changes.
import {
  auditoria,
  centrosCusto,
  malotes,
  percursos,
  postagens,
  type AuditoriaEvento,
  type CentroCusto,
  type Malote,
  type Percurso,
  type Postagem,
} from './mock-data'

const LATENCY_MS = 400

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

export function fetchPostagens(): Promise<Postagem[]> {
  return delay(postagens)
}

export function fetchMalotes(): Promise<Malote[]> {
  return delay(malotes)
}

export function fetchPercursos(): Promise<Percurso[]> {
  return delay(percursos)
}

export function fetchAuditoria(): Promise<AuditoriaEvento[]> {
  return delay(auditoria)
}

export function fetchCentrosCusto(): Promise<CentroCusto[]> {
  return delay(centrosCusto)
}
