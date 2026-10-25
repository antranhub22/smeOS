import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed, notFound } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { prisma } from "@/core/tenancy/infra/prisma"
import { PrismaInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
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

  // 1. Fetch order details
  const order = await prisma.orders.findFirst({
    where: {
      id: orderId,
      organization_id: ctx.organizationId,
    },
    include: {
      items: {
        take: 1,
      },
      customer: {
        select: { name: true },
      },
    },
  })

  if (!order) {
    throw notFound()
  }

  const firstItem = order.items[0]
  const meta = (firstItem?.metadata ?? {}) as Record<string, unknown>
  const thumbnailUrl = (meta.masterImageUrl || meta.imageUrl) as string | undefined

  const chatRepo = new PrismaInternalChatRepository(prisma)
  const useCase = new DispatchOrderToChatUseCase(chatRepo)

  const deliveryAddrStr = typeof order.delivery_address === "string" 
    ? order.delivery_address 
    : order.delivery_address 
    ? JSON.stringify(order.delivery_address) 
    : undefined

  const result = await useCase.execute({
    orderId: order.id,
    orderCode: order.code,
    coordinatorUserId: ctx.userId,
    coordinatorRole: resolved.membership?.role_id ?? "coordinator",
    coordinatorOrgId: ctx.organizationId,
    targetPartnerOrgId: parsed.data.targetPartnerOrgId,
    targetPartnerUserId: parsed.data.targetPartnerUserId,
    customerName: order.customer?.name ?? undefined,
    recipientName: undefined,
    deliveryTime: undefined,
    deliveryAddress: deliveryAddrStr,
    priceVnd: order.total_vnd ? Number(order.total_vnd) : undefined,
    thumbnailUrl,
  })

  return jsonResponse({
    success: true,
    data: result,
  })
})
