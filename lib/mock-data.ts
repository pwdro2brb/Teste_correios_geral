export const kpis = {
  custoMes: 184320.5,
  custoMesVariacao: -8.4,
  postagensAtivas: 342,
  postagensVariacao: 12.1,
  malotesTransito: 27,
  malotesVariacao: -3.2,
  economiaEstimada: 42180.0,
  economiaVariacao: 15.7,
}

export interface Endereco {
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  complemento?: string
}

export interface ContatoSalvo {
  id: string
  tipo: 'remetente' | 'destinatario'
  nome: string
  endereco: Endereco
  centroCusto: string
  telefone: string
}

export interface ServicoCorreio {
  tipo: string
  descricao: string
  prazo: string
  valorEstimado: number
}

export interface Postagem {
  codigo: string
  remetente: string
  destinatario: string
  cidade: string
  centroCusto: string
  chamado: string
  servico: string
  embalagem: string
  dimensoes: string
  pesoKg: number
  fragil: boolean
  status: 'postado' | 'em_transito' | 'entregue' | 'atrasado'
  valor: number
  data: string
}

export const servicosCorreios: ServicoCorreio[] = [
  {
    tipo: 'PAC',
    descricao: 'Entrega econômica com rastreio',
    prazo: '5-8 dias úteis',
    valorEstimado: 28.4,
  },
  {
    tipo: 'SEDEX',
    descricao: 'Entrega expressa com rastreio',
    prazo: '2-3 dias úteis',
    valorEstimado: 55.2,
  },
  {
    tipo: 'SEDEX 12',
    descricao: 'Entrega até às 12h do próximo dia útil',
    prazo: '1 dia útil',
    valorEstimado: 89.9,
  },
]

export const contatosSalvos: ContatoSalvo[] = [
  {
    id: 'C1',
    tipo: 'remetente',
    nome: 'Sede MRV - Belo Horizonte',
    endereco: {
      cep: '30170-010',
      rua: 'Av. do Contorno',
      numero: '6000',
      bairro: 'Funcionários',
      cidade: 'Belo Horizonte',
      uf: 'MG',
      complemento: 'Torre A',
    },
    centroCusto: 'CC-4021 · Engenharia',
    telefone: '(31) 3333-4444',
  },
  {
    id: 'C2',
    tipo: 'destinatario',
    nome: 'Obra Residencial Spazio',
    endereco: {
      cep: '13040-638',
      rua: 'Rua Orozimbo Maia',
      numero: '1201',
      bairro: 'Centro',
      cidade: 'Campinas',
      uf: 'SP',
    },
    centroCusto: 'CC-4021 · Engenharia',
    telefone: '(19) 3232-4455',
  },
]

export const postagens: Postagem[] = [
  {
    codigo: 'BR842391045SP',
    remetente: 'Sede MRV - Belo Horizonte',
    destinatario: 'Obra Residencial Spazio',
    cidade: 'Campinas/SP',
    centroCusto: 'CC-4021 · Engenharia',
    chamado: '#INC-20481',
    servico: 'PAC',
    embalagem: 'Caixa de papelão',
    dimensoes: '30x20x15 cm',
    pesoKg: 1.8,
    fragil: false,
    status: 'em_transito',
    valor: 38.9,
    data: '28/07/2026',
  },
  {
    codigo: 'BR842390932SP',
    remetente: 'Sede MRV - Belo Horizonte',
    destinatario: 'Cartório 3º Ofício',
    cidade: 'Belo Horizonte/MG',
    centroCusto: 'CC-1180 · Jurídico',
    chamado: '#INC-20477',
    servico: 'SEDEX',
    embalagem: 'Envelope resistente',
    dimensoes: '25x18x4 cm',
    pesoKg: 0.6,
    fragil: false,
    status: 'entregue',
    valor: 24.5,
    data: '27/07/2026',
  },
  {
    codigo: 'BR842388120SP',
    remetente: 'Sede MRV - Belo Horizonte',
    destinatario: 'Filial Regional Sul',
    cidade: 'Curitiba/PR',
    centroCusto: 'CC-3302 · Suprimentos',
    chamado: '#INC-20465',
    servico: 'SEDEX 12',
    embalagem: 'Caixa de papelão',
    dimensoes: '40x30x20 cm',
    pesoKg: 3.4,
    fragil: true,
    status: 'atrasado',
    valor: 52.3,
    data: '25/07/2026',
  },
  {
    codigo: 'BR842401288SP',
    remetente: 'Sede MRV - Belo Horizonte',
    destinatario: 'Prefeitura Municipal',
    cidade: 'Uberlândia/MG',
    centroCusto: 'CC-1180 · Jurídico',
    chamado: '#INC-20502',
    servico: 'PAC',
    embalagem: 'Envelope bolha',
    dimensoes: '28x20x5 cm',
    pesoKg: 0.9,
    fragil: false,
    status: 'postado',
    valor: 41.2,
    data: '28/07/2026',
  },
  {
    codigo: 'BR842399471SP',
    remetente: 'Sede MRV - Belo Horizonte',
    destinatario: 'Fornecedor Alvenaria Ltda',
    cidade: 'Goiânia/GO',
    centroCusto: 'CC-3302 · Suprimentos',
    chamado: '#INC-20498',
    servico: 'SEDEX',
    embalagem: 'Caixa de papelão',
    dimensoes: '35x25x18 cm',
    pesoKg: 2.2,
    fragil: false,
    status: 'entregue',
    valor: 29.9,
    data: '26/07/2026',
  },
]

