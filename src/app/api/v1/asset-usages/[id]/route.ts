import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import type { UsageDestination } from "@/modules/marketing-center/domain/asset-type"
import type { AssetUsageStatus } from "@/modules/marketing-center/domain/asset-usage"
import type { CtaCode } from "@/modules/marketing-center/domain/cta-registry"
import { updateAssetUsageUseCase } from "@/modules/marketing-center/use-cases/update-asset-usage.use-case"

const updateUsageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  cta_code: z.enum([
    "LEARN_MORE",
    "CONTACT",
    "REQUEST_INFO",
    "REQUEST_QUOTE",
    "ORDER",
    "PAY",
    "REVIEW",
    "REFER",
  ]).optional(),
  destination: z.enum(["PROMOTION", "SALES", "CARE", "PRINT", "OTHER"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

export const PATCH = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M2")

  const { id } = await params
  if (!id) {
    throw validationFailed({ id: "Thiếu id nơi dùng" })
  }

  const body = await request.json().catch(() => null)
  const parsed = updateUsageSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { data } = parsed
  const updated = await updateAssetUsageUseCase(ctx, {
    id,
    title: data.title,
    ctaCode: data.cta_code as CtaCode | undefined,
    destination: data.destination as UsageDestination | undefined,
    status: data.status as AssetUsageStatus | undefined,
    config: data.config,
  })

  return jsonResponse({ data: updated })
})

