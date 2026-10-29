import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getRecipe, saveRecipe } from "@/modules/costing/use-cases/costing-service"

/** `GET /costing/recipes/:productId` (`L1`) — công thức đã lưu, hoặc bản nháp đọc từ BOM AI (#31). */
export const GET = handle(async (request, context: { params: Promise<{ productId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L1")
  const { productId } = await context.params
  return jsonResponse({ data: await getRecipe(ctx, productId) })
})

const putSchema = z.object({
  lines: z.array(z.object({ material_id: z.string().min(1), quantity: z.number().positive().max(100_000) })).max(200),
  waste_percent: z.number().min(0).max(99.99).nullable().optional(),
  labor_minutes: z.number().int().min(0).max(100_000).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
})

/** `PUT /costing/recipes/:productId` (`L3`) — lưu công thức (thay toàn bộ dòng, tăng phiên bản). */
export const PUT = handle(async (request, context: { params: Promise<{ productId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L3")
  const { productId } = await context.params
  const parsed = putSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const d = parsed.data
  const saved = await saveRecipe(ctx, productId, {
    lines: d.lines.map((l) => ({ materialId: l.material_id, quantity: l.quantity })),
    wastePercent: d.waste_percent ?? null,
    laborMinutes: d.labor_minutes ?? null,
    note: d.note ?? null,
  })
  return jsonResponse({ data: saved })
})
