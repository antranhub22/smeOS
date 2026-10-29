import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy"
import { MAX_OUTBOX_ATTEMPTS } from "@/modules/assets/domain/asset-lifecycle"
import { payloadKeysToPurge } from "@/modules/assets/domain/payload-deletion"

const DELETE_OP = "DELETE"

export type OutboxItem = { id: string; organization_id: string; storage_key: string; attempts: number }

/**
 * Xoá dòng `assets` và ghi hàng đợi xoá payload trong CÙNG một transaction —
 * không có cảnh dòng đã mất mà tệp không ai nhớ để xoá (SDAGF-012/017).
 * Trả `false` khi không thấy asset trong tổ chức của phiên.
 */
export async function deleteAssetAndEnqueuePayloads(
  ctx: TenantContext,
  asset: { id: string; storage_key: string; thumb_key: string | null }
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const removed = await tx.assets.deleteMany({ where: scopedWhere(ctx, { id: asset.id }) })
    if (removed.count === 0) return false
    for (const key of payloadKeysToPurge(ctx.organizationId, asset)) {
      await tx.storage_outbox.upsert({
        where: { op_storage_key: { op: DELETE_OP, storage_key: key } },
        create: { organization_id: ctx.organizationId, op: DELETE_OP, storage_key: key, asset_id: asset.id },
        update: { done_at: null, attempts: 0, last_error: null },
      })
    }
    return true
  })
}

/** Việc chờ xử lý của mọi tổ chức — chỉ cron hệ thống gọi. */
export function listPendingOutbox(limit: number): Promise<OutboxItem[]> {
  return prisma.storage_outbox.findMany({
    where: { op: DELETE_OP, done_at: null, attempts: { lt: MAX_OUTBOX_ATTEMPTS } },
    orderBy: { created_at: "asc" },
    take: limit,
    select: { id: true, organization_id: true, storage_key: true, attempts: true },
  })
}

export async function markOutboxDone(id: string, note: string | null, now: Date): Promise<void> {
  await prisma.storage_outbox.update({ where: { id }, data: { done_at: now, last_error: note } })
}

export async function markOutboxFailed(id: string, error: string): Promise<void> {
  await prisma.storage_outbox.update({
    where: { id },
    data: { attempts: { increment: 1 }, last_error: error.slice(0, 500) },
  })
}
