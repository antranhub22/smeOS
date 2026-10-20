import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import type { BranchCandidate } from "@/modules/greeting-card/domain/chain-dispatch-engine"

const branchSchema = z.object({
  branchId: z.string().min(1),
  branchName: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxDeliveryRadiusKm: z.number().optional(),
  qualityScore: z.number().default(90),
  activeJobsCount: z.number().default(0),
  maxConcurrentJobs: z.number().default(5),
  isActive: z.boolean().default(true),
  channels: z
    .object({
      phone: z.string().optional(),
      telegramChatId: z.string().optional(),
      zaloPhone: z.string().optional(),
    })
    .optional(),
})

const bulkImportSchema = z.object({
  branches: z.array(branchSchema).min(1),
})

/**
 * POST /api/v1/greeting-card/chain-branches/bulk-import
 * Nhập danh sách chi nhánh chuỗi từ file Excel vào cấu hình org_settings.chain_branches
 */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.assignFlorist)

  const body = await request.json().catch(() => ({}))
  const parsed = bulkImportSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { branches } = parsed.data

  const org = await prisma.organizations.findFirst({
    where: { id: ctx.organizationId },
    select: { settings: true },
  })

  const currentSettings = (org?.settings as Record<string, unknown> | null) ?? {}
  const existingBranches: BranchCandidate[] = Array.isArray(currentSettings.chain_branches)
    ? (currentSettings.chain_branches as BranchCandidate[])
    : []

  const branchMap = new Map<string, BranchCandidate>()
  for (const b of existingBranches) {
    branchMap.set(b.branchId, b)
  }

  let created = 0
  let updated = 0

  for (const b of branches) {
    const isUpdate = branchMap.has(b.branchId)
    const candidate: BranchCandidate = {
      branchId: b.branchId,
      branchName: b.branchName,
      address: b.address ?? "",
      location:
        typeof b.latitude === "number" && typeof b.longitude === "number"
          ? { latitude: b.latitude, longitude: b.longitude }
          : null,
      qualityScore: b.qualityScore,
      activeJobsCount: b.activeJobsCount,
      maxConcurrentJobs: b.maxConcurrentJobs,
      isActive: b.isActive,
      channels: {
        phone: b.channels?.phone,
        telegramChatId: b.channels?.telegramChatId,
        zaloPhone: b.channels?.zaloPhone,
      },
    }

    branchMap.set(b.branchId, candidate)
    if (isUpdate) {
      updated++
    } else {
      created++
    }
  }

  const newBranchesList = Array.from(branchMap.values())

  await prisma.organizations.update({
    where: { id: ctx.organizationId },
    data: {
      settings: {
        ...currentSettings,
        chain_branches: newBranchesList,
      } as unknown as Prisma.InputJsonValue,
    },
  })

  return jsonResponse({
    data: {
      created,
      updated,
      total: newBranchesList.length,
      errors: [],
    },
  })
})

export const dynamic = "force-dynamic"
