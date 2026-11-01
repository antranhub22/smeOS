import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import type { UsageDestination } from "@/modules/marketing-center/domain/asset-type"
import type { AssetUsageStatus } from "@/modules/marketing-center/domain/asset-usage"
import type { CtaCode } from "@/modules/marketing-center/domain/cta-registry"
import { createAssetUsageUseCase } from "@/modules/marketing-center/use-cases/create-asset-usage.use-case"
import { listAssetUsagesUseCase } from "@/modules/marketing-center/use-cases/list-asset-usages.use-case"

const createUsageSchema = z.object({
  source_type: z.string().min(1, "source_type không được để trống"),
  source_id: z.string().min(1, "source_id không được để trống"),
  asset_type_code: z.string().min(1, "asset_type_code không được để trống"),
  destination: z.enum(["PROMOTION", "SALES", "CARE", "PRINT", "OTHER"]),
  cta_code: z.enum([
    "LEARN_MORE",
    "CONTACT",
    "REQUEST_INFO",
    "REQUEST_QUOTE",
    "ORDER",
    "PAY",
    "REVIEW",
    "REFER",
  ]),
  title: z.string().min(1, "Tên nơi dùng không được để trống").max(200),
  channel_id: z.string().optional(),
  target_path: z.string().optional(),
  campaign_id: z.string().nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M1")

  const url = new URL(request.url)
  const sourceType = url.searchParams.get("source_type") ?? undefined
  const sourceId = url.searchParams.get("source_id") ?? undefined
  const destination = (url.searchParams.get("destination") as UsageDestination) ?? undefined
  const status = (url.searchParams.get("status") as AssetUsageStatus) ?? undefined

  const take = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }

  const items = await listAssetUsagesUseCase(ctx, {
    sourceType,
    sourceId,
    destination,
    status,
    take,
  })

  return jsonResponse({ data: items })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M2")

  const body = await request.json().catch(() => null)
  const parsed = createUsageSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { data } = parsed
  const result = await createAssetUsageUseCase(ctx, {
    sourceType: data.source_type,
    sourceId: data.source_id,
    assetTypeCode: data.asset_type_code,
    destination: data.destination as UsageDestination,
    ctaCode: data.cta_code as CtaCode,
    title: data.title,
    channelId: data.channel_id,
    targetPath: data.target_path,
    campaignId: data.campaign_id,
    config: data.config,
  })

  return jsonResponse({ data: result }, { status: 201 })
})

