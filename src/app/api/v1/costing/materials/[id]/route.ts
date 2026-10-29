import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { updateMaterial } from "@/modules/costing/use-cases/costing-service"

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  unit: z.string().min(1).max(30).optional(),
  category_key: z.string().min(1).optional(),
  unit_cost_vnd: z.number().nonnegative().nullable().optional(),
  supplier_name: z.string().max(120).nullable().optional(),
  on_hand_qty: z.number().nonnegative().nullable().optional(),
  active: z.boolean().optional(),
})

/** `PATCH /costing/materials/:id` (`L6`) — sửa nguyên liệu; đổi đơn giá thì ghi lịch sử. Khác tổ chức → 404. */
export const PATCH = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L6")
  const { id } = await context.params
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const d = parsed.data
  const material = await updateMaterial(ctx, id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.unit !== undefined ? { unit: d.unit } : {}),
    ...(d.category_key !== undefined ? { categoryKey: d.category_key } : {}),
    ...(d.unit_cost_vnd !== undefined ? { unitCostVnd: d.unit_cost_vnd } : {}),
    ...(d.supplier_name !== undefined ? { supplierName: d.supplier_name } : {}),
    ...(d.on_hand_qty !== undefined ? { onHandQty: d.on_hand_qty } : {}),
    ...(d.active !== undefined ? { active: d.active } : {}),
  })
  return jsonResponse({ data: material })
})
