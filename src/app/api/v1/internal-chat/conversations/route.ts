import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import { ListUserConversationsUseCase } from "@/modules/internal-chat/use-cases/list-user-conversations"
import { CreateOrGetConversationUseCase } from "@/modules/internal-chat/use-cases/create-or-get-conversation"

const createConversationSchema = z.object({
  conversationType: z.enum(["PLATFORM_TENANT", "CHAIN_PARTNER", "ORDER_THREAD"]),
  title: z.string().optional(),
  targetOrganizationId: z.string().uuid().optional(),
  targetUserId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const conversationType = url.searchParams.get("type") as never
  const orderId = url.searchParams.get("orderId") ?? undefined

  const chatRepo = getInternalChatRepository()
  const useCase = new ListUserConversationsUseCase(chatRepo)

  const result = await useCase.execute({
    userId: ctx.userId,
    organizationId: ctx.organizationId,
    conversationType: conversationType || undefined,
    orderId,
  })

  return jsonResponse({
    success: true,
    data: result.items,
    total: result.total,
  })
})

export const POST = handle(async (request) => {
  const { resolved, ctx } = await requireTenantContext(request)
  const body = await request.json().catch(() => null)
  const parsed = createConversationSchema.safeParse(body)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw validationFailed({ reason: errorDetails })
  }

  const chatRepo = getInternalChatRepository()
  const useCase = new CreateOrGetConversationUseCase(chatRepo)

  const conversation = await useCase.execute({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    userRole: resolved.membership?.role_id ?? "member",
    conversationType: parsed.data.conversationType,
    title: parsed.data.title,
    targetOrganizationId: parsed.data.targetOrganizationId,
    targetUserId: parsed.data.targetUserId,
    orderId: parsed.data.orderId,
  })

  return jsonResponse({
    success: true,
    data: conversation,
  })
})
