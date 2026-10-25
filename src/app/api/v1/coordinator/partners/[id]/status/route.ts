import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { prisma } from "@/core/tenancy/infra/prisma"
import { PrismaChainPartnershipRepository } from "@/modules/chain-partnership/infra/prisma-partnership-repository"

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]),
})

export const PATCH = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  await requireTenantContext(request)
  const { id: partnershipId } = await context.params
  const body = await request.json().catch(() => null)
  const parsed = statusSchema.safeParse(body)

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw validationFailed({ reason: errorDetails })
  }

  const partnershipRepo = new PrismaChainPartnershipRepository(prisma)
  const updated = await partnershipRepo.updateStatus(partnershipId, parsed.data.status)

  return jsonResponse({
    success: true,
    data: updated,
  })
})
