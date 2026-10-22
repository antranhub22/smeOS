/**
 * POST /api/v1/coordinator/orders/[id]/set-shipper
 *
 * Coordinator-Stream M3: Điều phối viên trực tiếp nhập thông tin shipper thay cửa hàng.
 * Hành động này triệt tiêu (First-Wins Mutex) toàn bộ reminder M3 đang pending.
 *
 * Yêu cầu: Session đăng nhập có mã năng lực R5.
 */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { conflict, notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { SUBCONTRACT_STEP_NOT_ALLOWED, SUBCONTRACT_STEP_PRECONDITION, subcontractStepAllowed } from "@/modules/greeting-card/domain/subcontract-order"
import { SubcontractStepStore } from "@/modules/greeting-card/infra/subcontract-step-store"
import { log } from "@/core/observability/log"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"
import { queueStaffNotification } from "@/modules/greeting-card/use-cases/notify-staff"

const VIETNAM_PHONE_RE = /^(0|\+84)(3[2-9]|5[6-9]|7[0689]|8[1-9]|9[0-9])\d{7}$/

const setShipperSchema = z.object({
  shipperName: z.string().trim().min(2, "Tên shipper tối thiểu 2 ký tự").max(80),
  shipperPhone: z
    .string()
    .trim()
    .regex(VIETNAM_PHONE_RE, "Số điện thoại không hợp lệ (vd: 0912345678)"),
  shipperNote: z.string().trim().max(200).optional(),
})

export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R5")
  const { id: orderId } = await context.params

  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractById(orderId, ctx.organizationId)
  if (!order) throw notFound()


  const body = await request.json().catch(() => ({}))
  const parsed = setShipperSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed(
      Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] ?? "body", i.message]))
    )
  }

  const { shipperName, shipperPhone, shipperNote } = parsed.data

  // Idempotent: nếu đã có shipper info → trả thông báo đã có
  const coordMeta = (order.coordination?.metadata as Record<string, unknown> | null) ?? {}
  const existingShipper = coordMeta.shipper_info as Record<string, unknown> | undefined
  if (existingShipper?.shipperPhone) {
    return jsonResponse({
      data: {
        success: true,
        alreadySubmitted: true,
        message: `Thông tin shipper đã có trước đó: ${String(existingShipper.shipperName)} — ${String(existingShipper.shipperPhone)}`,
        shipperInfo: existingShipper,
      },
    })
  }

  // Chỉ khi ảnh thành phẩm đã duyệt và chưa giao (đơn đã huỷ/hoàn tất → 409)
  if (!subcontractStepAllowed("SHIPPER", order)) throw conflict(SUBCONTRACT_STEP_NOT_ALLOWED.SHIPPER)
  const store = new SubcontractStepStore()

  const shipperInfo = {
    shipperName,
    shipperPhone,
    shipperNote: shipperNote || null,
    submittedByCoordinator: ctx.userId,
    submittedAt: new Date().toISOString(),
  }

  const saved = await store.applyStep({
    organizationId: order.organization_id,
    orderId: order.id,
    order: { delivery_status: "DELIVERING" },
    require: SUBCONTRACT_STEP_PRECONDITION.SHIPPER,
    metadata: (current) => ({ ...current, shipper_info: shipperInfo, shipper_submitted_at: shipperInfo.submittedAt }),
    events: [{
      axis: "delivery",
      fromValue: order.delivery_status,
      toValue: "DELIVERING",
      actorId: `coordinator:${ctx.userId}`,
      reason: `[Coordinator Set Shipper] ${shipperName} — ${shipperPhone}${shipperNote ? ` (${shipperNote})` : ""}`,
    }],
  })

  if (!saved) throw conflict(SUBCONTRACT_STEP_NOT_ALLOWED.SHIPPER)

  // ✅ First-Wins Mutex: Hủy toàn bộ M3 reminders đang pending
  const cancelResult = await cancelSubcontractReminderSteps({
    organizationId: order.organization_id,
    orderId: order.id,
    steps: getMilestoneSteps("M3"),
    reason: "coordinator_action",
    actorId: ctx.userId,
  })

  queueStaffNotification(order.organization_id, "READY", {
    orderId: order.id,
    orderCode: order.code,
    amountVnd: Number(order.total_vnd),
    assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
    extraNote: `🚗 [Điều phối] Shipper: ${shipperName} — ${shipperPhone}`,
  })

  log.info("coordinator.set_shipper_subcontract", {
    orderId: order.id,
    orderCode: order.code,
    actorId: ctx.userId,
    shipperName,
    cancelledSteps: cancelResult.cancelledSteps,
  })

  return jsonResponse({
    data: {
      success: true,
      message: `✅ Điều phối đã nhập thông tin shipper: ${shipperName} (${shipperPhone}). Mọi nhắc nhở M3 đã bị hủy.`,
      shipperInfo,
      deliveryStatus: "DELIVERING",
      cancelledReminders: cancelResult.cancelledSteps,
    },
  })
})

export const dynamic = "force-dynamic"
