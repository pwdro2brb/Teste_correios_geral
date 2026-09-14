export const POSTAGEM_STATUS = ['rascunho', 'etiqueta_gerada', 'postado', 'em_transito', 'entregue', 'atrasado'] as const
export type PostagemStatus = (typeof POSTAGEM_STATUS)[number]

export const MALOTE_STATUS = ['aguardando_coleta', 'em_transito', 'entregue'] as const
export type MaloteStatus = (typeof MALOTE_STATUS)[number]

export const PERCURSO_STATUS = ['pendente', 'aprovado', 'reprovado', 'suspenso', 'cancelado'] as const
export type PercursoStatus = (typeof PERCURSO_STATUS)[number]

export function isPostagemStatus(value: string): value is PostagemStatus {
  return POSTAGEM_STATUS.includes(value as PostagemStatus)
}