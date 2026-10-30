import { handle } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { recordDataExport } from "@/modules/audit/use-cases/record-data-export"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { exportVoucherBatchCsv } from "@/modules/promotions/use-cases/export-voucher-batch"

/** `GET /vouchers/batches/:id/export` (`Q8`) — tải danh sách mã (CSV) để in thiệp / gửi khách. */
export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q8")
  const { id } = await context.params
  const file = await exportVoucherBatchCsv(ctx, id)
  await recordDataExport(ctx, "voucher_codes", { batch: id })
  return new Response(file.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  })
})
