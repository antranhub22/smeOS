/**
 * approve-bypass/route.ts
 *
 * POST /api/v1/coordinator/orders/[id]/approve-bypass
 *
 * Điều phối viên phê duyệt (APPROVE) hoặc từ chối (REJECT) yêu cầu bỏ qua bằng chứng của chi nhánh.
 * - Khi APPROVE: Kích hoạt bước tiếp theo (chuyển production_status hoặc delivery_status),
 *   triệt tiêu reminder tương ứng, đồng thời trừ 2 điểm chất lượng KPI của chi nhánh.
 * - Khách hàng sẽ thấy tiến độ chuyển bước kèm ghi chú bất khả kháng.
 */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { prisma } from "@/core/tenancy/infra/prisma"
import { log } from "@/core/observability/log"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"
import { queueOrderNotification } from "@/modules/greeting-card/use-cases/notify-customer"
import { getOrderRepository } from "@/modules/orders/infra/order-repository"
import type { Prisma } from "@/generated/prisma/client"

const decisionSchema = z.object({
  step: z.enum(["QC", "SHIPPER", "POD"]),
  decision: z.enum(["APPROVE", "REJECT"]),
  reviewNote: z.string().trim().max(300).optional(),
})

export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  const { id: orderId } = await context.params

  const body = await request.json().catch(() => ({}))
  const parsed = decisionSchema.safeParse(body)
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const { step, decision, reviewNote } = parsed.data
  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractById(orderId, ctx.organizationId)
  if (!order) throw notFound()

  const coord = await prisma.order_coordinations.findUnique({
    where: { order_id: order.id },
  })
  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
  const bypassRequests = (existingMeta.bypass_requests as Record<string, unknown> | undefined) ?? {}
  const currentReq = (bypassRequests[step] as Record<string, unknown> | undefined)

  if (!currentReq || currentReq.status !== "PENDING") {
    throw unprocessable(`Không có yêu cầu bỏ qua ${step} đang chờ duyệt cho đơn hàng này.`)
  }

  const branchId = (currentReq.requestedByBranchId as string) || ""
  const branchName = (currentReq.requestedByBranchName as string) || "Chi nhánh"
  const requestReason = (currentReq.reason as string) || ""
  const nowIso = new Date().toISOString()

  if (decision === "REJECT") {
    const updatedBypassRequests = {
      ...bypassRequests,
      [step]: {
        ...currentReq,
        status: "REJECTED",
        decisionAt: nowIso,
        decidedBy: ctx.userId,
        reviewNote: reviewNote || "Điều phối yêu cầu cung cấp đầy đủ hình ảnh/thông tin",
      },
    }

    await prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          bypass_requests: updatedBypassRequests,
        } as unknown as Prisma.InputJsonValue,
      },
    })

    return jsonResponse({
      data: {
        success: true,
        decision: "REJECT",
        message: "Đã từ chối yêu cầu bỏ qua. Chi nhánh phải thực hiện cung cấp bằng chứng.",
      },
    })
  }

  // Khi APPROVE: Cập nhật DB kích hoạt bước tiếp theo
  const updatedBypassRequests = {
    ...bypassRequests,
    [step]: {
      ...currentReq,
      status: "APPROVED",
      decisionAt: nowIso,
      decidedBy: ctx.userId,
      reviewNote: reviewNote || "Điều phối chấp thuận vì lý do bất khả kháng",
    },
  }

  let penaltyResult = null
  if (branchId) {
    penaltyResult = await repo.recordBranchBypassPenalty(
      order.organization_id,
      branchId,
      `Bỏ qua bằng chứng ${step} đơn #${order.code} (Lý do: ${requestReason})`
    )
  }

  const orderRepo = getOrderRepository()

  if (step === "QC") {
    // Kích hoạt bước 2 hoàn thành (READY) để bước 3 mở khóa
    await prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          bypass_requests: updatedBypassRequests,
          last_qc_uploaded_at: nowIso,
          last_qc_uploaded_by: `coordinator_bypass:${ctx.userId}`,
          bypass_qc_approved: true,
        } as unknown as Prisma.InputJsonValue,
      },
    })
    await orderRepo.update(order.organization_id, order.id, {
      productionStatus: "READY",
    })
    await orderRepo.recordEvent(
      order.organization_id,
      order.id,
      "production",
      "READY",
      `coordinator:${ctx.userId}`,
      order.production_status,
      `[Duyệt Bỏ Qua QC] ${requestReason}. Chi nhánh ${branchName} bị trừ 2 điểm KPI.`
    )
  } else if (step === "SHIPPER") {
    // Kích hoạt bước 3 hoàn thành (DELIVERING) để bước 4 mở khóa
    await prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          bypass_requests: updatedBypassRequests,
          shipper_info: {
            shipperName: "Giao gấp (Miễn thông tin)",
            shipperPhone: "",
            submittedAt: nowIso,
            bypassedByCoordinator: true,
          },
          bypass_shipper_approved: true,
        } as unknown as Prisma.InputJsonValue,
      },
    })
    await orderRepo.update(order.organization_id, order.id, {
      deliveryStatus: "DELIVERING",
    })
    await orderRepo.recordEvent(
      order.organization_id,
      order.id,
      "delivery",
      "DELIVERING",
      `coordinator:${ctx.userId}`,
      order.delivery_status || "ASSIGNED",
      `[Duyệt Bỏ Qua Shipper] ${requestReason}. Chi nhánh ${branchName} bị trừ 2 điểm KPI.`
    )
  } else if (step === "POD") {
    // Kích hoạt bước 4 hoàn thành (COMPLETED / DELIVERED)
    await prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          bypass_requests: updatedBypassRequests,
          delivery_proof: {
            photoUrls: [],
            note: `Bỏ qua POD (Điều phối duyệt: ${requestReason})`,
            deliveredAt: nowIso,
            confirmedByCoordinator: ctx.userId,
            confirmMode: "bypassed_without_photo",
          },
          bypass_pod_approved: true,
        } as unknown as Prisma.InputJsonValue,
      },
    })
    await orderRepo.update(order.organization_id, order.id, {
      deliveryStatus: "DELIVERED",
      status: "COMPLETED",
    })
    await orderRepo.recordEvent(
      order.organization_id,
      order.id,
      "order",
      "COMPLETED",
      `coordinator:${ctx.userId}`,
      order.status,
      `[Duyệt Bỏ Qua POD] ${requestReason}. Chi nhánh ${branchName} bị trừ 2 điểm KPI.`
    )
  }

  // Triệt tiêu các reminder tương ứng
  const milestoneKey = step === "QC" ? "M2" : step === "SHIPPER" ? "M3" : "M4"
  await cancelSubcontractReminderSteps({
    organizationId: order.organization_id,
    orderId: order.id,
    steps: getMilestoneSteps(milestoneKey as "M2" | "M3" | "M4"),
    reason: "coordinator_action",
    actorId: ctx.userId,
  })

  // Notify khách hàng chuyển bước
  const notifyEvent = step === "QC" ? "READY" : step === "SHIPPER" ? "DELIVERING" : "DELIVERED"
  queueOrderNotification(order.organization_id, order.id, notifyEvent as "READY" | "DELIVERED")

  log.info("coordinator.approve_bypass", {
    orderId: order.id,
    orderCode: order.code,
    step,
    branchId,
    actorId: ctx.userId,
  })

  return jsonResponse({
    data: {
      success: true,
      decision: "APPROVE",
      message: `✅ Đã chấp thuận bỏ qua ${step}. Bước tiếp theo đã được mở khóa cho chi nhánh.`,
      penalty: penaltyResult,
    },
  })
})

export const dynamic = "force-dynamic"
