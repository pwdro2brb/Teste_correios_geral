'use client'

import { useMemo } from 'react'
import {
  Wallet,
  Package,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { useProfile } from '@/components/profile-context'
import { cn } from '@/lib/utils'
import { formatBRL, formatNumber, formatPercent } from '@/lib/format'
import {
  kpis,
  postagens,
  custoMensal,
  centrosCusto,
  percursos,
  malotes,
} from '@/lib/mock-data'
import type { ModuleKey } from '@/lib/roles'

export function DashboardView({ onNavigate }: { onNavigate: (k: ModuleKey) => void }) {
  const { role, profile } = useProfile()

  // Filtrar dados baseado no role
  const postagensFiltered = useMemo(() => {
    if (role === 'colaborador') {
      return postagens.filter((p) => p.colaborador === profile.nome)
    }
    return postagens
  }, [role, profile.nome])

  const malotesFiltered = useMemo(() => {
    if (role === 'colaborador') {
      return malotes.filter((m) => m.solicitante === profile.nome)
    }
    return malotes
  }, [role, profile.nome])

  const kpiCards = [
    {
      label: 'Custo logístico no mês',
      value: formatBRL(kpis.custoMes),
      variacao: kpis.custoMesVariacao,
      icon: Wallet,
      positiveIsGood: false,
      gradient: 'from-orange-50 to-orange-50/50',
      iconBg: 'bg-orange-100/60',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200/50',
    },
    {
      label: 'Postagens ativas',
      value: formatNumber(kpis.postagensAtivas),
      variacao: kpis.postagensVariacao,
      icon: Package,
      positiveIsGood: true,
      gradient: 'from-green-50 to-green-50/50',
      iconBg: 'bg-green-100/60',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200/50',
    },
    {
      label: 'Malotes em trânsito',
      value: formatNumber(kpis.malotesTransito),
      variacao: kpis.malotesVariacao,
      icon: Briefcase,
      positiveIsGood: true,
      gradient: 'from-cyan-50 to-cyan-50/50',
      iconBg: 'bg-cyan-100/60',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-200/50',
    },
    {
      label: 'Economia estimada',
      value: formatBRL(kpis.economiaEstimada),
      variacao: kpis.economiaVariacao,
      icon: TrendingUp,
      positiveIsGood: true,
      gradient: 'from-emerald-50 to-emerald-50/50',
      iconBg: 'bg-emerald-100/60',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/50',
    },
  ]

  const maxCusto = Math.max(...custoMensal.map((m) => m.valor))
  const pendentes = percursos.filter((p) => p.status === 'pendente')

  return (
    <div className="flex flex-col gap-6">
      {/* Filtro informativo para colaborador */}
      {role === 'colaborador' && (
        <div className="rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50 to-green-50/50 p-4">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Filter className="size-4" />
            <span>
              Visualizando apenas seus registros. Operadores e administradores veem dados de todos.
            </span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon
          const good = k.variacao > 0 === k.positiveIsGood
          const Trend = k.variacao > 0 ? TrendingUp : TrendingDown
          return (
            <Card
              key={k.label}
              className={cn(
                'relative overflow-hidden border bg-gradient-to-br',
                k.gradient,
                k.borderColor,
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className={cn('flex size-10 items-center justify-center rounded-lg', k.iconBg)}>
                    <Icon className={cn('size-5', k.iconColor)} />
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      good ? 'text-green-600' : 'text-orange-600',
                    )}
                  >
                    <Trend className="size-3.5" />
                    {formatPercent(k.variacao)}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                  {k.value}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">{k.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de custo mensal */}
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Evolução de custos logísticos
              </CardTitle>
              <p className="mt-1 text-sm font-medium text-gray-500">Últimos 6 meses (R$)</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3">
              {custoMensal.map((m) => (
                <div
                  key={m.mes}
                  className="flex flex-1 flex-col items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                    {(m.valor / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-green-400 transition-all group-hover:shadow-lg group-hover:from-green-600 group-hover:to-green-500"
                    style={{ height: `${(m.valor / maxCusto) * 180}px` }}
                  />
                  <span className="text-xs font-medium text-gray-500">{m.mes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aprovações pendentes */}
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Aprovações pendentes
            </CardTitle>
            <button
              onClick={() => onNavigate('percursos')}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendentes.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma pendência.</p>
            )}
            {pendentes.map((p) => (
              <div
                key={p.id}
                className="group rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-green-300 hover:shadow-md hover:bg-green-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {p.id}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-gray-700">{p.destino}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {p.solicitante} · {formatBRL(p.custoEstimado)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Postagens recentes */}
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Postagens recentes
              {role === 'colaborador' && (
                <span className="ml-2 text-xs font-medium text-gray-500">(suas postagens)</span>
              )}
            </CardTitle>
            <button
              onClick={() => onNavigate('correios')}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Abrir Correios <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-200 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">
                      Código
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">
                      Centro de custo
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {postagensFiltered.slice(0, 5).map((p, idx) => (
                    <tr
                      key={p.codigo}
                      className="group border-b border-gray-200 last:border-0 hover:bg-green-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-700 group-hover:text-green-600">
                        {p.codigo}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{p.centroCusto}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
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
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Rateio por centro
            </CardTitle>
            <button
              onClick={() => onNavigate('centros-custo')}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
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
                    <span className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {c.nome}
                    </span>
                    <span className="font-medium text-gray-600">{formatBRL(c.gastoMes)}</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        estourado
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatPercent((pct / 100) * 100)} do orçamento
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
