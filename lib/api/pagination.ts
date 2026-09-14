export interface PageQuery {
  page: number
  pageSize: number
}

export interface Page<T> extends PageQuery {
  items: T[]
  totalItems: number
  totalPages: number
}

export function parsePageQuery(searchParams: URLSearchParams): PageQuery {
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 20) || 20))
  return { page, pageSize }
}

export function toPage<T>(items: T[], query: PageQuery): Page<T> {
  const start = (query.page - 1) * query.pageSize
  return {
    items: items.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / query.pageSize)),
  }
}