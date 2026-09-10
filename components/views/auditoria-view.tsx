'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchField } from '@/components/ui/search-field'
import { Pagination } from '@/components/ui/pagination'
import { LoadingState, ErrorState } from '@/components/ui/state-views'
import { type AuditoriaEvento } from '@/lib/mock-data'
import { fetchAuditoria } from '@/lib/mock-api'
import { useAsyncData } from '@/lib/use-async-data'
import { usePagination } from '@/lib/use-pagination'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'

export function AuditoriaView() {
  const { data: auditoriaData, loading, error, retry } = useAsyncData(fetchAuditoria)
  const [auditoriaState, setAuditoriaState] = useState<AuditoriaEvento[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AuditoriaEvento | null>(null)
  const detailsRef = useScrollIntoView<HTMLDivElement>(!!selected)

  useEffect(() => {
    if (auditoriaData) setAuditoriaState(auditoriaData)
  }, [auditoriaData])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return auditoriaState

    return auditoriaState.filter((item) =>
      [item.usuario, item.perfil, item.acao, item.entidade].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [search, auditoriaState])

  const auditoriaPagination = usePagination(filtered, 8)

  if (loading) return <LoadingState label="Carregando trilha de auditoria..." />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Trilha de auditoria completa</p>
            <p className="text-sm text-muted-foreground">
              Todas as ações são registradas com usuário, perfil, data e origem para governança e conformidade.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-sm">
        <SearchField
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por usuário, ação ou entidade"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Data e hora</th>
                  <th className="px-5 py-3 font-medium">Usuário</th>
                  <th className="px-5 py-3 font-medium">Perfil</th>
                  <th className="px-5 py-3 font-medium">Ação</th>
                  <th className="px-5 py-3 font-medium">Entidade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhum evento encontrado para o filtro atual.
                    </td>
                  </tr>
                ) : (
                  auditoriaPagination.paginated.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.data}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{a.usuario}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline">{a.perfil}</Badge>
                      </td>
                      <td className="px-5 py-3 text-foreground">{a.acao}</td>
                      <td className="px-5 py-3 font-mono text-xs text-primary">{a.entidade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={auditoriaPagination.page}
            pageCount={auditoriaPagination.pageCount}
            totalItems={auditoriaPagination.totalItems}
            pageSize={auditoriaPagination.pageSize}
            onPageChange={auditoriaPagination.goToPage}
          />

          {selected && (
            <div ref={detailsRef} className="border-t border-border bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Detalhes da ação</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{selected.acao}</p>
                </div>
                <Badge variant="outline">{selected.perfil}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Usuário</p>
                  <p className="mt-1 font-medium text-foreground">{selected.usuario}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Entidade</p>
                  <p className="mt-1 font-mono text-xs font-medium text-foreground">{selected.entidade}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Data e hora</p>
                  <p className="mt-1 font-medium text-foreground">{selected.data}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm sm:col-span-2">
                  <p className="text-muted-foreground">Descrição detalhada</p>
                  <p className="mt-1 font-medium text-foreground">{selected.detalhe}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
