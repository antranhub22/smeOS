/** POST /api/v1/integrations/connections — kết nối bằng khoá/token người dùng nhập (W2). */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { connectWithSecret } from "@/modules/integration-hub/use-cases/manage-connection"

const schema = z.object({
  connectorKey: z.string().min(1).max(64),
  secret: z.string().min(1).max(4096),
  options: z.record(z.string(), z.unknown()).optional(),
})

export const POST = handle(async (req) => {
  const { ctx } = await requireTenantContext(req)
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues.map((i) => i.path.join(".")) })
  const connection = await connectWithSecret(ctx, {
    connectorKey: parsed.data.connectorKey,
    secret: parsed.data.secret,
    ...(parsed.data.options ? { options: parsed.data.options } : {}),
  })
  return jsonResponse({ connection }, { status: 201 })
})
