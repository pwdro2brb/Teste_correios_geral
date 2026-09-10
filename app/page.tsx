import { ProfileProvider } from '@/components/profile-context'
import { CostCentersProvider } from '@/lib/cost-centers-context'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <ProfileProvider>
      <CostCentersProvider>
        <AppShell />
      </CostCentersProvider>
    </ProfileProvider>
  )
}
