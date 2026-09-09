'use client'

import { useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchField } from '@/components/ui/search-field'
import { auditoria } from '@/lib/mock-data'

export function AuditoriaView() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return auditoria

    return auditoria.filter((item) =>
      [item.usuario, item.perfil, item.acao, item.entidade, item.ip].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [search])

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
                  <th className="px-5 py-3 font-medium">Origem (IP)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhum evento encontrado para o filtro atual.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.data}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{a.usuario}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline">{a.perfil}</Badge>
                      </td>
                      <td className="px-5 py-3 text-foreground">{a.acao}</td>
                      <td className="px-5 py-3 font-mono text-xs text-primary">{a.entidade}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
