'use client'

import {
  Wallet,
  Package,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'
import { formatBRL, formatNumber, formatPercent } from '@/lib/format'
import {
  kpis,
  postagens,
  custoMensal,
  centrosCusto,
  percursos,
} from '@/lib/mock-data'
import type { ModuleKey } from '@/lib/roles'

const kpiCards = [
  {
    label: 'Custo logístico no mês',
    value: formatBRL(kpis.custoMes),
    variacao: kpis.custoMesVariacao,
    icon: Wallet,
    positiveIsGood: false,
  },
  {
    label: 'Postagens ativas',
    value: formatNumber(kpis.postagensAtivas),
    variacao: kpis.postagensVariacao,
    icon: Package,
    positiveIsGood: true,
  },
  {
    label: 'Malotes em trânsito',
    value: formatNumber(kpis.malotesTransito),
    variacao: kpis.malotesVariacao,
    icon: Briefcase,
    positiveIsGood: true,
  },
  {
    label: 'Economia estimada',
    value: formatBRL(kpis.economiaEstimada),
    variacao: kpis.economiaVariacao,
    icon: TrendingUp,
    positiveIsGood: true,
  },
]

export function DashboardView({ onNavigate }: { onNavigate: (k: ModuleKey) => void }) {
  const maxCusto = Math.max(...custoMensal.map((m) => m.valor))
  const pendentes = percursos.filter((p) => p.status === 'pendente')

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon
          const good = k.variacao > 0 === k.positiveIsGood
          const Trend = k.variacao > 0 ? TrendingUp : TrendingDown
          return (
            <Card key={k.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      good ? 'text-[oklch(0.5_0.13_150)]' : 'text-destructive',
                    )}
                  >
                    <Trend className="size-3.5" />
                    {formatPercent(k.variacao)}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {k.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de custo mensal */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Evolução de custos logísticos</CardTitle>
              <p className="text-sm text-muted-foreground">Últimos 6 meses (R$)</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3">
              {custoMensal.map((m) => (
                <div key={m.mes} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {(m.valor / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary transition-all"
                    style={{ height: `${(m.valor / maxCusto) * 180}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{m.mes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Percursos pendentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Aprovações pendentes</CardTitle>
            <button
              onClick={() => onNavigate('percursos')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendentes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma pendência.</p>
            )}
            {pendentes.map((p) => (
              <div key={p.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{p.id}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-sm text-foreground">{p.destino}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.solicitante} · {formatBRL(p.custoEstimado)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Postagens recentes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Postagens recentes</CardTitle>
            <button
              onClick={() => onNavigate('correios')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Abrir Correios <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Código</th>
                    <th className="px-5 py-2.5 font-medium">Centro de custo</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {postagens.slice(0, 5).map((p) => (
                    <tr key={p.codigo} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">
                        {p.codigo}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.centroCusto}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">
                        {formatBRL(p.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Rateio por centro de custo */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Rateio por centro</CardTitle>
            <button
              onClick={() => onNavigate('centros-custo')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Detalhes <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {centrosCusto.map((c) => {
              const pct = Math.min((c.gastoMes / c.orcamento) * 100, 100)
              const estourado = c.gastoMes > c.orcamento
              return (
                <div key={c.codigo}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.nome}</span>
                    <span className="text-muted-foreground">{formatBRL(c.gastoMes)}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        estourado ? 'bg-destructive' : 'bg-primary',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
