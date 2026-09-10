'use client'

import { useCallback, useEffect, useState } from 'react'

interface AsyncDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Fetches async data (real API or the mock layer) and exposes loading/error/retry. */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Não foi possível carregar os dados.'
          setState({ data: null, loading: false, error: message })
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  useEffect(() => load(), [load])

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, retry }
}
