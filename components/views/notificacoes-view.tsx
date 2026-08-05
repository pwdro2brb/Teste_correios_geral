'use client'

import { CheckCircle2, Route, AlertTriangle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { notificacoes } from '@/lib/mock-data'

const CONFIG = {
  entrega: {
    icon: CheckCircle2,
    tone: 'bg-[oklch(0.92_0.05_150)] text-[oklch(0.4_0.1_150)]',
    rotulo: 'Entrega',
  },
  solicitacao: {
    icon: Route,
    tone: 'bg-[oklch(0.93_0.03_240)] text-[oklch(0.45_0.12_250)]',
    rotulo: 'Solicitação',
  },
  ocorrencia: {
    icon: AlertTriangle,
    tone: 'bg-[oklch(0.93_0.05_25)] text-[oklch(0.5_0.18_25)]',
    rotulo: 'Ocorrência',
  },
} as const

export function NotificacoesView() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquare className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Integração com Microsoft Teams ativa
            </p>
            <p className="text-sm text-muted-foreground">
              Solicitações, entregas e ocorrências são notificadas automaticamente nos canais das equipes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Central de notificações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {notificacoes.map((n) => {
            const cfg = CONFIG[n.tipo]
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 rounded-md border border-border p-4',
                  !n.lida && 'bg-muted/40',
                )}
              >
                <span className={cn('flex size-9 items-center justify-center rounded-md', cfg.tone)}>
                  <Icon className="size-4.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                    {!n.lida && <span className="size-2 rounded-full bg-primary" aria-label="Não lida" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.descricao}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{n.tempo}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
