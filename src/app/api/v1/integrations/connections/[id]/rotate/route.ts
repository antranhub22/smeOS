/** POST /api/v1/integrations/connections/:id/rotate — thay khoá mới, kiểm trước khi lưu (W3). */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { rotateCredential } from "@/modules/integration-hub/use-cases/manage-connection"

const schema = z.object({ secret: z.string().min(1).max(4096) })

export const POST = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ secret: "Cần nhập khoá mới" })
  return jsonResponse({ connection: await rotateCredential(ctx, { id, secret: parsed.data.secret }) })
})
