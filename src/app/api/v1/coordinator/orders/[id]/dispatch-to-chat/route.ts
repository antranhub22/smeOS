import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed, notFound } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getOrderRepository } from "@/modules/orders/infra/order-repository"
import { getInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import { DispatchOrderToChatUseCase } from "@/modules/internal-chat/use-cases/dispatch-order-to-chat"

const dispatchSchema = z.object({
  targetPartnerOrgId: z.string().uuid(),
  targetPartnerUserId: z.string().uuid().optional(),
})

export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { resolved, ctx } = await requireTenantContext(request)
  const { id: orderId } = await context.params
  const body = await request.json().catch(() => null)
  const parsed = dispatchSchema.safeParse(body)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw validationFailed({ reason: errorDetails })
  }

  // 1. Fetch order details via Clean OrderRepository (REQ-ARCH-006)
  const orderRepo = getOrderRepository()
  const order = await orderRepo.findById(ctx.organizationId, orderId)

  if (!order) {
    throw notFound()
  }

  const firstItem = order.items?.[0]
  const meta = (firstItem?.metadata ?? {}) as Record<string, unknown>
  const thumbnailUrl = (meta.masterImageUrl || meta.imageUrl) as string | undefined

  const chatRepo = getInternalChatRepository()
  const useCase = new DispatchOrderToChatUseCase(chatRepo)

  const deliveryAddrStr = order.deliveryAddress
    ? typeof order.deliveryAddress === "string"
      ? order.deliveryAddress
      : JSON.stringify(order.deliveryAddress)
    : undefined

  const result = await useCase.execute({
    orderId: order.id,
    orderCode: order.code,
    coordinatorUserId: ctx.userId,
    coordinatorRole: resolved.membership?.role_id ?? "coordinator",
    coordinatorOrgId: ctx.organizationId,
    targetPartnerOrgId: parsed.data.targetPartnerOrgId,
    targetPartnerUserId: parsed.data.targetPartnerUserId,
    customerName: order.deliveryAddress?.recipientName ?? undefined,
    recipientName: order.deliveryAddress?.recipientName ?? undefined,
    deliveryTime: order.deliveryWindow?.timeSlot ?? undefined,
    deliveryAddress: deliveryAddrStr,
    priceVnd: order.totalVnd,
    thumbnailUrl,
  })

  return jsonResponse({
    success: true,
    data: result,
  })
})
