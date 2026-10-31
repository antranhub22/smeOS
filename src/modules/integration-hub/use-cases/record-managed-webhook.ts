/**
 * Ghi nhận một sự kiện mà route webhook riêng của tích hợp MANAGED (Facebook Messenger, Zalo OA) đã
 * xử lý xong — để Trung tâm Tích hợp hiện nhật ký, "Cần xử lý" và báo khi lỗi. Không lưu nội dung tin.
 * Không bao giờ ném lỗi về route gọi: theo dõi hỏng không được làm hỏng việc trả lời khách.
 */

import { log } from "@/core/observability/log"
import { canTransition } from "../domain/connection-lifecycle"
import { defaultHubDeps, type HubDeps } from "./hub-deps"

export interface ManagedWebhookOutcome {
  organizationId: string
  connectorKey: "facebook_messenger" | "zalo_oa"
  externalAccountId: string
  displayName: string
  externalEventId: string | null
  eventType: string
  ok: boolean
  errorCode?: string
}

export async function recordManagedWebhook(input: ManagedWebhookOutcome, deps: HubDeps = defaultHubDeps()): Promise<void> {
  try {
    const connection = await deps.connections.ensureManaged({
      organizationId: input.organizationId,
      connectorKey: input.connectorKey,
      externalAccountId: input.externalAccountId,
      displayName: input.displayName,
    })
    await deps.events.recordInbound({
      organizationId: input.organizationId,
      connectionId: connection.id,
      externalEventId: input.externalEventId,
      eventType: input.eventType,
      payloadRedacted: {},
      finalStatus: input.ok ? "DONE" : "DEAD",
      errorCode: input.ok ? null : (input.errorCode ?? "PROCESSING_FAILED"),
    })
    const next = input.ok ? "ACTIVE" : "DEGRADED"
    if (connection.status === next || !canTransition(connection.status, next)) return
    await deps.connections.setHealthSystem(connection.id, next, input.ok ? null : (input.errorCode ?? "PROCESSING_FAILED"), deps.now())
    if (!input.ok) await deps.notify({ organizationId: input.organizationId, eventKey: "INTEGRATION_CONNECTION_DEGRADED" })
  } catch (err) {
    log.warn("integration.managed_webhook.record_failed", {
      connectorKey: input.connectorKey,
      error: err instanceof Error ? err.message : "unknown",
    })
  }
}