export interface Malote {
  id: string
  rota: string
  origem: string
  destino: string
  status: 'aguardando' | 'em_transito' | 'entregue'
  responsavel: string
  centroCusto: string
  chamado: string
  conteudo: string
  pesoKg: number
  valorEstimado: number
  confirmacao: string
  ultimoEvento: string
  atualizadoEm: string
}

export interface MaloteRota {
  id: string
  origem: string
  destino: string
  ativo: boolean
}

export const maloteRotas: MaloteRota[] = [
  { id: 'R1', origem: 'Sede BH', destino: 'Regional SP', ativo: true },
  { id: 'R2', origem: 'Regional SP', destino: 'Obra Campinas/SP', ativo: true },
  { id: 'R3', origem: 'Sede BH', destino: 'Obra Contagem/MG', ativo: true },
  { id: 'R4', origem: 'Regional Sul', destino: 'Sede BH', ativo: false },
]

export const malotes: Malote[] = [
  {
    id: 'MAL-0912',
    rota: 'Sede BH → Regional SP',
    origem: 'Belo Horizonte/MG',
    destino: 'São Paulo/SP',
    status: 'em_transito',
    responsavel: 'Carlos Menezes',
    centroCusto: 'CC-4021 · Engenharia',
    chamado: '#INC-20508',
    conteudo: 'Contratos e documentos fiscais',
    pesoKg: 8.4,
    valorEstimado: 420.0,
    confirmacao: 'QR-4912',
    ultimoEvento: 'Coletado no ponto de origem',
    atualizadoEm: 'Hoje, 09:42',
  },
  {
    id: 'MAL-0908',
    rota: 'Regional SP → Obra Spazio',
    origem: 'São Paulo/SP',
    destino: 'Campinas/SP',
    status: 'aguardando',
    responsavel: 'Fernanda Lopes',
    centroCusto: 'CC-4021 · Engenharia',
    chamado: '#INC-20510',
    conteudo: 'Peças de proteção e etiquetas',
    pesoKg: 12.2,
    valorEstimado: 540.0,
    confirmacao: 'QR-4908',
    ultimoEvento: 'Aguardando coleta',
    atualizadoEm: 'Hoje, 08:15',
  },
  {
    id: 'MAL-0901',
    rota: 'Sede BH → Cartório 3º Ofício',
    origem: 'Belo Horizonte/MG',
    destino: 'Belo Horizonte/MG',
    status: 'entregue',
    responsavel: 'Carlos Menezes',
    centroCusto: 'CC-1180 · Jurídico',
    chamado: '#INC-20505',
    conteudo: 'Documentos assinados',
    pesoKg: 3.6,
    valorEstimado: 180.0,
    confirmacao: 'QR-4901',
    ultimoEvento: 'Entregue e protocolado',
    atualizadoEm: 'Ontem, 17:30',
  },
  {
    id: 'MAL-0898',
    rota: 'Regional Sul → Sede BH',
    origem: 'Curitiba/PR',
    destino: 'Belo Horizonte/MG',
    status: 'em_transito',
    responsavel: 'Roberto Dias',
    centroCusto: 'CC-3302 · Suprimentos',
    chamado: '#INC-20512',
    conteudo: 'Materiais de escritório',
    pesoKg: 10.5,
    valorEstimado: 450.0,
    confirmacao: 'QR-4898',
    ultimoEvento: 'Em trânsito - hub Curitiba',
    atualizadoEm: 'Hoje, 07:05',
  },
]

export interface Percurso {
  id: string
  solicitante: string
  origem: string
  destino: string
  frequencia: string
  custoEstimado: number
  status: 'pendente' | 'aprovado' | 'reprovado' | 'suspenso' | 'cancelado'
  data: string
}

