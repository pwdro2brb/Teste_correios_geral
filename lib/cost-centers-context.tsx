'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CentroCustoValido {
  codigo: string
  nome: string
}

// Seeded from the centros de custo mock; replaced entirely once a spreadsheet is imported.
const DEFAULT_CENTROS_VALIDOS: CentroCustoValido[] = [
  { codigo: 'CC-4021', nome: 'Engenharia' },
  { codigo: 'CC-1180', nome: 'Jurídico' },
  { codigo: 'CC-3302', nome: 'Suprimentos' },
  { codigo: 'CC-2205', nome: 'Administrativo' },
  { codigo: 'CC-5014', nome: 'Vendas' },
  { codigo: 'CC-7009', nome: 'Operações' },
]

function parseCentrosCustoFile(text: string): CentroCustoValido[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [codigo, ...rest] = line.split(/[;,\t]/)
      return { codigo: (codigo ?? '').trim(), nome: rest.join(' ').trim() }
    })
    .filter((item) => item.codigo && item.codigo.toLowerCase() !== 'codigo')
}

interface CostCentersContextValue {
  centrosValidos: CentroCustoValido[]
  /** Returns how many rows were imported (0 if the file was empty/invalid). */
  importarPlanilha: (fileText: string) => number
  formatOptions: () => string[]
}

const CostCentersContext = createContext<CostCentersContextValue | null>(null)

export function CostCentersProvider({ children }: { children: ReactNode }) {
  const [centrosValidos, setCentrosValidos] = useState<CentroCustoValido[]>(DEFAULT_CENTROS_VALIDOS)

  function importarPlanilha(fileText: string) {
    const parsed = parseCentrosCustoFile(fileText)
    if (parsed.length > 0) setCentrosValidos(parsed)
    return parsed.length
  }

  function formatOptions() {
    return centrosValidos.map((item) => (item.nome ? `${item.codigo} · ${item.nome}` : item.codigo))
  }

  return (
    <CostCentersContext.Provider value={{ centrosValidos, importarPlanilha, formatOptions }}>
      {children}
    </CostCentersContext.Provider>
  )
}

export function useCostCenters() {
  const ctx = useContext(CostCentersContext)
  if (!ctx) throw new Error('useCostCenters deve ser usado dentro de CostCentersProvider')
  return ctx
}
