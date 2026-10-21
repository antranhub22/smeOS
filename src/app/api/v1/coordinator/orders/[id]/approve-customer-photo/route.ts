/**
 * POST /api/v1/coordinator/orders/[id]/approve-customer-photo
 *
 * Coordinator-Stream M2b: Điều phối viên duyệt ảnh thành phẩm thay cho khách hàng.
 * Hành động này thực hiện First-Wins Mutex cho M2b Customer Approval.
 *
 * Cũng dùng cho khách hàng approve qua link tracking (public endpoint riêng).
 */

import { handle, jsonResponse } from "@/core/http/response"
import { notFound } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { approveCustomerPhoto } from "@/modules/greeting-card/use-cases/evaluate-customer-approval"
import { log } from "@/core/observability/log"

export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R3")
  const { id: orderId } = await context.params

  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractById(orderId, ctx.organizationId)
  if (!order) throw notFound()

  const result = await approveCustomerPhoto(
    order.organization_id,
    order.id,
    "coordinator",
    ctx.userId
  )

  if (result.alreadyApproved) {
    return jsonResponse({
      data: {
        success: true,
        alreadyApproved: true,
        message: "Ảnh thành phẩm đã được duyệt trước đó.",
      },
    })
  }

  log.info("coordinator.approve_customer_photo", {
    orderId: order.id,
    orderCode: order.code,
    actorId: ctx.userId,
  })

  return jsonResponse({
    data: {
      success: true,
      message: "✅ Điều phối đã duyệt ảnh thành phẩm thay khách hàng. Quy trình tiếp tục.",
      approvedBy: "coordinator",
    },
  })
})

export const dynamic = "force-dynamic"
