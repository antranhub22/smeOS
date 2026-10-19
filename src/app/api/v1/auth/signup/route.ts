import { z } from "zod"

import { serializeSessionCookie } from "@/core/http/cookies"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { SESSION_TTL_SECONDS } from "@/modules/organization/domain/session-policy"
import { signUp } from "@/modules/organization/use-cases/sign-up"
// Đăng ký thật: hồ sơ luôn để trống — chỉ instant-trial mới seed data mẫu theo ngành

const schema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string().nullish(),
  organization_name: z.string(),
  industry_key: z.string().nullish(),
  organization_type: z.enum(["SINGLE", "CHAIN"]).default("SINGLE"),
})

export const POST = handle(async (request) => {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const result = await signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name ?? null,
    organizationName: parsed.data.organization_name,
    industryKey: parsed.data.industry_key ?? undefined,
    organizationType: parsed.data.organization_type,
    // PO 08/10/2026: Đăng ký thật luôn để hồ sơ trống — không seed mock data bất kể môi trường.
    // Chỉ luồng instant-trial (dùng thử) mới seed hồ sơ mẫu theo ngành.
    seedProfile: false,
  })

  return jsonResponse(
    { user_id: result.userId, organization_id: result.organizationId },
    {
      status: 201,
      headers: { "set-cookie": serializeSessionCookie(result.token, SESSION_TTL_SECONDS) },
    }
  )
})
