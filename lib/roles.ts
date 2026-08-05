export type Role = 'colaborador' | 'operador' | 'admin'

export type ModuleKey =
  | 'dashboard'
  | 'correios'
  | 'malotes'
  | 'percursos'
  | 'notificacoes'
  | 'centros-custo'
  | 'auditoria'

export interface RoleProfile {
  id: Role
  nome: string
  cargo: string
  descricao: string
  iniciais: string
  modules: ModuleKey[]
}

export const ROLES: Record<Role, RoleProfile> = {
  colaborador: {
    id: 'colaborador',
    nome: 'Ana Ribeiro',
    cargo: 'Colaboradora',
    descricao: 'Cria postagens, acompanha rastreios e solicita novos percursos.',
    iniciais: 'AR',
    modules: ['dashboard', 'correios', 'malotes', 'percursos', 'notificacoes'],
  },
  operador: {
    id: 'operador',
    nome: 'Carlos Menezes',
    cargo: 'Operador Logístico',
    descricao: 'Processa malotes, registra eventos e gerencia rotas ativas.',
    iniciais: 'CM',
    modules: [
      'dashboard',
      'correios',
      'malotes',
      'percursos',
      'notificacoes',
      'centros-custo',
    ],
  },
  admin: {
    id: 'admin',
    nome: 'Beatriz Almeida',
    cargo: 'Administradora',
    descricao: 'Governança total, aprovações, rateios e auditoria completa.',
    iniciais: 'BA',
    modules: [
      'dashboard',
      'correios',
      'malotes',
      'percursos',
      'notificacoes',
      'centros-custo',
      'auditoria',
    ],
  },
}

export const ROLE_ORDER: Role[] = ['colaborador', 'operador', 'admin']
