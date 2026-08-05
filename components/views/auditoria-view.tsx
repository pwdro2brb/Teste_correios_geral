'use client'

import { Search, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { auditoria } from '@/lib/mock-data'

export function AuditoriaView() {
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

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar por usuário, ação ou entidade"
          className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                {auditoria.map((a) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