export const percursos: Percurso[] = [
  {
    id: 'PER-115',
    solicitante: 'Ana Ribeiro',
    origem: 'Sede BH',
    destino: 'Obra Parque das Águas - Contagem/MG',
    frequencia: 'Semanal (2x)',
    custoEstimado: 1240.0,
    status: 'pendente',
    data: '28/07/2026',
  },
  {
    id: 'PER-112',
    solicitante: 'Marcos Vieira',
    origem: 'Regional SP',
    destino: 'Obra Jardim Sul - Sorocaba/SP',
    frequencia: 'Quinzenal',
    custoEstimado: 890.0,
    status: 'aprovado',
    data: '24/07/2026',
  },
  {
    id: 'PER-109',
    solicitante: 'Juliana Castro',
    origem: 'Sede BH',
    destino: 'Cartório Central - Vitória/ES',
    frequencia: 'Mensal',
    custoEstimado: 2100.0,
    status: 'reprovado',
    data: '20/07/2026',
  },
]

export interface Notificacao {
  id: string
  tipo: 'entrega' | 'solicitacao' | 'ocorrencia'
  titulo: string
  descricao: string
  tempo: string
  lida: boolean
}

export const notificacoes: Notificacao[] = [
  {
    id: 'N1',
    tipo: 'ocorrencia',
    titulo: 'Postagem atrasada',
    descricao: 'BR842388120SP está atrasada para Curitiba/PR (CC-3302).',
    tempo: 'há 12 min',
    lida: false,
  },
  {
    id: 'N2',
    tipo: 'solicitacao',
    titulo: 'Novo percurso solicitado',
    descricao: 'Ana Ribeiro solicitou a rota Sede BH → Contagem/MG (PER-115).',
    tempo: 'há 40 min',
    lida: false,
  },
  {
    id: 'N3',
    tipo: 'entrega',
    titulo: 'Malote entregue',
    descricao: 'MAL-0901 foi entregue e protocolado no Cartório 3º Ofício.',
    tempo: 'há 3 h',
    lida: true,
  },
  {
    id: 'N4',
    tipo: 'entrega',
    titulo: 'Postagem entregue',
    descricao: 'BR842390932SP entregue em Belo Horizonte/MG.',
    tempo: 'ontem',
    lida: true,
  },
]

export interface CentroCusto {
  codigo: string
  nome: string
  responsavel: string
  gastoMes: number
  orcamento: number
  postagens: number
}

export const centrosCusto: CentroCusto[] = [
  {
    codigo: 'CC-4021',
    nome: 'Engenharia',
    responsavel: 'Diretoria de Obras',
    gastoMes: 62400.0,
    orcamento: 80000.0,
    postagens: 128,
  },
  {
    codigo: 'CC-1180',
    nome: 'Jurídico',
    responsavel: 'Departamento Legal',
    gastoMes: 41200.0,
    orcamento: 45000.0,
    postagens: 94,
  },
  {
    codigo: 'CC-3302',
    nome: 'Suprimentos',
    responsavel: 'Compras Corporativo',
    gastoMes: 53800.0,
    orcamento: 50000.0,
    postagens: 76,
  },
  {
    codigo: 'CC-2205',
    nome: 'Administrativo',
    responsavel: 'Facilities',
    gastoMes: 26920.5,
    orcamento: 40000.0,
    postagens: 44,
  },
]

export interface AuditoriaEvento {
  id: string
  usuario: string
  perfil: string
  acao: string
  entidade: string
  data: string
  ip: string
}

export const auditoria: AuditoriaEvento[] = [
  {
    id: 'A1',
    usuario: 'Beatriz Almeida',
    perfil: 'Administrador',
    acao: 'Aprovou percurso',
    entidade: 'PER-112',
    data: '28/07/2026 10:12',
    ip: '10.24.8.14',
  },
  {
    id: 'A2',
    usuario: 'Carlos Menezes',
    perfil: 'Operador Logístico',
    acao: 'Registrou evento de malote',
    entidade: 'MAL-0912',
    data: '28/07/2026 09:42',
    ip: '10.24.8.32',
  },
  {
    id: 'A3',
    usuario: 'Ana Ribeiro',
    perfil: 'Colaborador',
    acao: 'Gerou postagem',
    entidade: 'BR842401288SP',
    data: '28/07/2026 08:57',
    ip: '10.24.9.05',
  },
  {
    id: 'A4',
    usuario: 'Beatriz Almeida',
    perfil: 'Administrador',
    acao: 'Reprovou percurso',
    entidade: 'PER-109',
    data: '20/07/2026 14:33',
    ip: '10.24.8.14',
  },
]

// Custo mensal por centro de custo (para gráfico de barras)
export const custoMensal = [
  { mes: 'Fev', valor: 142000 },
  { mes: 'Mar', valor: 158000 },
  { mes: 'Abr', valor: 171000 },
  { mes: 'Mai', valor: 165000 },
  { mes: 'Jun', valor: 201000 },
  { mes: 'Jul', valor: 184320 },
]
