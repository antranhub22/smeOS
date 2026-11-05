/** GET /api/v1/reports/cashflow?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|week|month (`R20`) — dòng tiền theo hình thức thu, đối chiếu giao dịch ngân hàng (6.6). */
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getCashflowReport } from "@/modules/reporting/use-cases/reports"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const q = new URL(request.url).searchParams
  return jsonResponse({ data: await getCashflowReport(ctx, { from: q.get("from"), to: q.get("to"), granularity: q.get("granularity"), detail: q.get("detail") }) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
