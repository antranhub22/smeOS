/**
 * Bộ nhắc: đơn giao trước, thu sau đã quá hạn thu mà còn nợ → nhắc Sale phụ trách (OWNER) và báo Điều hành
 * (quan sát). Mỗi đơn nhắc một lần. Chạy cùng bộ quét Đơn hàng (`orders-sweep-scheduler.ts`).
 */

import { log } from "@/core/observability/log"
import { formatCurrency } from "@/lib/i18n/formatters"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"
import { CollectDueRepository } from "../infra/collect-due-repository"

const BATCH = 100

export async function remindCollectDue(
  now = new Date(),
  repo: Pick<CollectDueRepository, "listOverdue" | "markReminded"> = new CollectDueRepository(),
  notify: typeof notifyOrganization = notifyOrganization,
) {
  const rows = await repo.listOverdue(now, BATCH)
  let reminded = 0
  for (const r of rows) {
    try {
      // Đánh dấu trước: lỗi gửi không làm nhắc lặp mỗi phút (thông báo là best-effort)
      await repo.markReminded(r.organization_id, r.order.id, r.order.status)
      await notify({
        organizationId: r.organization_id,
        eventKey: "ORDER_COLLECT_DUE",
        ownerUserId: r.order.owner_sale_id ?? r.requested_by,
        title: `Tới hạn thu tiền — đơn ${r.order.code}`,
        message: `Còn phải thu ${formatCurrency(Number(r.order.balance_vnd))}.`,
        deepLink: "/don-hang?tab=sale",
      })
      reminded += 1
    } catch (error: unknown) {
      log.warn("orders.collect_due_remind_failed", { organizationId: r.organization_id, feature: "orders", message: error instanceof Error ? error.message : String(error) })
    }
  }
  return { scanned: rows.length, reminded }
}
