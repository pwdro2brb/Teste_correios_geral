'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, Bell, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfile } from './profile-context'
import { ROLE_ORDER, ROLES } from '@/lib/roles'
import { NAV_ITEMS } from './nav-config'
import { notificacoes } from '@/lib/mock-data'
import type { ModuleKey } from '@/lib/roles'

interface TopbarProps {
  active: ModuleKey
  onMenuClick: () => void
  onNavigate: (key: ModuleKey) => void
}

export function Topbar({ active, onMenuClick, onNavigate }: TopbarProps) {
  const { role, profile, setRole } = useProfile()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = NAV_ITEMS.find((i) => i.key === active)
  const naoLidas = notificacoes.filter((n) => !n.lida).length

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="text-muted-foreground lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground md:text-lg">
            {current?.label ?? 'Painel'}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {current?.descricao}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('notificacoes')}
          className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
          {naoLidas > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {naoLidas}
            </span>
          )}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 hover:bg-muted"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {profile.iniciais}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-foreground">
                {profile.nome}
              </span>
              <span className="block text-xs text-muted-foreground">{profile.cargo}</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-popover p-2 shadow-lg">
              <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Simular perfil de acesso
              </p>
              {ROLE_ORDER.map((r) => {
                const p = ROLES[r]
                const selected = r === role
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md p-2 text-left hover:bg-muted',
                      selected && 'bg-muted',
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {p.iniciais}
                    </span>
                    <span className="flex-1 leading-tight">
                      <span className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{p.cargo}</span>
                        {selected && <Check className="size-4 text-primary" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {p.descricao}
                      </span>
                    </span>
                  </button>
                )
              })}
              <p className="mt-1 border-t border-border px-2 pt-2 text-[11px] leading-relaxed text-muted-foreground">
                Login real via Entra ID (SSO corporativo) na versão de produção.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
