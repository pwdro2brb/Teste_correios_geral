import { ProfileProvider } from '@/components/profile-context'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  )
}
