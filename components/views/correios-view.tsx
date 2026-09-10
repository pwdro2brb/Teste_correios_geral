'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, MapPin, Link2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { StatusBadge } from '@/components/status-badge'
import { Pagination } from '@/components/ui/pagination'
import { LoadingState, ErrorState } from '@/components/ui/state-views'
import { useProfile } from '@/components/profile-context'
import { formatBRL, formatDateBR, isToday } from '@/lib/format'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import { usePagination } from '@/lib/use-pagination'
import { useAsyncData } from '@/lib/use-async-data'
import { fetchPostagens } from '@/lib/mock-api'
import { useCostCenters } from '@/lib/cost-centers-context'
import { ContatoSalvo, Postagem, contatosSalvos, servicosCorreios } from '@/lib/mock-data'

type FormState = {
  remetenteNome: string
  destinatarioNome: string
  remetenteCep: string
  destinatarioCep: string
  remetenteRua: string
  destinatarioRua: string
  remetenteNumero: string
  destinatarioNumero: string
  remetenteComplemento: string
  destinatarioComplemento: string
  remetenteBairro: string
  destinatarioBairro: string
  remetenteCidade: string
  destinatarioCidade: string
  remetenteUf: string
  destinatarioUf: string
  peso: string
  altura: string
  largura: string
  comprimento: string
  conteudo: string
  servico: string
  chamado: string
  centroCusto: string
  fragil: boolean
  emailRemetente: string
  emailDestinatario: string
  telefoneDestinatario: string
}

const initialFormState: FormState = {
  remetenteNome: '',
  destinatarioNome: '',
  remetenteCep: '',
  destinatarioCep: '',
  remetenteRua: '',
  destinatarioRua: '',
  remetenteNumero: '',
  destinatarioNumero: '',
  remetenteComplemento: '',
  destinatarioComplemento: '',
  remetenteBairro: '',
  destinatarioBairro: '',
  remetenteCidade: '',
  destinatarioCidade: '',
  remetenteUf: 'MG',
  destinatarioUf: 'MG',
  peso: '',
  altura: '',
  largura: '',
  comprimento: '',
  conteudo: '',
  servico: servicosCorreios[0]?.tipo ?? 'PAC',
  chamado: '',
  centroCusto: 'CC-4021 · Engenharia',
  fragil: false,
  emailRemetente: '',
  emailDestinatario: '',
  telefoneDestinatario: '',
}

const centrosCustoListFallback: string[] = []

function formatAddress(address: Postagem['origem']) {
  const complemento = address.complemento ? `, ${address.complemento}` : ''
  return `${address.rua}, ${address.numero}${complemento} · ${address.bairro} · ${address.cidade}/${address.uf} · CEP ${address.cep}`
}

