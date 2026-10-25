/**
 * IAuditLogRepository — Port Interface cho Nhật ký Kiểm toán (Audit Logs).
 *
 * Đặt tại domain/repositories/ theo chuẩn Clean Architecture (Zero ORM).
 */

import type { TenantContext } from "@/core/tenancy"
import type { audit_logs } from "@/modules/audit/infra/entities"

export interface RecordAuditLogInput {
  action: string
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  ip?: string | null
  userAgent?: string | null
}

export interface IAuditLogRepository {
  record(ctx: TenantContext, input: RecordAuditLogInput): Promise<audit_logs>
  list(
    ctx: TenantContext,
    options: { limit: number; cursor?: string | null }
  ): Promise<audit_logs[]>
}
