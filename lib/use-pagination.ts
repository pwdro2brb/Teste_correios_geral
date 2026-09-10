import { useMemo, useState } from 'react'

/** Client-side pagination for arrays that are already filtered/sorted. */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount)

  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount))
  }

  return {
    page: safePage,
    pageCount,
    paginated,
    goToPage,
    resetPage: () => setPage(1),
    totalItems: items.length,
    pageSize,
  }
}
