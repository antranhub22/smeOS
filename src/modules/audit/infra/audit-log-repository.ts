import type { InputJsonValue, audit_logs } from "./entities"
import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedData, scopedWhere, type TenantContext } from "@/core/tenancy"
import type { DbClient } from "./db-client"
import type {
  IAuditLogRepository,
  RecordAuditLogInput,
} from "../domain/repositories/audit-log-repository.interface"

export type { RecordAuditLogInput, IAuditLogRepository }

/**
 * Nhật ký kiểm toán — đặc tả 07 mục 8, `YC-R4`. Dựng ở P3 làm hạ tầng dùng
 * chung; endpoint duyệt đầu tiên gọi `record()` là `POST
 * /vision/analyses/:id/approve` (`H3`, P5). Nhận `db: DbClient` để ghi được
 * trong CÙNG giao dịch với chính hành động duyệt — audit_logs không đứng
 * tách rời, mất nó nếu giao dịch duyệt rollback là sai.
 */
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: DbClient = prisma) {}

  record(ctx: TenantContext, input: RecordAuditLogInput): Promise<audit_logs> {
    return this.db.audit_logs.create({
      data: scopedData(ctx, {
        user_id: ctx.userId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        before: (input.before ?? null) as InputJsonValue,
        after: (input.after ?? null) as InputJsonValue,
        ip: input.ip ?? null,
        user_agent: input.userAgent ?? null,
      }),
    })
  }

  list(
    ctx: TenantContext,
    options: { limit: number; cursor?: string | null }
  ): Promise<audit_logs[]> {
    return this.db.audit_logs.findMany({
      where: scopedWhere(ctx),
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: options.limit,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    })
  }
}

let defaultRepo: IAuditLogRepository | null = null

export function getAuditLogRepository(db?: DbClient): IAuditLogRepository {
  if (db) {
    return new AuditLogRepository(db)
  }
  if (!defaultRepo) {
    defaultRepo = new AuditLogRepository()
  }
  return defaultRepo
}
