'use client'

import { Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatBRL, formatNumber } from '@/lib/format'
import { centrosCusto, malotes, postagens, CentroCusto } from '@/lib/mock-data'

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
  const totalGasto = centrosCusto.reduce((s, c) => s + c.gastoMes, 0)
  const totalOrcamento = centrosCusto.reduce((s, c) => s + c.orcamento, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="rounded-md border border-border bg-card px-4 py-2">
            <p className="text-xs text-muted-foreground">Total rateado no mês</p>
            <p className="text-lg font-semibold text-foreground">{formatBRL(totalGasto)}</p>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-2">
            <p className="text-xs text-muted-foreground">Orçamento consolidado</p>
            <p className="text-lg font-semibold text-foreground">{formatBRL(totalOrcamento)}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4" /> Exportar conciliação
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {centrosCusto.map((c) => {
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
    </div>
  )
}
