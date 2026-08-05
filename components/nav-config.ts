import {
  LayoutDashboard,
  Package,
  Briefcase,
  Route,
  Bell,
  Wallet,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleKey } from '@/lib/roles'

export interface NavItem {
  key: ModuleKey
  label: string
  icon: LucideIcon
  descricao: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Painel Geral',
    icon: LayoutDashboard,
    descricao: 'Visão executiva de custos e operação',
  },
  {
    key: 'correios',
    label: 'Correios',
    icon: Package,
    descricao: 'Postagens, rastreios e etiquetas',
  },
  {
    key: 'malotes',
    label: 'Malotes',
    icon: Briefcase,
    descricao: 'Movimentação e eventos logísticos',
  },
  {
    key: 'percursos',
    label: 'Percursos',
    icon: Route,
    descricao: 'Solicitação e análise de novas rotas',
  },
  {
    key: 'notificacoes',
    label: 'Notificações',
    icon: Bell,
    descricao: 'Acompanhamento e integração Teams',
  },
  {
    key: 'centros-custo',
    label: 'Centros de Custo',
    icon: Wallet,
    descricao: 'Rateio e conciliação financeira',
  },
  {
    key: 'auditoria',
    label: 'Auditoria',
    icon: ShieldCheck,
    descricao: 'Trilha completa de ações',
  },
]
