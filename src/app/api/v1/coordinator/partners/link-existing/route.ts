import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getChainPartnershipRepository } from "@/modules/chain-partnership/infra/prisma-partnership-repository"
import { getInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import { LinkExistingStoreUseCase } from "@/modules/chain-partnership/use-cases/link-existing-store"

const linkSchema = z.object({
  identifier: z.string().min(2, "Vui lòng nhập Email đại diện hoặc Mã/Slug của cửa hàng"),
  partnerCode: z.string().min(2, "Mã đối tác phải từ 2 ký tự"),
  partnershipType: z.enum(["SUBCONTRACTOR", "FRANCHISE", "BRANCH"]).optional(),
  commissionRate: z.number().optional(),
  capacityDaily: z.number().optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const body = await request.json().catch(() => null)
  const parsed = linkSchema.safeParse(body)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw validationFailed({ reason: errorDetails })
  }

  const partnershipRepo = getChainPartnershipRepository()
  const chatRepo = getInternalChatRepository()
  const useCase = new LinkExistingStoreUseCase(partnershipRepo, chatRepo)

  try {
    const partnership = await useCase.execute(
      {
        chainOrgId: ctx.organizationId,
        identifier: parsed.data.identifier,
        partnerCode: parsed.data.partnerCode,
        partnershipType: parsed.data.partnershipType,
        commissionRate: parsed.data.commissionRate,
        capacityDaily: parsed.data.capacityDaily,
      },
      ctx.userId
    )

    return jsonResponse(
      {
        success: true,
        data: partnership,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    throw validationFailed({ reason: (err instanceof Error && err.message) || "Không thể liên kết cửa hàng này" })
  }
})
