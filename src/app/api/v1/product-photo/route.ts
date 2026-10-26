import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { readIdempotencyKey } from "@/modules/jobs/domain/idempotency"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { createProductPhotoJob } from "@/modules/product-photo-studio/use-cases/create-product-photo-job"
import { BACKGROUND_PRESETS, ASPECT_RATIO_OPTIONS } from "@/modules/product-photo-studio/domain/preset-catalog"

const postSchema = z.object({
  asset_id: z.string().min(1, "Bắt buộc phải có asset_id"),
  preset_id: z.string().optional(),
  aspect_ratio: z.string().optional(),
  custom_note: z.string().optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)

  const idempotencyKey = readIdempotencyKey(request)
  if (!idempotencyKey) {
    throw validationFailed({ "idempotency-key": "Bắt buộc phải có header Idempotency-Key" })
  }

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const result = await createProductPhotoJob(ctx, {
    assetId: parsed.data.asset_id,
    presetId: parsed.data.preset_id,
    aspectRatio: parsed.data.aspect_ratio,
    customNote: parsed.data.custom_note,
    idempotencyKey,
  })

  return jsonResponse(
    {
      job_id: result.job.id,
      status: result.job.status,
      usage: {
        cost_credit: result.usage.costCredit,
        balance_after: result.usage.balanceAfter,
      },
    },
    { status: 201 }
  )
})

export const GET = handle(async () => {
  return jsonResponse({
    presets: BACKGROUND_PRESETS,
    aspect_ratios: ASPECT_RATIO_OPTIONS,
  })
})
