import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { notFound, validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { prisma } from "@/core/tenancy/infra/prisma"
import { getChainPartnershipRepository } from "@/modules/chain-partnership/infra/prisma-partnership-repository"

const updateToolsSchema = z.object({
  unlockedTools: z.array(z.string()),
})

export const PATCH = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  const { id: partnershipId } = await params

  const partnershipRepo = getChainPartnershipRepository()
  const partnership = await partnershipRepo.findPartnershipById(partnershipId)

  if (!partnership) {
    throw notFound()
  }

  // Kiểm tra quyền: Chỉ chuỗi sở hữu quan hệ đối tác này mới được cấu hình
  if (partnership.chainOrgId !== ctx.organizationId) {
    throw notFound()
  }

  const rawBody = (await request.json()) as unknown
  const parsed = updateToolsSchema.safeParse(rawBody)

  if (!parsed.success) {
    throw validationFailed({ reason: "Dữ liệu danh mục công cụ không hợp lệ" })
  }

  // Lấy settings hiện tại của partner organization
  const partnerOrg = await prisma.organizations.findUnique({
    where: { id: partnership.partnerOrgId },
    select: { id: true, settings: true },
  })

  if (!partnerOrg) {
    throw notFound()
  }

  const currentSettings =
    partnerOrg.settings && typeof partnerOrg.settings === "object"
      ? (partnerOrg.settings as Record<string, unknown>)
      : {}

  const updatedSettings = {
    ...currentSettings,
    unlocked_tools: parsed.data.unlockedTools,
  }

  // Cập nhật unlocked_tools cho partner organization
  await prisma.organizations.update({
    where: { id: partnerOrg.id },
    data: {
      settings: updatedSettings,
    },
  })

  return jsonResponse({
    success: true,
    data: {
      partnershipId,
      partnerOrgId: partnerOrg.id,
      unlockedTools: parsed.data.unlockedTools,
    },
  })
})
