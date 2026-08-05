'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useProfile } from './profile-context'
import type { ModuleKey } from '@/lib/roles'
import { DashboardView } from './views/dashboard-view'
import { CorreiosView } from './views/correios-view'
import { MalotesView } from './views/malotes-view'
import { PercursosView } from './views/percursos-view'
import { NotificacoesView } from './views/notificacoes-view'
import { CentrosCustoView } from './views/centros-custo-view'
import { AuditoriaView } from './views/auditoria-view'

export function AppShell() {
  const { profile } = useProfile()
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Se o perfil ativo não tem acesso ao módulo atual, volta ao painel
  useEffect(() => {
    if (!profile.modules.includes(active)) setActive('dashboard')
  }, [profile, active])

  function navigate(key: ModuleKey) {
    setActive(key)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active={active}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar active={active} onMenuClick={() => setMobileOpen(true)} onNavigate={navigate} />
        <main className="flex-1 p-4 md:p-6">
          {active === 'dashboard' && <DashboardView onNavigate={navigate} />}
          {active === 'correios' && <CorreiosView />}
          {active === 'malotes' && <MalotesView />}
          {active === 'percursos' && <PercursosView />}
          {active === 'notificacoes' && <NotificacoesView />}
          {active === 'centros-custo' && <CentrosCustoView />}
          {active === 'auditoria' && <AuditoriaView />}
        </main>
      </div>
    </div>
  )
}
