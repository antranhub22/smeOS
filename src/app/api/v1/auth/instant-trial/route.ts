import { z } from "zod"

import { serializeSessionCookie } from "@/core/http/cookies"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { SESSION_TTL_SECONDS } from "@/modules/organization/domain/session-policy"
import { startInstantTrial } from "@/modules/organization/use-cases/instant-trial"

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z.string().min(8, "Vui lòng nhập số điện thoại hoặc Zalo hợp lệ"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  industry_key: z.string().nullish(),
})

export const POST = handle(async (request) => {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const result = await startInstantTrial({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    industryKey: parsed.data.industry_key ?? undefined,
  })

  return jsonResponse(
    {
      user_id: result.userId,
      organization_id: result.organizationId,
      organization_name: result.organizationName,
      industry_key: result.industryKey,
    },
    {
      status: 201,
      headers: { "set-cookie": serializeSessionCookie(result.token, SESSION_TTL_SECONDS) },
    }
  )
})
