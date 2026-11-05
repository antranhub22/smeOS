/** GET (`N1`) / PUT (`N19`) /api/v1/platform/billing-account — tài khoản nhận tiền thuê bao của nền tảng (checklist ALG 10.7). */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getBillingAccount, setBillingAccount } from "@/modules/subscription/use-cases/manage-subscription"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await getBillingAccount(pctx) })
})

export const PUT = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await setBillingAccount(pctx, await request.json().catch(() => null)) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
