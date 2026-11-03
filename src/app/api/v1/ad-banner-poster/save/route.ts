import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { saveBannerToLibraryUseCase } from "@/modules/ad-banner-poster/use-cases/save-banner-to-library.use-case"

const saveBannerSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  asset_type_code: z.string().min(1, "Mã loại asset không được để trống").max(20),
  image_data: z.string().min(1, "Dữ liệu hình ảnh không được để trống"),
  product_id: z.string().nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "G2")

  const body = await request.json().catch(() => null)
  const parsed = saveBannerSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { data } = parsed
  const result = await saveBannerToLibraryUseCase(ctx, {
    title: data.title,
    assetTypeCode: data.asset_type_code,
    imageData: data.image_data,
    productId: data.product_id,
    width: data.width,
    height: data.height,
    metadata: data.metadata,
  })

  return jsonResponse(result, { status: 201 })
})

