import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { recordPurchase } from "@/modules/costing/use-cases/costing-service"

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        material_id: z.string().min(1),
        quantity: z.number().positive().max(1_000_000),
        unit_cost_vnd: z.number().nonnegative().nullable().optional(),
      }),
    )
    .min(1)
    .max(200),
})

/** `POST /costing/needs/purchase` (`L6`) — đánh dấu "đã mua" từ dự toán (#35): cộng tồn, ghi giá mua thực tế. */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L6")
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const items = parsed.data.items.map((i) => ({ materialId: i.material_id, quantity: i.quantity, unitCostVnd: i.unit_cost_vnd ?? null }))
  return jsonResponse({ data: await recordPurchase(ctx, items) })
})
