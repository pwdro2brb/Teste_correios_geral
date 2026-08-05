'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ROLES, type Role, type RoleProfile } from '@/lib/roles'

interface ProfileContextValue {
  role: Role
  profile: RoleProfile
  setRole: (role: Role) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  return (
    <ProfileContext.Provider value={{ role, profile: ROLES[role], setRole }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  return ctx
}
