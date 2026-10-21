import { randomUUID } from "node:crypto"

import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"

type Db = typeof prisma

/** Một dòng `order_events` (trục đổi giá trị) ghi cùng giao dịch với bước gia công. */
export interface SubcontractOrderEvent {
  axis: string // order · production · delivery (POD bỏ qua cũ ghi "status")
  fromValue: string | null
  toValue: string
  actorId: string
  reason?: string | null | undefined
}

/** Trạng thái đơn mà một bước gia công được phép đổi. */
export interface SubcontractOrderStatusPatch {
  status?: string | undefined
  production_status?: string | undefined
  delivery_status?: string | undefined
}

export interface SubcontractStepWrite {
  organizationId: string
  orderId: string
  order?: SubcontractOrderStatusPatch | undefined
  /** Thay TOÀN BỘ `order_coordinations.metadata` — người gọi tự trộn với bản cũ. */
  metadata?: Record<string, unknown> | undefined
  events?: SubcontractOrderEvent[] | undefined
}

/**
 * Đọc/ghi phiên gia công của một đơn: `order_coordinations.metadata`, trạng thái `orders` và
 * `order_events`. Mọi truy vấn lọc theo `organization_id` — trước đây các route gọi thẳng
 * `prisma.*` theo `order_id` (luật kiến trúc 4, test `khong-import-prisma-ngoai-infra`).
 */
export class SubcontractStepStore {
  constructor(private readonly db: Db = prisma) {}

  /** Metadata của phiên điều phối, hoặc `null` nếu đơn chưa có phiên điều phối. */
  async findMetadata(organizationId: string, orderId: string): Promise<Record<string, unknown> | null> {
    const row = await this.db.order_coordinations.findFirst({
      where: { organization_id: organizationId, order_id: orderId },
      select: { metadata: true },
    })
    if (!row) return null
    return (row.metadata as Record<string, unknown> | null) ?? {}
  }

  async readMetadata(organizationId: string, orderId: string): Promise<Record<string, unknown>> {
    return (await this.findMetadata(organizationId, orderId)) ?? {}
  }

  async writeMetadata(organizationId: string, orderId: string, metadata: Record<string, unknown>): Promise<void> {
    await this.db.order_coordinations.updateMany({
      where: { organization_id: organizationId, order_id: orderId },
      data: { metadata: metadata as Prisma.InputJsonValue },
    })
  }

  /** Ghi một bước gia công trong MỘT giao dịch: trạng thái đơn, metadata, nhật ký sự kiện. */
  async applyStep(input: SubcontractStepWrite): Promise<void> {
    const ops: Prisma.PrismaPromise<unknown>[] = []
    if (input.order && Object.keys(input.order).length > 0) {
      ops.push(
        this.db.orders.updateMany({
          where: { organization_id: input.organizationId, id: input.orderId },
          data: input.order as Prisma.ordersUpdateManyMutationInput,
        })
      )
    }
    if (input.metadata) {
      ops.push(
        this.db.order_coordinations.updateMany({
          where: { organization_id: input.organizationId, order_id: input.orderId },
          data: { metadata: input.metadata as Prisma.InputJsonValue },
        })
      )
    }
    for (const e of input.events ?? []) {
      ops.push(
        this.db.order_events.create({
          data: {
            id: randomUUID(),
            organization_id: input.organizationId,
            order_id: input.orderId,
            axis: e.axis,
            from_value: e.fromValue,
            to_value: e.toValue,
            actor_id: e.actorId,
            reason: e.reason ?? null,
          },
        })
      )
    }
    if (ops.length > 0) await this.db.$transaction(ops)
  }
}
