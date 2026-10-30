import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { BULK_MAX_IDS, bulkUpdateStatus } from "@/modules/products/use-cases/bulk-update-status"

const bodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(BULK_MAX_IDS),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
})

/** `POST /products/bulk-status` (`L3`; chuyển `ARCHIVED` thêm `L4` — cùng luật `PATCH /products/:id`). */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L3")
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  if (parsed.data.status === "ARCHIVED") requireCapability(ctx, "L4")
  return jsonResponse(await bulkUpdateStatus(ctx, parsed.data.ids, parsed.data.status))
})
