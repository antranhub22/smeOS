import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { prisma } from "@/core/tenancy/infra/prisma"
import { log } from "@/core/observability/log"
import type { Prisma } from "@/generated/prisma/client"
import { queueOrderNotification } from "@/modules/greeting-card/use-cases/notify-customer"
import { queueStaffNotification } from "@/modules/greeting-card/use-cases/notify-staff"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"

const VIETNAM_PHONE_RE = /^(0|\+84)(3[2-9]|5[6-9]|7[0689]|8[1-9]|9[0-9])\d{7}$/

const shipperSchema = z.object({
  branchId: z.string().trim().min(1, "Thiếu mã chi nhánh"),
  shipperName: z.string().trim().min(2, "Tên shipper tối thiểu 2 ký tự").max(80),
  shipperPhone: z
    .string()
    .trim()
    .regex(VIETNAM_PHONE_RE, "Số điện thoại không hợp lệ (vd: 0912345678)"),
  shipperNote: z.string().trim().max(200).optional(),
})

/**
 * POST /api/v1/public/subcontract/[orderCode]/submit-shipper
 *
 * Cửa hàng/chi nhánh nhập thông tin shipper sau khi ảnh thành phẩm đã được duyệt.
 * Không yêu cầu đăng nhập — xác minh qua branchId đã claim đơn.
 * Kết quả: lưu shipper info vào metadata, gửi thông báo điều phối để bắt đầu giao hàng.
 */
export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-submit-shipper", limit: 20, windowMs: 60_000 })

  const { orderCode } = await context.params
  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

  const body = await request.json().catch(() => ({}))
  const parsed = shipperSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed(Object.fromEntries(
      parsed.error.issues.map((i) => [i.path[0] ?? "body", i.message])
    ))
  }

  const { branchId, shipperName, shipperPhone, shipperNote } = parsed.data

  // Xác minh chi nhánh đang claim đơn này
  const coordMeta = (order.coordination?.metadata as Record<string, unknown> | null) ?? {}
  const subState = coordMeta.subcontract_dispatch as Record<string, unknown> | undefined
  if (subState?.claimedBranchId && subState.claimedBranchId !== branchId) {
    throw unprocessable("Đơn hàng này không thuộc chi nhánh của bạn.")
  }

  // Kiểm tra đơn đã ở trạng thái READY (ảnh đã pass) — mới cho phép nhập shipper
  if (order.production_status !== "READY") {
    throw unprocessable(
      `Đơn hàng chưa đến bước giao hàng (trạng thái hiện tại: ${order.production_status}). Vui lòng upload ảnh thành phẩm trước.`
    )
  }

  // Kiểm tra shipper chưa được nhập (idempotent — nếu đã có thì bỏ qua)
  const existingShipper = coordMeta.shipper_info as Record<string, unknown> | undefined
  if (existingShipper?.shipperPhone) {
    return jsonResponse({
      data: {
        success: true,
        alreadySubmitted: true,
        message: `Thông tin shipper đã được cung cấp trước đó: ${String(existingShipper.shipperName)} — ${String(existingShipper.shipperPhone)}`,
        shipperInfo: existingShipper,
      },
    })
  }

  const coord = await prisma.order_coordinations.findUnique({
    where: { order_id: order.id },
  })
  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}

  const shipperInfo = {
    shipperName,
    shipperPhone,
    shipperNote: shipperNote || null,
    submittedByBranchId: branchId,
    submittedAt: new Date().toISOString(),
  }

  // Cập nhật metadata + đổi delivery_status → DELIVERING
  await prisma.$transaction([
    prisma.orders.update({
      where: { id: order.id },
      data: { delivery_status: "DELIVERING" },
    }),
    prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          shipper_info: shipperInfo,
          shipper_submitted_at: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.order_events.create({
      data: {
        organization_id: order.organization_id,
        order_id: order.id,
        axis: "delivery",
        from_value: order.delivery_status,
        to_value: "DELIVERING",
        actor_id: `branch_${branchId}`,
        reason: `[Shipper] ${shipperName} — ${shipperPhone}${shipperNote ? ` (${shipperNote})` : ""}`,
      },
    }),
  ])

  // Thông báo cho hệ thống (ZNS/Telegram nội bộ) — điều phối viên biết để chuẩn bị bàn giao
  queueOrderNotification(order.organization_id, order.id, "DISPATCHED")
  queueStaffNotification(order.organization_id, "READY", {
    orderId: order.id,
    orderCode: order.code,
    amountVnd: Number(order.total_vnd),
    assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
    extraNote: `🚗 Shipper: ${shipperName} — ${shipperPhone}`,
  })

  // ✅ First-Wins Mutex (Store-Stream): Hủy toàn bộ M3 reminders vì cửa hàng đã điền qua link
  cancelSubcontractReminderSteps({
    organizationId: order.organization_id,
    orderId: order.id,
    steps: getMilestoneSteps("M3"),
    reason: "store_action_via_link",
    actorId: `branch_${branchId}`,
  }).catch((err) => {
    log.warn("subcontract.cancel_m3_reminders_failed", {
      orderCode: order.code,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  log.info("subcontract.shipper_submitted", {
    orderId: order.id,
    orderCode: order.code,
    branchId,
    shipperName,
    shipperPhone,
  })

  return jsonResponse({
    data: {
      success: true,
      message: `✅ Thông tin shipper đã được ghi nhận! ${shipperName} (${shipperPhone}) sẽ đến nhận hàng. Điều phối viên đã được thông báo để chuẩn bị bàn giao.`,
      shipperInfo,
      deliveryStatus: "DELIVERING",
    },
  })
})

export const dynamic = "force-dynamic"
