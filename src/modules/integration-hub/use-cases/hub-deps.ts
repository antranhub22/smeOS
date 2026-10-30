/** Phụ thuộc chung của use-case Trung tâm Tích hợp — tiêm được để test không cần DB. */

import { recordAuditLog } from "@/modules/audit/use-cases/record-audit-log"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"
import { getConnector } from "../adapters/connectors"
import { getConnectionRepository, type ConnectionRepository } from "../infra/connection-repository"
import { getEventRepository, type EventRepository } from "../infra/event-repository"
import { loadOrgProfile } from "../infra/org-profile"

export interface HubDeps {
  connections: Pick<ConnectionRepository, keyof ConnectionRepository>
  events: Pick<EventRepository, keyof EventRepository>
  loadProfile: typeof loadOrgProfile
  getConnector: typeof getConnector
  audit: typeof recordAuditLog
  notify: typeof notifyOrganization
  isProduction: boolean
  now: () => Date
}

export function defaultHubDeps(): HubDeps {
  return {
    connections: getConnectionRepository(),
    events: getEventRepository(),
    loadProfile: loadOrgProfile,
    getConnector,
    audit: recordAuditLog,
    notify: notifyOrganization,
    isProduction: process.env.NODE_ENV === "production",
    now: () => new Date(),
  }
}
