import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { removeReview, updateReview } from "@/modules/shop-reviews/use-cases/manage-shop-reviews"

const patchSchema = z.object({
  authorName: z.string().optional(),
  occasion: z.string().nullable().optional(),
  rating: z.number().int().optional(),
  comment: z.string().optional(),
  isVisible: z.boolean().optional(),
})

type Ctx = { params: Promise<{ id: string }> }

/** Đánh giá của tổ chức khác → 404 (không lộ là có tồn tại). */
export const PATCH = handle<[Ctx]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  const { id } = await context.params
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const input = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined))
  return jsonResponse({ data: await updateReview(ctx, id, input) })
})

export const DELETE = handle<[Ctx]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  const { id } = await context.params
  await removeReview(ctx, id)
  return jsonResponse({ data: { id } })
})
