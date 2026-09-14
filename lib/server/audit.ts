import type { AuthenticatedUser } from './auth'

export interface AuditEventInput {
  action: string
  entity: string
  details: Record<string, unknown>
}

export interface AuditRepository {
  append: (event: AuditEventInput & { userId: string; occurredAt: string }) => Promise<void>
}

export function createAuditLogger(user: AuthenticatedUser, repository: AuditRepository) {
  return (event: AuditEventInput) => repository.append({
    ...event,
    userId: user.id,
    occurredAt: new Date().toISOString(),
  })
}