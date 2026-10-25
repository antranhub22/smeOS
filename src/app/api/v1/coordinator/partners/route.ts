import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { prisma } from "@/core/tenancy/infra/prisma"
import { PrismaChainPartnershipRepository } from "@/modules/chain-partnership/infra/prisma-partnership-repository"
import { PrismaInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import { ListChainPartnersUseCase } from "@/modules/chain-partnership/use-cases/list-chain-partners"
import { ProvisionPartnerAccountUseCase } from "@/modules/chain-partnership/use-cases/provision-partner-account"

const provisionSchema = z.object({
  partnerStoreName: z.string().min(2, "Tên cửa hàng phải từ 2 ký tự"),
  partnerCode: z.string().min(2, "Mã đối tác phải từ 2 ký tự"),
  partnershipType: z.enum(["SUBCONTRACTOR", "FRANCHISE", "BRANCH"]).optional(),
  contactName: z.string().min(2, "Tên người đại diện không được để trống"),
  contactPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
  contactEmail: z.string().email("Email không hợp lệ"),
  password: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  capacityDaily: z.number().optional(),
  commissionRate: z.number().optional(),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const status = url.searchParams.get("status") as any
  const province = url.searchParams.get("province") ?? undefined
  const query = url.searchParams.get("q") ?? undefined

  const partnershipRepo = new PrismaChainPartnershipRepository(prisma)
  const useCase = new ListChainPartnersUseCase(partnershipRepo)

  const result = await useCase.execute({
    chainOrgId: ctx.organizationId,
    status: status || undefined,
    province,
    query,
  })

  return jsonResponse({
    success: true,
    data: result.items,
    total: result.total,
  })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const body = await request.json().catch(() => null)
  const parsed = provisionSchema.safeParse(body)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw validationFailed({ reason: errorDetails })
  }

  const partnershipRepo = new PrismaChainPartnershipRepository(prisma)
  const chatRepo = new PrismaInternalChatRepository(prisma)
  const useCase = new ProvisionPartnerAccountUseCase(partnershipRepo, chatRepo)

  const partnership = await useCase.execute(
    {
      chainOrgId: ctx.organizationId,
      partnerStoreName: parsed.data.partnerStoreName,
      partnerCode: parsed.data.partnerCode,
      partnershipType: parsed.data.partnershipType,
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      contactEmail: parsed.data.contactEmail,
      password: parsed.data.password,
      address: parsed.data.address,
      province: parsed.data.province,
      district: parsed.data.district,
      capacityDaily: parsed.data.capacityDaily,
      commissionRate: parsed.data.commissionRate,
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
})
