'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Download, Upload, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/state-views'
import { cn } from '@/lib/utils'
import { formatBRL, formatNumber } from '@/lib/format'
import { malotes, postagens, type CentroCusto } from '@/lib/mock-data'
import { fetchCentrosCusto } from '@/lib/mock-api'
import { useAsyncData } from '@/lib/use-async-data'
import { usePagination } from '@/lib/use-pagination'
import { useCostCenters } from '@/lib/cost-centers-context'

function escapeCsvValue(value: string | number | undefined) {
  if (value === undefined || value === null) {
    return ''
  }

  const escaped = String(value).replace(/"/g, '""')
  return `"${escaped}"`
}

function downloadCentroCustoReport(centro: CentroCusto) {
  const rows: string[][] = [
    [
      'Tipo',
      'ID',
      'Origem',
      'Destino',
      'Valor',
      'Peso (kg)',
      'Chamado',
      'Status',
      'Atualizado em',
      'Confirmação',
    ],
  ]

  const relatedPostagens = postagens.filter((p) => p.centroCusto.startsWith(centro.codigo))
  const relatedMalotes = malotes.filter((m) => m.centroCusto.startsWith(centro.codigo))

  relatedPostagens.forEach((p) => {
    rows.push([
      'Postagem',
      p.codigo,
      p.remetente,
      p.destinatario,
      formatBRL(p.valor),
      p.pesoKg.toFixed(1),
      p.chamado ?? '',
      p.status || '',
      p.data || '',
      p.codigo,
    ])
  })

  relatedMalotes.forEach((m) => {
    rows.push([
      'Malote',
      m.id,
      m.origem,
      m.destino,
      formatBRL(m.valorEstimado),
      m.pesoKg.toFixed(1),
      m.chamado,
      m.status,
      m.atualizadoEm,
      m.confirmacao,
    ])
  })

  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-uso-${centro.codigo}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function CentrosCustoView() {
  const { data: centrosCusto, loading, error, retry } = useAsyncData(fetchCentrosCusto)
  const { centrosValidos, importarPlanilha } = useCostCenters()
  const [validosSearch, setValidosSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredValidos = centrosValidos.filter((item) => {
    const query = validosSearch.trim().toLowerCase()
    if (!query) return true
    return `${item.codigo} ${item.nome}`.toLowerCase().includes(query)
  })
  const validosPagination = usePagination(filteredValidos, 6)
  const centrosPagination = usePagination(centrosCusto ?? [], 6)

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      importarPlanilha(text)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  if (loading) return <LoadingState label="Carregando centros de custo..." />
  if (error) return <ErrorState message={error} onRetry={retry} />
  if (!centrosCusto) return null

  const totalGasto = centrosCusto.reduce((s, c) => s + c.gastoMes, 0)
  const totalOrcamento = centrosCusto.reduce((s, c) => s + c.orcamento, 0)
  const maisUtilizados = [...centrosCusto].sort((a, b) => b.postagens - a.postagens).slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="rounded-md border border-border bg-card px-4 py-2">
            <p className="text-xs text-muted-foreground">Total rateado no mês</p>
            <p className="text-lg font-semibold text-foreground">{formatBRL(totalGasto)}</p>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-2">
            <p className="text-xs text-muted-foreground">Orçamento consolidado (ano · Correios)</p>
            <p className="text-lg font-semibold text-foreground">{formatBRL(totalOrcamento)}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4" /> Exportar conciliação
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Centros de custo válidos</p>
              <p className="text-sm text-muted-foreground">Lista importada da planilha oficial de centros de custo.</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" /> Importar planilha (CSV)
              </Button>
            </div>
          </div>

          <input
            type="search"
            value={validosSearch}
            onChange={(event) => setValidosSearch(event.target.value)}
            placeholder="Pesquisar centro de custo por código ou nome"
            className="mt-4 w-full max-w-md rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredValidos.length === 0 ? (
              <EmptyState message="Nenhum centro de custo encontrado." />
            ) : (
              validosPagination.paginated.map((item) => (
                <div key={item.codigo} className="rounded-md border border-border bg-background p-3 text-sm">
                  <p className="font-mono text-xs text-primary">{item.codigo}</p>
                  <p className="mt-0.5 font-medium text-foreground">{item.nome || '—'}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <Pagination
          page={validosPagination.page}
          pageCount={validosPagination.pageCount}
          totalItems={validosPagination.totalItems}
          pageSize={validosPagination.pageSize}
          onPageChange={validosPagination.goToPage}
        />
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Centros de custo mais utilizados</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {maisUtilizados.map((c, index) => (
              <div key={c.codigo} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">{c.codigo}</span>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(c.postagens)} postagens</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {centrosPagination.paginated.map((c) => {
          const pct = (c.gastoMes / c.orcamento) * 100
          const estourado = c.gastoMes > c.orcamento
          return (
            <Card key={c.codigo}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{c.codigo}</span>
                      {estourado && <Badge variant="danger">Acima do orçamento</Badge>}
                    </div>
                    <p className="mt-1 text-lg font-semibold text-foreground">{c.nome}</p>
                    <p className="text-sm text-muted-foreground">{c.responsavel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Postagens</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatNumber(c.postagens)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatBRL(c.gastoMes)} de {formatBRL(c.orcamento)}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        estourado ? 'text-destructive' : 'text-foreground',
                      )}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        estourado ? 'bg-destructive' : 'bg-primary',
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="mt-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => downloadCentroCustoReport(c)}>
                      <Download className="size-4" /> Baixar relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Pagination
        page={centrosPagination.page}
        pageCount={centrosPagination.pageCount}
        totalItems={centrosPagination.totalItems}
        pageSize={centrosPagination.pageSize}
        onPageChange={centrosPagination.goToPage}
      />
    </div>
  )
}