export function CorreiosView() {
  const { profile, role } = useProfile()
  const { formatOptions } = useCostCenters()
  const centrosCustoList = formatOptions().length > 0 ? formatOptions() : centrosCustoListFallback
  const { data: postagensData, loading, error, retry } = useAsyncData(fetchPostagens)
  const [postagensState, setPostagensState] = useState<Postagem[]>([])
  const [contatosState, setContatosState] = useState<ContatoSalvo[]>(contatosSalvos)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [onlyToday, setOnlyToday] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [selectedPost, setSelectedPost] = useState<Postagem | null>(null)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [editingContact, setEditingContact] = useState<ContatoSalvo | null>(null)
  const [selectedRemetenteId, setSelectedRemetenteId] = useState('')
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState('')
  const formRef = useScrollIntoView<HTMLDivElement>(showForm)
  const contactFormRef = useScrollIntoView<HTMLDivElement>(Boolean(editingContact), editingContact?.id)
  const detailsRef = useScrollIntoView<HTMLDivElement>(Boolean(selectedPost), selectedPost?.codigo)

  useEffect(() => {
    if (postagensData) setPostagensState(postagensData)
  }, [postagensData])

  const filteredPostagens = useMemo(() => {
    const query = search.trim().toLowerCase()

    return postagensState.filter((post) => {
      if (onlyToday && !isToday(post.data)) return false
      if (!query) return true
      const haystack = `${post.codigo} ${post.destinatario} ${post.remetente} ${post.cidade} ${post.chamado}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [onlyToday, postagensState, search])

  const postagensPagination = usePagination(filteredPostagens, 8)

  const total = postagensState.reduce((sum, post) => sum + post.valor, 0)
  const selectedService = servicosCorreios.find((servico) => servico.tipo === form.servico) ?? servicosCorreios[0]
  const estimatedValue = selectedService?.valorEstimado ?? 0

  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase()
    if (!query) return contatosState

    return contatosState.filter((contact) => {
      const haystack = `${contact.nome} ${contact.tipo} ${contact.endereco.cidade} ${contact.endereco.uf} ${contact.endereco.cep}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [contactSearch, contatosState])

  const canEditContact = (contact: ContatoSalvo) => role === 'admin' || contact.escopo === 'pessoal'

  function handleInputChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleContactChange(
    field: keyof ContatoSalvo['endereco'] | 'nome' | 'centroCusto' | 'telefone',
    value: string,
  ) {
    if (!editingContact) return

    setEditingContact((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...(field === 'nome' || field === 'centroCusto' || field === 'telefone'
          ? { [field]: value }
          : { endereco: { ...prev.endereco, [field]: value } }),
      }
    })
  }

  function saveEditedContact() {
    if (!editingContact) return

    setContatosState((prev) => {
      const exists = prev.some((contact) => contact.id === editingContact.id)
      return exists
        ? prev.map((contact) => (contact.id === editingContact.id ? editingContact : contact))
        : [editingContact, ...prev]
    })
    setEditingContact(null)
  }

  function createContact(tipo: ContatoSalvo['tipo']) {
    setEditingContact({
      id: `C-${Date.now()}`,
      tipo,
      nome: '',
      endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: 'MG', complemento: '' },
      centroCusto: 'CC-4021 · Engenharia',
      telefone: '',
      escopo: role === 'admin' ? 'universal' : 'pessoal',
    })
  }

  function applySavedContact(kind: 'remetente' | 'destinatario', contactId: string) {
    const contact = contatosState.find((item) => item.id === contactId)
    if (!contact) return

    if (kind === 'remetente') {
      setSelectedRemetenteId(contactId)
      setForm((prev) => ({
        ...prev,
        remetenteNome: contact.nome,
        remetenteCep: contact.endereco.cep,
        remetenteRua: contact.endereco.rua,
        remetenteNumero: contact.endereco.numero,
        remetenteComplemento: contact.endereco.complemento ?? '',
        remetenteBairro: contact.endereco.bairro,
        remetenteCidade: contact.endereco.cidade,
        remetenteUf: contact.endereco.uf,
        centroCusto: contact.centroCusto,
      }))
      return
    }

    setSelectedDestinatarioId(contactId)
    setForm((prev) => ({
      ...prev,
      destinatarioNome: contact.nome,
      destinatarioCep: contact.endereco.cep,
      destinatarioRua: contact.endereco.rua,
      destinatarioNumero: contact.endereco.numero,
      destinatarioComplemento: contact.endereco.complemento ?? '',
      destinatarioBairro: contact.endereco.bairro,
      destinatarioCidade: contact.endereco.cidade,
      destinatarioUf: contact.endereco.uf,
      telefoneDestinatario: contact.telefone,
      centroCusto: contact.centroCusto,
    }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const codigo = `BR${Date.now().toString().slice(-8)}SP`
    const novoRegistro: Postagem = {
      codigo,
      remetente: form.remetenteNome,
      destinatario: form.destinatarioNome,
      origem: {
        cep: form.remetenteCep,
        rua: form.remetenteRua,
        numero: form.remetenteNumero,
        bairro: form.remetenteBairro,
        cidade: form.remetenteCidade,
        uf: form.remetenteUf,
        complemento: form.remetenteComplemento,
      },
      destino: {
        cep: form.destinatarioCep,
        rua: form.destinatarioRua,
        numero: form.destinatarioNumero,
        bairro: form.destinatarioBairro,
        cidade: form.destinatarioCidade,
        uf: form.destinatarioUf,
        complemento: form.destinatarioComplemento,
      },
      cidade: `${form.destinatarioCidade}/${form.destinatarioUf}`,
      centroCusto: form.centroCusto,
      chamado: form.chamado,
      servico: form.servico,
      embalagem: form.fragil ? 'Plástico bolha' : 'Embalagem padrão',
      dimensoes: `${form.altura}x${form.largura}x${form.comprimento} cm`,
      pesoKg: Number(form.peso) || 0,
      fragil: form.fragil,
      status: 'postado',
      valor: estimatedValue,
      data: formatDateBR(),
      colaborador: profile.nome,
    }

    setPostagensState((prev) => [novoRegistro, ...prev])
    setSelectedPost(novoRegistro)

    setForm(initialFormState)
    setShowForm(false)
  }

  if (loading) return <LoadingState label="Carregando postagens..." />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por código, destinatário ou CEP"
          containerClassName="w-full max-w-md"
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={onlyToday ? 'default' : 'outline'}
            onClick={() => setOnlyToday((prev) => !prev)}
          >
            Envios de hoje
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Nova postagem
          </Button>
        </div>
      </div>

      {showForm && (
        <Card ref={formRef}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Nova postagem</p>
                <p className="text-sm text-muted-foreground">Preencha os dados do remetente, destinatário e o serviço para gerar a etiqueta e a DC-e.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Fechar
              </Button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/25 p-3">
                  <p className="mb-2 text-sm font-semibold text-foreground">Remetente</p>
                  <div className="grid gap-3">
                    <label className="space-y-1 text-sm">
                      Remetente *
                      <input
                        list="remetentes-list"
                        value={selectedRemetenteId}
                        onChange={(event) => {
                          setSelectedRemetenteId(event.target.value)
                          const contact = contatosState.find((item) => item.id === event.target.value)
                          if (contact) applySavedContact('remetente', contact.id)
                        }}
                        placeholder="Pesquisar remetente salvo"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <datalist id="remetentes-list">
                        {contatosState.filter((item) => item.tipo === 'remetente').map((item) => (
                          <option key={item.id} value={item.id}>{item.nome} - {item.endereco.cidade}/{item.endereco.uf}</option>
                        ))}
                      </datalist>
                    </label>
                    <input
                      value={form.remetenteNome}
                      onChange={(event) => handleInputChange('remetenteNome', event.target.value)}
                      placeholder="Nome da pessoa ou empresa"
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={form.emailRemetente}
                      onChange={(event) => handleInputChange('emailRemetente', event.target.value)}
                      placeholder="E-mail do remetente"
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-border bg-muted/25 p-3">
                  <p className="mb-2 text-sm font-semibold text-foreground">Destinatário</p>
                  <div className="grid gap-3">
                    <label className="space-y-1 text-sm">
                      Destinatário *
                      <input
                        list="destinatarios-list"
                        value={selectedDestinatarioId}
                        onChange={(event) => {
                          setSelectedDestinatarioId(event.target.value)
                          const contact = contatosState.find((item) => item.id === event.target.value)
                          if (contact) applySavedContact('destinatario', contact.id)
                        }}
                        placeholder="Pesquisar destinatário salvo"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <datalist id="destinatarios-list">
                        {contatosState.filter((item) => item.tipo === 'destinatario').map((item) => (
                          <option key={item.id} value={item.id}>{item.nome} - {item.endereco.cidade}/{item.endereco.uf}</option>
                        ))}
                      </datalist>
                    </label>
                    <input
                      value={form.destinatarioNome}
                      onChange={(event) => handleInputChange('destinatarioNome', event.target.value)}
                      placeholder="Nome da pessoa ou empresa"
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={form.emailDestinatario}
                      onChange={(event) => handleInputChange('emailDestinatario', event.target.value)}
                      placeholder="E-mail do destinatário"
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={form.telefoneDestinatario}
                      onChange={(event) => handleInputChange('telefoneDestinatario', event.target.value)}
                      placeholder="Telefone do destinatário"
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  CEP remetente *
                  <input
                    value={form.remetenteCep}
                    onChange={(event) => handleInputChange('remetenteCep', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Logradouro remetente *
                  <input
                    value={form.remetenteRua}
                    onChange={(event) => handleInputChange('remetenteRua', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Número remetente *
                  <input
                    value={form.remetenteNumero}
                    onChange={(event) => handleInputChange('remetenteNumero', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <label className="space-y-1 text-sm">
                  Complemento remetente
                  <input
                    value={form.remetenteComplemento}
                    onChange={(event) => handleInputChange('remetenteComplemento', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Bairro remetente *
                  <input
                    value={form.remetenteBairro}
                    onChange={(event) => handleInputChange('remetenteBairro', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Cidade remetente *
                  <input
                    value={form.remetenteCidade}
                    onChange={(event) => handleInputChange('remetenteCidade', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  UF remetente *
                  <input
                    value={form.remetenteUf}
                    onChange={(event) => handleInputChange('remetenteUf', event.target.value.toUpperCase())}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  CEP destinatário *
                  <input
                    value={form.destinatarioCep}
                    onChange={(event) => handleInputChange('destinatarioCep', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Logradouro destinatário *
                  <input
                    value={form.destinatarioRua}
                    onChange={(event) => handleInputChange('destinatarioRua', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Número destinatário *
                  <input
                    value={form.destinatarioNumero}
                    onChange={(event) => handleInputChange('destinatarioNumero', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <label className="space-y-1 text-sm">
                  Complemento destinatário
                  <input
                    value={form.destinatarioComplemento}
                    onChange={(event) => handleInputChange('destinatarioComplemento', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Bairro destinatário *
                  <input
                    value={form.destinatarioBairro}
                    onChange={(event) => handleInputChange('destinatarioBairro', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Cidade destinatário *
                  <input
                    value={form.destinatarioCidade}
                    onChange={(event) => handleInputChange('destinatarioCidade', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  UF destinatário *
                  <input
                    value={form.destinatarioUf}
                    onChange={(event) => handleInputChange('destinatarioUf', event.target.value.toUpperCase())}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  Serviço *
                  <select
                    value={form.servico}
                    onChange={(event) => handleInputChange('servico', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {servicosCorreios.map((servico) => (
                      <option key={servico.tipo} value={servico.tipo}>{servico.tipo}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  Peso *
                  <input
                    type="number"
                    step="0.1"
                    value={form.peso}
                    onChange={(event) => handleInputChange('peso', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Conteúdo *
                  <input
                    value={form.conteudo}
                    onChange={(event) => handleInputChange('conteudo', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <label className="space-y-1 text-sm">
                  Altura *
                  <input
                    type="number"
                    step="1"
                    value={form.altura}
                    onChange={(event) => handleInputChange('altura', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Largura *
                  <input
                    type="number"
                    step="1"
                    value={form.largura}
                    onChange={(event) => handleInputChange('largura', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Comprimento *
                  <input
                    type="number"
                    step="1"
                    value={form.comprimento}
                    onChange={(event) => handleInputChange('comprimento', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Chamado Agilis *
                  <input
                    value={form.chamado}
                    onChange={(event) => handleInputChange('chamado', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Centro de custo *
                  <input
                    list="centros-custo-list"
                    value={form.centroCusto}
                    onChange={(event) => handleInputChange('centroCusto', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <datalist id="centros-custo-list">
                    {centrosCustoList.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>
                <div className="flex flex-col justify-end gap-2 rounded-md border border-border bg-muted/25 p-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.fragil}
                      onChange={(event) => handleInputChange('fragil', event.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    Marcar como frágil
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm">Salvar postagem</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <div className="ml-auto text-sm font-medium text-foreground">Valor estimado: {formatBRL(estimatedValue)}</div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Postagens listadas</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{filteredPostagens.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Valor total</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatBRL(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Serviços disponíveis</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{servicosCorreios.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Contatos salvos</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => createContact('remetente')}>Novo remetente</Button>
                <Button size="sm" variant="outline" onClick={() => createContact('destinatario')}>Novo destinatário</Button>
              </div>
            </div>

            <SearchField
              type="search"
              value={contactSearch}
              onChange={(event) => setContactSearch(event.target.value)}
              placeholder="Pesquisar por nome, cidade, UF ou CEP"
              containerClassName="mt-4"
            />

            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="rounded-md border border-border bg-muted/25 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{contact.nome}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {contact.tipo === 'remetente' ? 'Remetente' : 'Destinatário'} · {contact.endereco.cidade}/{contact.endereco.uf}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{contact.endereco.rua}, {contact.endereco.numero} · {contact.endereco.cep}</p>
                    </div>
                    {canEditContact(contact) && (
                      <Button size="sm" variant="outline" onClick={() => setEditingContact(contact)}>Editar</Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhum contato encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Atenção ao enviar correspondências</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Para itens frágeis, use plástico bolha e identifique como frágil. A etiqueta padrão do Correios considera o serviço, peso e rastreio.
              </p>
            </div>
            <div className="grid gap-2">
              {servicosCorreios.map((servico) => (
                <div key={servico.tipo} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{servico.tipo}</p>
                      <p className="text-xs text-muted-foreground">{servico.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{servico.faixaPreco}</p>
                      <p className="text-xs text-muted-foreground">{servico.prazo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <Link2 className="mt-0.5 size-3.5" />
                <span>
                  Para distância longa, o PAC pode chegar em 10 a 14 dias úteis e o SEDEX em 4 a 5 dias úteis. Confira disponibilidade do SEDEX 12 em
                  {' '}
                  <a href="https://www2.correios.com.br/sistemas/encomendas/disponibilidadesedex12.cfm" target="_blank" rel="noreferrer" className="underline">
                    correios.com.br/sistemas/encomendas/disponibilidadesedex12.cfm
                  </a>
                  .
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingContact && (
        <Card ref={contactFormRef}>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground">{editingContact.nome ? 'Editar contato' : 'Novo contato'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                Nome
                <input
                  value={editingContact.nome}
                  onChange={(event) => handleContactChange('nome', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                Telefone
                <input
                  value={editingContact.telefone}
                  onChange={(event) => handleContactChange('telefone', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                CEP
                <input
                  value={editingContact.endereco.cep}
                  onChange={(event) => handleContactChange('cep', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                Rua
                <input
                  value={editingContact.endereco.rua}
                  onChange={(event) => handleContactChange('rua', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                Número
                <input
                  value={editingContact.endereco.numero}
                  onChange={(event) => handleContactChange('numero', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                Bairro
                <input
                  value={editingContact.endereco.bairro}
                  onChange={(event) => handleContactChange('bairro', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                Cidade
                <input
                  value={editingContact.endereco.cidade}
                  onChange={(event) => handleContactChange('cidade', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                UF
                <input
                  value={editingContact.endereco.uf}
                  onChange={(event) => handleContactChange('uf', event.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={saveEditedContact}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingContact(null)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Código</th>
                  <th className="px-5 py-3 font-medium">Destinatário</th>
                  <th className="px-5 py-3 font-medium">Serviço</th>
                  <th className="px-5 py-3 font-medium">Centro</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredPostagens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhuma postagem encontrada para o filtro atual.
                    </td>
                  </tr>
                ) : (
                  postagensPagination.paginated.map((post) => (
                    <tr key={post.codigo} onClick={() => setSelectedPost(post)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-foreground">{post.codigo}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{post.data}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-foreground">{post.destinatario}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> {post.cidade}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">{post.servico}</td>
                      <td className="px-5 py-3 text-muted-foreground">{post.centroCusto}</td>
                      <td className="px-5 py-3"><StatusBadge status={post.status} /></td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">{formatBRL(post.valor)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={postagensPagination.page}
            pageCount={postagensPagination.pageCount}
            totalItems={postagensPagination.totalItems}
            pageSize={postagensPagination.pageSize}
            onPageChange={postagensPagination.goToPage}
          />

          {selectedPost && (
            <div ref={detailsRef} className="border-t border-border bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Detalhes da postagem</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{selectedPost.codigo}</p>
                </div>
                <StatusBadge status={selectedPost.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border border-border bg-white p-3 text-sm sm:col-span-2 lg:col-span-3">
                  <p className="text-muted-foreground">Origem · {selectedPost.remetente}</p>
                  <p className="mt-1 font-medium text-foreground">{formatAddress(selectedPost.origem)}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm sm:col-span-2 lg:col-span-3">
                  <p className="text-muted-foreground">Destino · {selectedPost.destinatario}</p>
                  <p className="mt-1 font-medium text-foreground">{formatAddress(selectedPost.destino)}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Serviço</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.servico}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Valor</p>
                  <p className="mt-1 font-medium text-foreground">{formatBRL(selectedPost.valor)}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Criado por</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.colaborador}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Data da postagem</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.data}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Embalagem</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.embalagem}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Peso</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.pesoKg} kg</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Dimensões</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.dimensoes}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Centro de custo</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.centroCusto}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Chamado</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.chamado}</p>
                </div>
                <div className="rounded-md border border-border bg-white p-3 text-sm">
                  <p className="text-muted-foreground">Status</p>
                  <p className="mt-1 font-medium text-foreground">{selectedPost.status}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
