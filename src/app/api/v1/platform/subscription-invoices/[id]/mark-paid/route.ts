/** POST /api/v1/platform/subscription-invoices/:id/mark-paid (`N19`) — `{ note }`, Console xác nhận đã thu (checklist ALG 10.7). */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { confirmInvoicePayment } from "@/modules/subscription/use-cases/manage-subscription"

const bodySchema = z.object({ note: z.string().trim().min(1).max(300) })

export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await confirmInvoicePayment(pctx, id, parsed.data.note) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
