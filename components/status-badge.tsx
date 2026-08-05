import { Badge } from '@/components/ui/badge'

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info'

const MAP: Record<string, { label: string; variant: Variant }> = {
  // postagens
  postado: { label: 'Postado', variant: 'info' },
  em_transito: { label: 'Em trânsito', variant: 'warning' },
  entregue: { label: 'Entregue', variant: 'success' },
  atrasado: { label: 'Atrasado', variant: 'danger' },
  // malotes
  aguardando: { label: 'Aguardando coleta', variant: 'secondary' },
  // percursos
  pendente: { label: 'Pendente', variant: 'warning' },
  aprovado: { label: 'Aprovado', variant: 'success' },
  reprovado: { label: 'Reprovado', variant: 'danger' },
  suspenso: { label: 'Suspenso', variant: 'outline' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] ?? { label: status, variant: 'secondary' as Variant }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
