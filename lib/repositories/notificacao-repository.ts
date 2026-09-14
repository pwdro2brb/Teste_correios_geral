import type { Notificacao } from '@/lib/mock-data'
import type { Page, PageQuery } from '@/lib/api/pagination'

export interface NotificationListQuery extends PageQuery {
  unreadOnly?: boolean
}

export interface NotificacaoRepository {
  list: (query: NotificationListQuery) => Promise<Page<Notificacao>>
  archiveOlderThan: (cutoff: string) => Promise<number>
}

export const NOTIFICATION_RETENTION_DAYS = 90

export function notificationRetentionCutoff(now = new Date(), days = NOTIFICATION_RETENTION_DAYS) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return cutoff.toISOString()
}
