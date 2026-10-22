import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { PENDING_APPROVAL_MESSAGE } from "@/modules/organization/domain/account-approval"
import { startInstantTrial } from "@/modules/organization/use-cases/instant-trial"

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z.string().min(8, "Vui lòng nhập số điện thoại hoặc Zalo hợp lệ"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  industry_key: z.string().nullish(),
})

export const POST = handle(async (request) => {
  // Mỗi lần gọi tạo một tổ chức + nạp dữ liệu mẫu — chặn tạo hàng loạt từ một IP.
  await enforceRateLimit(request, { scope: "instant-trial-ip", limit: 5, windowMs: 60 * 60_000 })
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
      // PO 22/10/2026: dùng thử chờ superadmin duyệt — không mở phiên
      status: "PENDING_APPROVAL",
      message: PENDING_APPROVAL_MESSAGE,
    },
    { status: 202 }
  )
})
