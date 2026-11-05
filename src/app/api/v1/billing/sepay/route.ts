import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { handlePlatformSepay } from "@/modules/subscription/use-cases/sepay-platform-webhook"

const bodySchema = z.object({
  id: z.union([z.number().int(), z.string().min(1).max(64)]),
  transferType: z.string().max(10),
  transferAmount: z.number().nonnegative().max(100_000_000_000),
  content: z.string().max(2000).default(""),
})

function apiKeyFrom(request: Request): string | null {
  const m = /^apikey\s+(\S+)$/i.exec((request.headers.get("authorization") ?? "").trim())
  return m?.[1] ?? null
}

/**
 * POST /api/v1/billing/sepay — SePay báo giao dịch vào tài khoản nhận tiền thuê bao của nền tảng
 * (checklist ALG 10.7). Xác thực `Authorization: Apikey <SEPAY_PLATFORM_API_KEY>`; chưa cấu hình khoá → 404.
 */
export const POST = handle(async (request) => {
  await enforceRateLimit(request, { scope: "sepay-platform-webhook", limit: 600, windowMs: 60_000 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ body: "Dữ liệu webhook không hợp lệ" })
  const result = await handlePlatformSepay(apiKeyFrom(request), parsed.data)
  return jsonResponse({ success: true, ...result })
})

export const dynamic = "force-dynamic"
