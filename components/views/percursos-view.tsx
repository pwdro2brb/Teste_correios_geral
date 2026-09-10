'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Check, X, Route, ShieldAlert, PauseCircle, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { StatusBadge } from '@/components/status-badge'
import { Pagination } from '@/components/ui/pagination'
import { LoadingState, ErrorState } from '@/components/ui/state-views'
import { formatBRL } from '@/lib/format'
import { type Percurso } from '@/lib/mock-data'
import { fetchPercursos } from '@/lib/mock-api'
import { useAsyncData } from '@/lib/use-async-data'
import { usePagination } from '@/lib/use-pagination'
import { useProfile } from '@/components/profile-context'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'

const initialForm = {
  origem: '',
  destino: '',
  frequencia: '',
  custoEstimado: '',
}

export function PercursosView() {
  const { role, profile } = useProfile()
  const { data: percursosData, loading, error, retry } = useAsyncData(fetchPercursos)
  const [percursosState, setPercursosState] = useState<Percurso[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const podeAprovar = role === 'admin' || role === 'operador'
  const isAdmin = role === 'admin'
  const podeSolicitar = role === 'colaborador' || podeAprovar
  const formRef = useScrollIntoView<HTMLDivElement>(showForm)

  useEffect(() => {
    if (percursosData) setPercursosState(percursosData)
  }, [percursosData])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return percursosState

    return percursosState.filter((item) =>
      [item.id, item.solicitante, item.origem, item.destino, item.frequencia].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [search, percursosState])

  const percursosPagination = usePagination(filtered, 8)

  function updateStatus(id: string, status: Percurso['status']) {
    setPercursosState((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  function handleInputChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.origem || !form.destino) return

    const novoPercurso: Percurso = {
      id: `PER-${Date.now().toString().slice(-3)}`,
      solicitante: profile.nome,
      origem: form.origem,
      destino: form.destino,
      frequencia: form.frequencia || 'A definir',
      custoEstimado: Number(form.custoEstimado) || 0,
      status: isAdmin ? 'aprovado' : 'pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    }

    setPercursosState((prev) => [novoPercurso, ...prev])
    setForm(initialForm)
    setShowForm(false)
  }

  if (loading) return <LoadingState label="Carregando percursos..." />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Percursos de malote são fixos e devem ser cadastrados pelo administrador. O status pode ser ativo, suspenso ou cancelado.
          </p>
          <div className="rounded-md border border-border bg-accent/40 p-3 text-sm text-accent-foreground">
            <div className="flex items-start gap-2">
              <ShieldAlert className="size-4" />
              <span>Um percurso cancelado não pode ser reativado — é preciso cadastrar um novo. Percursos suspensos podem ser reativados ou cancelados.</span>
            </div>
          </div>
        </div>
        {podeSolicitar && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> {isAdmin ? 'Adicionar percurso' : 'Solicitar percurso'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card ref={formRef}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{isAdmin ? 'Adicionar percurso' : 'Solicitar percurso'}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? 'O percurso criado pelo administrador já entra como aprovado.' : 'O percurso solicitado fica pendente de aprovação.'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Fechar
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Origem *
                  <input
                    value={form.origem}
                    onChange={(event) => handleInputChange('origem', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Destino *
                  <input
                    value={form.destino}
                    onChange={(event) => handleInputChange('destino', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Frequência
                  <input
                    value={form.frequencia}
                    onChange={(event) => handleInputChange('frequencia', event.target.value)}
                    placeholder="Ex: Semanal (2x)"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Custo estimado (R$)
                  <input
                    type="number"
                    step="0.01"
                    value={form.custoEstimado}
                    onChange={(event) => handleInputChange('custoEstimado', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm">
                  {isAdmin ? 'Adicionar percurso' : 'Enviar solicitação'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="max-w-sm">
        <SearchField
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por rota, solicitante ou ID"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Solicitante</th>
                  <th className="px-5 py-3 font-medium">Rota</th>
                  <th className="px-5 py-3 font-medium">Frequência</th>
                  <th className="px-5 py-3 font-medium">Custo estimado</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {podeAprovar && <th className="px-5 py-3 text-right font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={podeAprovar ? 7 : 6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhum percurso corresponde ao filtro atual.
                    </td>
                  </tr>
                ) : (
                  percursosPagination.paginated.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{p.id}</td>
                      <td className="px-5 py-3 text-foreground">{p.solicitante}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Route className="size-3.5 text-muted-foreground" />
                          {p.origem} → {p.destino}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.frequencia}</td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatBRL(p.custoEstimado)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      {podeAprovar && (
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {p.status === 'pendente' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => updateStatus(p.id, 'aprovado')}>
                                  <Check className="size-4" /> Aprovar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" onClick={() => updateStatus(p.id, 'reprovado')}>
                                  <X className="size-4" /> Reprovar
                                </Button>
                              </>
                            )}
                            {p.status === 'aprovado' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => updateStatus(p.id, 'suspenso')}>
                                  <PauseCircle className="size-4" /> Suspender
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" onClick={() => updateStatus(p.id, 'cancelado')}>
                                  <X className="size-4" /> Cancelar
                                </Button>
                              </>
                            )}
                            {p.status === 'suspenso' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => updateStatus(p.id, 'aprovado')}>
                                  <PlayCircle className="size-4" /> Reativar
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" onClick={() => updateStatus(p.id, 'cancelado')}>
                                  <X className="size-4" /> Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={percursosPagination.page}
            pageCount={percursosPagination.pageCount}
            totalItems={percursosPagination.totalItems}
            pageSize={percursosPagination.pageSize}
            onPageChange={percursosPagination.goToPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
