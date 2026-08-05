'use client'

import { Truck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-config'
import { useProfile } from './profile-context'
import type { ModuleKey } from '@/lib/roles'

interface SidebarProps {
  active: ModuleKey
  onNavigate: (key: ModuleKey) => void
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ active, onNavigate, mobileOpen, onClose }: SidebarProps) {
  const { profile } = useProfile()
  const items = NAV_ITEMS.filter((item) => profile.modules.includes(item.key))

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Truck className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">MRV Logística</p>
              <p className="text-xs text-sidebar-foreground/60">Governança de Custos</p>
            </div>
          </div>
          <button
            className="text-sidebar-foreground/70 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Módulos
          </p>
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.key
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-md bg-sidebar-accent/60 p-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground">
              Perfil ativo
            </p>
            <p className="mt-1 text-sm font-semibold">{profile.cargo}</p>
            <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/60">
              {profile.descricao}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
