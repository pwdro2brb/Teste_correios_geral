'use client'

import { Plus, Check, X, Route, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { formatBRL } from '@/lib/format'
import { percursos } from '@/lib/mock-data'
import { useProfile } from '@/components/profile-context'

export function PercursosView() {
  const { role } = useProfile()
  const podeAprovar = role === 'admin' || role === 'operador'
  const podeSolicitar = role === 'colaborador' || podeAprovar

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
              <span>Alternar o status de um percurso suspenso ou cancelado preserva histórico administrativo.</span>
            </div>
          </div>
        </div>
        {podeSolicitar && (
          <Button size="sm">
            <Plus className="size-4" /> Solicitar percurso
          </Button>
        )}
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
                {percursos.map((p) => (
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
                              <Button size="sm" variant="outline" className="h-8 px-2">
                                <Check className="size-4" /> Aprovar
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 px-2 text-destructive">
                                <X className="size-4" /> Reprovar
                              </Button>
                            </>
                          )}
                          {p.status === 'aprovado' && (
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              Suspender
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
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
