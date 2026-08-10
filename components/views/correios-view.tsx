'use client'

import { useState, type FormEvent } from 'react'
import { Plus, Search, Tag, MapPin, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { useProfile } from '@/components/profile-context'
import { formatBRL } from '@/lib/format'
import { ContatoSalvo, Postagem, contatosSalvos, postagens, servicosCorreios } from '@/lib/mock-data'

const initialFormState = {
  remetente: '',
  destinatario: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: 'MG',
  embalagem: '',
  dimensoes: '',
  peso: '',
  servico: servicosCorreios[0]?.tipo ?? 'PAC',
  chamado: '',
  centroCusto: 'CC-4021 · Engenharia',
  conteudo: '',
  fragil: false,
}

export function CorreiosView() {
  const { profile } = useProfile()
  const [postagensState, setPostagensState] = useState<Postagem[]>(postagens)
  const [contatosState, setContatosState] = useState<ContatoSalvo[]>(contatosSalvos)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [saveContact, setSaveContact] = useState(false)
  const [editingContact, setEditingContact] = useState<ContatoSalvo | null>(null)

  const total = postagensState.reduce((s, p) => s + p.valor, 0)

  const selectedService = servicosCorreios.find((servico) => servico.tipo === form.servico)
  const estimatedValue = selectedService ? selectedService.valorEstimado : 0

  function handleInputChange(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleContactChange(field: keyof ContatoSalvo['endereco'] | 'nome' | 'centroCusto' | 'telefone', value: string) {
    if (!editingContact) return
    setEditingContact({
      ...editingContact,
      ...(field === 'nome' || field === 'centroCusto' || field === 'telefone'
        ? { [field]: value }
        : { endereco: { ...editingContact.endereco, [field]: value } }),
    })
  }

  function saveEditedContact() {
    if (!editingContact) return
    setContatosState((prev) => prev.map((contact) => (contact.id === editingContact.id ? editingContact : contact)))
    setEditingContact(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const codigo = `BR${Date.now().toString().slice(-8)}SP`
    const novoRegistro: Postagem = {
      codigo,
      remetente: form.remetente,
      destinatario: form.destinatario,
      cidade: `${form.cidade}/${form.uf}`,
      centroCusto: form.centroCusto,
      chamado: form.chamado,
      servico: form.servico,
      embalagem: form.embalagem,
      dimensoes: form.dimensoes,
      pesoKg: Number(form.peso),
      fragil: Boolean(form.fragil),
      status: 'postado',
      valor: estimatedValue,
      data: new Date().toLocaleDateString('pt-BR'),
      colaborador: profile.nome,
    }

    setPostagensState((prev) => [novoRegistro, ...prev])

    if (saveContact) {
      setContatosState((prev) => [
        ...prev,
        {
          id: `C-${Date.now()}`,
          tipo: 'destinatario',
          nome: form.destinatario,
          endereco: {
            cep: form.cep,
            rua: form.rua,
            numero: form.numero,
            bairro: form.bairro,
            cidade: form.cidade,
            uf: form.uf,
          },
          centroCusto: form.centroCusto,
          telefone: '',
        },
      ])
    }

    setForm(initialFormState)
    setSaveContact(false)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por código, destinatário ou CEP"
              className="h-9 w-72 max-w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Tag className="size-4" /> Gerar etiquetas
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Nova postagem
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Nova postagem</p>
                <p className="text-sm text-muted-foreground">Preencha os dados para gerar etiqueta e DC-e.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Fechar
              </Button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Remetente
                  <input
                    value={form.remetente}
                    onChange={(event) => handleInputChange('remetente', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Destinatário
                  <input
                    value={form.destinatario}
                    onChange={(event) => handleInputChange('destinatario', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  CEP
                  <input
                    value={form.cep}
                    onChange={(event) => handleInputChange('cep', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Rua
                  <input
                    value={form.rua}
                    onChange={(event) => handleInputChange('rua', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Número
                  <input
                    value={form.numero}
                    onChange={(event) => handleInputChange('numero', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <label className="space-y-1 text-sm">
                  Bairro
                  <input
                    value={form.bairro}
                    onChange={(event) => handleInputChange('bairro', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Cidade
                  <input
                    value={form.cidade}
                    onChange={(event) => handleInputChange('cidade', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  UF
                  <input
                    value={form.uf}
                    onChange={(event) => handleInputChange('uf', event.target.value)}
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

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  Centro de custo
                  <input
                    value={form.centroCusto}
                    onChange={(event) => handleInputChange('centroCusto', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Serviço
                  <select
                    value={form.servico}
                    onChange={(event) => handleInputChange('servico', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {servicosCorreios.map((servico) => (
                      <option key={servico.tipo} value={servico.tipo}>
                        {servico.tipo}
                      </option>
                    ))}
                  </select>
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

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-1 text-sm">
                  Embalagem
                  <input
                    value={form.embalagem}
                    onChange={(event) => handleInputChange('embalagem', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Dimensões
                  <input
                    value={form.dimensoes}
                    onChange={(event) => handleInputChange('dimensoes', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Conteúdo
                  <input
                    value={form.conteudo}
                    onChange={(event) => handleInputChange('conteudo', event.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.fragil}
                    onChange={(event) => handleInputChange('fragil', event.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Marcar como frágil
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveContact}
                    onChange={(event) => setSaveContact(event.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Salvar destinatário para próximos envios
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm">
                  Salvar postagem
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <div className="text-sm text-muted-foreground">Valor estimado: {formatBRL(estimatedValue)}</div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Postagens listadas</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{postagensState.length}</p>
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

        <Card>
          <CardContent className="space-y-3 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Atenção ao enviar correspondências</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Para itens frágeis, recomendamos usar plástico bolha e identificar como frágil. A etiqueta padrão do Correios é gerada com base no serviço e no rastreio.
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
                      <p className="text-sm font-semibold text-foreground">{formatBRL(servico.valorEstimado)}</p>
                      <p className="text-xs text-muted-foreground">{servico.prazo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_0.6fr]">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground">Contatos salvos</p>
            <div className="mt-4 space-y-3">
              {contatosState.map((contato) => (
                <div key={contato.id} className="rounded-lg border border-border bg-muted/30 p-3">
                  {editingContact?.id === contato.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
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
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
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
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
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
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
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
                        <label className="space-y-1 text-sm">
                          CC
                          <input
                            value={editingContact.centroCusto}
                            onChange={(event) => handleContactChange('centroCusto', event.target.value)}
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditedContact}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingContact(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">{contato.nome}</p>
                      <p className="text-xs text-muted-foreground">{contato.telefone}</p>
                      <p className="text-xs text-muted-foreground">
                        {contato.endereco.rua}, {contato.endereco.numero} · {contato.endereco.bairro}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contato.endereco.cidade}/{contato.endereco.uf} · {contato.endereco.cep}
                      </p>
                      <p className="text-xs text-muted-foreground">CC: {contato.centroCusto}</p>
                      <div className="mt-3">
                        <Button size="sm" variant="outline" onClick={() => setEditingContact(contato)}>
                          Editar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Fluxo de etiqueta</p>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                Criar postagem
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">O Correios gera a etiqueta padrão e a DC-e quando os dados obrigatórios de remetente, destinatário e serviço são preenchidos.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Código de rastreio</th>
                  <th className="px-5 py-3 font-medium">Destinatário</th>
                  <th className="px-5 py-3 font-medium">Serviço</th>
                  <th className="px-5 py-3 font-medium">Centro de custo</th>
                  <th className="px-5 py-3 font-medium">Chamado</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {postagensState.map((p) => (
                  <tr key={p.codigo} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-foreground">{p.codigo}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{p.data}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-foreground">{p.destinatario}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {p.cidade}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground">{p.servico}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.centroCusto}</td>
                    <td className="px-5 py-3 font-mono text-xs text-primary">{p.chamado}</td>
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
    </div>
  )
}
