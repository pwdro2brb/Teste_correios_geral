'use client'

import { useMemo, useState } from 'react'
import {
  Wallet,
  Package,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  ChartNoAxesCombined,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { useProfile } from '@/components/profile-context'
import { cn } from '@/lib/utils'
import { formatBRL, formatNumber, formatPercent, isToday } from '@/lib/format'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import {
  kpis,
  postagens,
  custoMensal,
  centrosCusto,
  percursos,
  malotes,
  type Postagem,
} from '@/lib/mock-data'
import type { ModuleKey } from '@/lib/roles'

const rangeOptions = [
  { key: 'mes', label: 'Mês' },
  { key: '6meses', label: '6 meses' },
  { key: 'ano', label: 'Ano' },
  { key: 'tudo', label: 'Tudo até hoje' },
] as const

type RangeKey = (typeof rangeOptions)[number]['key']

function formatAddress(address: Postagem['origem']) {
  const complemento = address.complemento ? `, ${address.complemento}` : ''
  return `${address.rua}, ${address.numero}${complemento} · ${address.bairro} · ${address.cidade}/${address.uf} · CEP ${address.cep}`
}

const chartSeries: Record<RangeKey, { mes: string; valor: number }[]> = {
  mes: [
    { mes: '1', valor: 41000 },
    { mes: '5', valor: 54000 },
    { mes: '10', valor: 47000 },
    { mes: '15', valor: 62000 },
    { mes: '20', valor: 58000 },
    { mes: '25', valor: 69000 },
    { mes: '30', valor: 76000 },
  ],
  '6meses': [
    { mes: 'Fev', valor: 142000 },
    { mes: 'Mar', valor: 158000 },
    { mes: 'Abr', valor: 171000 },
    { mes: 'Mai', valor: 165000 },
    { mes: 'Jun', valor: 201000 },
    { mes: 'Jul', valor: 184320 },
  ],
  ano: [
    { mes: 'Jan', valor: 124000 },
    { mes: 'Fev', valor: 142000 },
    { mes: 'Mar', valor: 158000 },
    { mes: 'Abr', valor: 171000 },
    { mes: 'Mai', valor: 165000 },
    { mes: 'Jun', valor: 201000 },
    { mes: 'Jul', valor: 184320 },
    { mes: 'Ago', valor: 192000 },
    { mes: 'Set', valor: 210000 },
    { mes: 'Out', valor: 218500 },
    { mes: 'Nov', valor: 225000 },
    { mes: 'Dez', valor: 232000 },
  ],
  tudo: [
    { mes: '2019', valor: 790000 },
    { mes: '2020', valor: 920000 },
    { mes: '2021', valor: 1180000 },
    { mes: '2022', valor: 1540000 },
    { mes: '2023', valor: 1820000 },
    { mes: '2024', valor: 2140000 },
    { mes: '2025', valor: 2475000 },
    { mes: '2026', valor: 2840000 },
  ],
}

export function DashboardView({ onNavigate }: { onNavigate: (k: ModuleKey) => void }) {
  const { role, profile } = useProfile()
  const [range, setRange] = useState<RangeKey>('6meses')
  const [onlyToday, setOnlyToday] = useState(false)
  const [selectedPostagem, setSelectedPostagem] = useState<Postagem | null>(null)
  const detailsRef = useScrollIntoView<HTMLDivElement>(Boolean(selectedPostagem), selectedPostagem?.codigo)

  const postagensFiltered = useMemo(() => {
    const base =
      role === 'admin'
        ? postagens
        : role === 'operador'
          ? postagens.filter((p) => p.centroCusto.startsWith('CC-'))
          : postagens.filter((p) => p.colaborador === profile.nome)

    const scoped = onlyToday ? base.filter((p) => isToday(p.data)) : base
    return [...scoped].sort((a, b) => b.data.localeCompare(a.data))
  }, [onlyToday, role, profile.nome])

  const malotesFiltered = useMemo(() => {
    if (role === 'admin') return malotes
    if (role === 'operador') return malotes.filter((m) => m.status !== 'entregue')
    return malotes.filter((m) => m.solicitante === profile.nome)
  }, [role, profile.nome])

  const activeChartData = chartSeries[range]
  const maxCusto = Math.max(...activeChartData.map((m) => m.valor), 1)
  const pendentes = percursos.filter((p) => p.status === 'pendente')

  const dashboardKpis = useMemo(() => {
    const custoMes = postagensFiltered.reduce((sum, p) => sum + p.valor, 0)
    const postagensAtivas = postagensFiltered.filter((p) => p.status !== 'entregue').length
    const malotesTransito = malotesFiltered.filter((m) => m.status === 'em_transito').length
    const economia = Math.max(custoMes * 0.2, 12000)

    const cards = [
      {
        label: 'Custo logístico no mês',
        value: formatBRL(role === 'admin' ? kpis.custoMes : custoMes),
        variacao: role === 'admin' ? kpis.custoMesVariacao : 8.3,
        icon: Wallet,
        positiveIsGood: false,
        gradient: 'from-orange-50 to-orange-50/50',
        iconBg: 'bg-orange-100/60',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-200/50',
      },
      {
        label: 'Postagens ativas',
        value: formatNumber(role === 'admin' ? kpis.postagensAtivas : postagensAtivas),
        variacao: role === 'admin' ? kpis.postagensVariacao : 12.1,
        icon: Package,
        positiveIsGood: true,
        gradient: 'from-green-50 to-green-50/50',
        iconBg: 'bg-green-100/60',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200/50',
      },
      {
        label: 'Malotes em trânsito',
        value: formatNumber(role === 'admin' ? kpis.malotesTransito : malotesTransito),
        variacao: role === 'admin' ? kpis.malotesVariacao : -2.3,
        icon: Briefcase,
        positiveIsGood: true,
        gradient: 'from-cyan-50 to-cyan-50/50',
        iconBg: 'bg-cyan-100/60',
        iconColor: 'text-cyan-600',
        borderColor: 'border-cyan-200/50',
      },
      {
        label: 'Economia estimada',
        value: formatBRL(role === 'admin' ? kpis.economiaEstimada : economia),
        variacao: role === 'admin' ? kpis.economiaVariacao : 18.6,
        icon: TrendingUp,
        positiveIsGood: true,
        gradient: 'from-emerald-50 to-emerald-50/50',
        iconBg: 'bg-emerald-100/60',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200/50',
      },
    ]

    return cards
  }, [role, postagensFiltered, malotesFiltered, profile.nome])

  return (
    <div className="flex flex-col gap-6">
      {role === 'colaborador' && (
        <div className="rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50 to-green-50/50 p-4">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Filter className="size-4" />
            <span>Visualizando apenas os registros do usuário atual.</span>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((k) => {
          const Icon = k.icon
          const good = k.variacao > 0 === k.positiveIsGood
          const Trend = k.variacao > 0 ? TrendingUp : TrendingDown

          return (
            <Card
              key={k.label}
              className={cn('relative overflow-hidden border bg-gradient-to-br', k.gradient, k.borderColor)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className={cn('flex size-10 items-center justify-center rounded-lg', k.iconBg)}>
                    <Icon className={cn('size-5', k.iconColor)} />
                  </span>
                  <span className={cn('flex items-center gap-1 text-xs font-semibold', good ? 'text-green-600' : 'text-orange-600')}>
                    <Trend className="size-3.5" />
                    {formatPercent(k.variacao)}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{k.value}</p>
                <p className="mt-1 text-sm font-medium text-gray-600">{k.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Evolução de custos logísticos</CardTitle>
              <p className="mt-1 text-sm font-medium text-gray-500">Comparativo por período</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-white p-1">
              {rangeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRange(option.key)}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    range === option.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3">
              {activeChartData.map((item) => (
                <div key={item.mes} className="flex flex-1 flex-col items-center gap-2 group cursor-pointer" title={`${item.mes}: ${formatBRL(item.valor)}`}>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                    {(item.valor / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-green-400 transition-all group-hover:shadow-lg group-hover:from-green-600 group-hover:to-green-500"
                    style={{ height: `${(item.valor / maxCusto) * 180}px` }}
                  />
                  <span className="text-xs font-medium text-gray-500">{item.mes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Aprovações pendentes</CardTitle>
            <button onClick={() => onNavigate('percursos')} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Ver todos <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendentes.length === 0 && <p className="text-sm text-gray-500">Nenhuma pendência.</p>}
            {pendentes.map((p) => (
              <div key={p.id} className="group rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-green-300 hover:shadow-md hover:bg-green-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{p.id}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-gray-700">{p.destino}</p>
                <p className="mt-1 text-xs text-gray-500">{p.solicitante} · {formatBRL(p.custoEstimado)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Postagens recentes
              {role === 'colaborador' && <span className="ml-2 text-xs font-medium text-gray-500">(suas postagens)</span>}
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyToday((prev) => !prev)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs font-semibold transition-colors',
                  onlyToday
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700',
                )}
              >
                Envios de hoje
              </button>
              <button onClick={() => onNavigate('correios')} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                Abrir Correios <ArrowRight className="size-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-200 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Código</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Centro de custo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {postagensFiltered.slice(0, 5).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        {onlyToday ? 'Nenhum envio registrado hoje.' : 'Nenhuma postagem recente.'}
                      </td>
                    </tr>
                  ) : (
                    postagensFiltered.slice(0, 5).map((p) => (
                    <tr key={p.codigo} className="group border-b border-gray-200 last:border-0 hover:bg-green-50/50 transition-colors" onClick={() => setSelectedPostagem(p)}>
                      <td className="px-5 py-3 font-mono text-xs text-gray-700 group-hover:text-green-600">{p.codigo}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{p.centroCusto}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatBRL(p.valor)}</td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedPostagem && (
              <div ref={detailsRef} className="border-t border-gray-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Detalhes da postagem</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{selectedPostagem.codigo}</p>
                  </div>
                  <StatusBadge status={selectedPostagem.status} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-border bg-white p-3 text-sm sm:col-span-2">
                    <p className="text-muted-foreground">Origem · {selectedPostagem.remetente}</p>
                    <p className="mt-1 font-medium text-foreground">{formatAddress(selectedPostagem.origem)}</p>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3 text-sm sm:col-span-2">
                    <p className="text-muted-foreground">Destino · {selectedPostagem.destinatario}</p>
                    <p className="mt-1 font-medium text-foreground">{formatAddress(selectedPostagem.destino)}</p>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3 text-sm">
                    <p className="text-muted-foreground">Serviço</p>
                    <p className="mt-1 font-medium text-foreground">{selectedPostagem.servico}</p>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3 text-sm">
                    <p className="text-muted-foreground">Criado por</p>
                    <p className="mt-1 font-medium text-foreground">{selectedPostagem.colaborador}</p>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3 text-sm">
                    <p className="text-muted-foreground">Data de emissão</p>
                    <p className="mt-1 font-medium text-foreground">{selectedPostagem.data}</p>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3 text-sm">
                    <p className="text-muted-foreground">Valor</p>
                    <p className="mt-1 font-medium text-foreground">{formatBRL(selectedPostagem.valor)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Rateio por centro</CardTitle>
            <button onClick={() => onNavigate('centros-custo')} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Detalhes <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {centrosCusto.map((c) => {
              const pct = Math.min((c.gastoMes / c.orcamento) * 100, 100)
              const estourado = c.gastoMes > c.orcamento

              return (
                <div key={c.codigo} className="group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{c.nome}</span>
                    <span className="font-medium text-gray-600">{formatBRL(c.gastoMes)}</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn('h-full rounded-full transition-all', estourado ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-green-500 to-green-600')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatPercent((pct / 100) * 100)} do orçamento</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
