import type { CriarPostagemInput } from '@/lib/validation/postagem'

export interface PostagemRecord extends CriarPostagemInput {
  id: string
  codigoRastreio?: string
  status: 'rascunho' | 'etiqueta_gerada' | 'postado' | 'em_transito' | 'entregue' | 'atrasado'
  createdAt: string
  updatedAt: string
}

export interface PostagemRepository {
  create: (input: CriarPostagemInput) => Promise<PostagemRecord>
  findById: (id: string) => Promise<PostagemRecord | null>
}

export function createUnavailablePostagemRepository(): PostagemRepository {
  return {
    async create() {
      throw new Error('DATABASE_URL não configurada: persistência de postagens indisponível.')
    },
    async findById() {
      throw new Error('DATABASE_URL não configurada: persistência de postagens indisponível.')
    },
  }
}