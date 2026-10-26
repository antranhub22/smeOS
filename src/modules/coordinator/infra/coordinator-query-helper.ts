/**
 * Coordinator Query Includes and Types.
 * Helper for CoordinatorRepository to adhere to SRP line limits.
 */

import { scopedData, type TenantContext } from "@/core/tenancy"
import type { Prisma } from "@/generated/prisma/client"
import type { CoordinatorStage, CoordinationRiskLevel } from "../domain/coordinator-types"
import type { MappedOrderAxes } from "../domain/state-mapper"
import type { DbClient } from "./transaction"

export const ORDER_INCLUDE = {
  coordination: { include: { partner: true } },
  items: true,
  qc_records: { orderBy: { created_at: "desc" as const }, take: 1 },
  exceptions: { orderBy: { created_at: "asc" as const } },
  payments: { orderBy: { collected_at: "asc" as const } },
} satisfies Prisma.ordersInclude

export type CoordinatorOrderRow = Prisma.ordersGetPayload<{ include: typeof ORDER_INCLUDE }>
export type PartnerRow = Prisma.partnersGetPayload<object>
export type ExceptionRow = Prisma.order_exceptionsGetPayload<object>

export interface CreateCoordinatorOrderData {
  code: string
  stage: CoordinatorStage
  axes: MappedOrderAxes
  riskLevel: CoordinationRiskLevel
  nextAction: string
  totalVnd: number
  customerId: string | null
  cardMessage: string | null
  cardRequired: boolean
  internalNote: string | null
  deliveryWindow: { timeSlot: string; targetAt: string | null }
  deliveryAddress: Record<string, unknown>
  estimatedDeliveryAt: Date | null
  sampleAssetId: string | null
  items: Array<{ productId?: string | null; description: string; quantity: number; metadata: Record<string, unknown> }>
  metadata: Record<string, unknown>
  customFields: Record<string, unknown>
  source: string
  sourceReference: string | null
  channel: string | null
  orderType: string | null
  priority: string
  serviceLevel: string | null
  deliveryType: string | null
  deliveryLocationType: string | null
  receivedAt: Date
  deliveryWindowStart: Date | null
  deliveryWindowEnd: Date | null
  salesOwnerId: string
}

export async function executeCreateOrder(
  db: DbClient,
  ctx: TenantContext,
  data: CreateCoordinatorOrderData
): Promise<{ id: string; code: string }> {
  const order = await db.orders.create({
    data: scopedData(ctx, {
      code: data.code,
      customer_id: data.customerId,
      status: data.axes.status,
      production_status: data.axes.productionStatus,
      delivery_status: data.axes.deliveryStatus,
      total_vnd: data.totalVnd,
      balance_vnd: data.totalVnd,
      card_message: data.cardMessage,
      internal_note: data.internalNote,
      delivery_window: data.deliveryWindow as Prisma.InputJsonValue,
      delivery_address: data.deliveryAddress as Prisma.InputJsonValue,
      created_by: ctx.userId,
    }),
  })

  if (data.items.length > 0) {
    await db.order_items.createMany({
      data: data.items.map((it) =>
        scopedData(ctx, {
          order_id: order.id,
          product_id: it.productId ?? null,
          description: it.description,
          quantity: it.quantity,
          unit_price_vnd: 0,
          metadata: it.metadata as Prisma.InputJsonValue,
        })
      ),
    })
  }

  await db.order_coordinations.create({
    data: scopedData(ctx, {
      order_id: order.id,
      coordinator_id: ctx.userId,
      stage: data.stage,
      risk_level: data.riskLevel,
      next_action: data.nextAction,
      estimated_delivery_at: data.estimatedDeliveryAt,
      sample_asset_id: data.sampleAssetId,
      metadata: data.metadata as Prisma.InputJsonValue,
      custom_fields: data.customFields as Prisma.InputJsonValue,
      card_required: data.cardRequired,
      source: data.source,
      source_reference: data.sourceReference,
      channel: data.channel,
      order_type: data.orderType,
      priority: data.priority,
      service_level: data.serviceLevel,
      delivery_type: data.deliveryType,
      delivery_location_type: data.deliveryLocationType,
      received_at: data.receivedAt,
      delivery_window_start: data.deliveryWindowStart,
      delivery_window_end: data.deliveryWindowEnd,
      sales_owner_id: data.salesOwnerId,
    }),
  })

  return { id: order.id, code: order.code }
}

