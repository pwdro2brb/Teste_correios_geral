'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, QrCode, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Pagination } from '@/components/ui/pagination'
import { LoadingState, ErrorState } from '@/components/ui/state-views'
import { formatBRL } from '@/lib/format'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import { usePagination } from '@/lib/use-pagination'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchMalotes } from '@/lib/mock-api'
import { type Malote, maloteRotas } from '@/lib/mock-data'
import { useProfile } from '@/components/profile-context'

const initialMaloteForm = {
  rotaId: maloteRotas[0]?.id ?? '',
  quemEnviou: '',
  quemRecebe: '',
  chamado: '',
  centroCusto: 'CC-4021 · Engenharia',
  conteudo: '',
  peso: '',
}

export function MalotesView() {
  const { role, profile } = useProfile()
  const { data: malotesData, loading, error, retry } = useAsyncData(fetchMalotes)
  const [malotesState, setMalotesState] = useState<Malote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialMaloteForm)
  const formRef = useScrollIntoView<HTMLDivElement>(showForm)
  const malotesPagination = usePagination(malotesState, 4)

  useEffect(() => {
    if (malotesData) setMalotesState(malotesData)
  }, [malotesData])

  const regionalRoutes = maloteRotas.filter((rota) => role === 'admin' || rota.regional === profile.regional)
  const activeRoutes = regionalRoutes.filter((rota) => rota.ativo)
  const selectedRoute = maloteRotas.find((rota) => rota.id === form.rotaId) ?? maloteRotas[0]

  function podeGerenciar(malote: Malote) {
    return role === 'admin' || role === 'operador' || malote.solicitante === profile.nome
  }

  function handleInputChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selectedRoute) return

    const newMalote: Malote = {
      id: `MAL-${Date.now().toString().slice(-4)}`,
      rota: `${selectedRoute.origem} → ${selectedRoute.destino}`,
      origem: selectedRoute.origem,
      destino: selectedRoute.destino,
      status: 'aguardando_coleta',
      responsavel: form.quemEnviou || 'Não informado',
      centroCusto: form.centroCusto,
      chamado: form.chamado,
      conteudo: form.conteudo,
      pesoKg: Number(form.peso) || 0,
      valorEstimado: 0,
      confirmacao: `QR-${Date.now().toString().slice(-4)}`,
      ultimoEvento: 'Registrado e aguardando coleta',
      atualizadoEm: new Date().toLocaleDateString('pt-BR'),
      solicitante: 'Usuário atual',
    }

    setMalotesState((prev) => [newMalote, ...prev])
    setForm(initialMaloteForm)
    setShowForm(false)
  }

  function updateMaloteStatus(id: string, status: 'aguardando_coleta' | 'em_transito' | 'entregue') {
    setMalotesState((prev) =>
      prev.map((malote) =>
        malote.id === id
          ? {
              ...malote,
              status,
              ultimoEvento:
                status === 'em_transito'
                  ? 'Malote em trânsito'
                  : status === 'entregue'
                    ? 'Malote entregue - aguardando confirmação'
                    : 'Aguardando coleta',
              atualizadoEm: new Date().toLocaleDateString('pt-BR'),
            }
          : malote,
      ),
    )
  }

  function concluirMalote(id: string) {
    setMalotesState((prev) =>
      prev.map((malote) =>
        malote.id === id
          ? { ...malote, concluido: true, ultimoEvento: 'Malote concluído pela administração', atualizadoEm: new Date().toLocaleDateString('pt-BR') }
          : malote,
      ),
    )
  }

  if (loading) return <LoadingState label="Carregando malotes..." />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-md border border-dashed border-border bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
          <span className="inline-flex items-center gap-1.5">
            <QrCode className="size-4" /> Rotas fixas de malote por regional e destino ativo
          </span>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-4" /> Registrar malote
        </Button>
      </div>

      {showForm && (
        <Card ref={formRef}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Registrar novo malote</p>
                <p className="text-sm text-muted-foreground">Informe a rota, suporte, responsável e o chamado do pedido.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Fechar
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Rota de malote
                  <select
                    value={form.rotaId}
                    onChange={(event) => handleInputChange('rotaId', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {maloteRotas.map((rota) => (
                      <option key={rota.id} value={rota.id}>
                        {rota.origem} → {rota.destino}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  Centro de custo
                  <input
                    value={form.centroCusto}
                    onChange={(event) => handleInputChange('centroCusto', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  Quem enviou
                  <input
                    value={form.quemEnviou}
                    onChange={(event) => handleInputChange('quemEnviou', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Quem recebe
                  <input
                    value={form.quemRecebe}
                    onChange={(event) => handleInputChange('quemRecebe', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Chamado Agilis
                  <input
                    value={form.chamado}
                    onChange={(event) => handleInputChange('chamado', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Conteúdo do malote
                  <input
                    value={form.conteudo}
                    onChange={(event) => handleInputChange('conteudo', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Peso (kg)
                  <input
                    type="number"
                    step="0.1"
                    value={form.peso}
                    onChange={(event) => handleInputChange('peso', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm">
                  Registrar malote
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_0.7fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Malotes em controle</CardTitle>
              <p className="text-sm text-muted-foreground">Acompanhamento por status, responsável e confirmação de entrega.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Rotas ativas</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{activeRoutes.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Origem fixa</p>
                <p className="mt-1 text-lg font-semibold text-foreground">Sede / Regional</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Envios em andamento</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{malotesState.filter((m) => m.status !== 'entregue').length}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="mt-0.5 size-4" />
                <div>
                  <p className="font-semibold text-foreground">Atenção ao malote</p>
                  <p>Os itens frágeis devem ser encaminhados com embalagem adequada. O status acompanha a pessoa que abriu o chamado e a administração.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground">Rotas fixas de malote</p>
            <p className="text-xs text-muted-foreground">{role === 'admin' ? 'Todas as regionais' : `Regional ${profile.regional}`}</p>
            <div className="mt-4 space-y-3">
              {activeRoutes.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma rota ativa para esta regional.</p>
              )}
              {activeRoutes.map((rota) => (
                <div key={rota.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{rota.origem} → {rota.destino}</p>
                    <p className="text-xs text-muted-foreground">Ativa</p>
                  </div>
                  <span className="text-xs font-medium text-foreground">{rota.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {malotesPagination.paginated.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{m.id}</CardTitle>
                <p className="text-sm text-muted-foreground">{m.rota}</p>
              </div>
              <StatusBadge status={m.status} />
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 rounded-lg border border-border bg-background p-4 text-sm">
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Origem</span><span className="font-medium text-foreground">{m.origem}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Destino</span><span className="font-medium text-foreground">{m.destino}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Centro de custo</span><span className="font-medium text-foreground">{m.centroCusto}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Chamado</span><span className="font-medium text-foreground">{m.chamado}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Peso</span><span className="font-medium text-foreground">{m.pesoKg.toFixed(1)} kg</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Confirmação</span><span className="font-mono text-xs text-foreground">{m.confirmacao}</span></div>
              </div>

              <div className="rounded-lg bg-card p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <QrCode className="size-4 text-primary" />
                  <span>Rastreio interno do malote</span>
                </div>
              </div>

              {podeGerenciar(m) ? (
                <div className="flex flex-wrap gap-2">
                  {m.status === 'aguardando_coleta' && (
                    <Button size="sm" onClick={() => updateMaloteStatus(m.id, 'em_transito')}>
                      Iniciar trânsito
                    </Button>
                  )}
                  {m.status === 'em_transito' && (
                    <>
                      <Button size="sm" onClick={() => updateMaloteStatus(m.id, 'entregue')}>Marcar entregue</Button>
                      <Button size="sm" variant="outline" onClick={() => updateMaloteStatus(m.id, 'aguardando_coleta')}>Reabrir</Button>
                    </>
                  )}
                  {m.status === 'entregue' && !m.concluido && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateMaloteStatus(m.id, 'em_transito')}>Voltar para trânsito</Button>
                      {role === 'admin' && (
                        <Button size="sm" onClick={() => concluirMalote(m.id)}>
                          <CheckCircle2 className="size-4" /> Concluir
                        </Button>
                      )}
                    </>
                  )}
                  {m.status === 'entregue' && m.concluido && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                      <CheckCircle2 className="size-4" /> Concluído pela administração
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Somente o solicitante ou a administração podem alterar o status deste malote.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination
        page={malotesPagination.page}
        pageCount={malotesPagination.pageCount}
        totalItems={malotesPagination.totalItems}
        pageSize={malotesPagination.pageSize}
        onPageChange={malotesPagination.goToPage}
      />
    </div>
  )
}
