import { useEffect, useRef } from 'react'

export function useScrollIntoView<T extends HTMLElement>(active: boolean, key?: string) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active || !ref.current) return
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [active, key])

  return ref
}
