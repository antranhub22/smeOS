import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { createReview, listReviews } from "@/modules/shop-reviews/use-cases/manage-shop-reviews"

/** Đánh giá khách do chủ tiệm nhập — hiện trên trang khách Landing/Catalog (`J1`). */
const createSchema = z.object({
  authorName: z.string(),
  occasion: z.string().nullable().optional(),
  rating: z.number().int(),
  comment: z.string(),
  isVisible: z.boolean().optional(),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  return jsonResponse({ data: await listReviews(ctx) })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await createReview(ctx, parsed.data) }, { status: 201 })
})
