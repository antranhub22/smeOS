/**
 * Bộ quét P3b: giao dịch SePay mà bộ khớp Thẻ chào để lại "chưa khớp" → thử khớp đơn ngoài Thẻ chào theo mã đơn
 * `DH<yymmdd>-<4 số>` trong nội dung chuyển khoản (§4.2 mục 5: bộ khớp mới đi SAU bộ khớp Thẻ chào). Không sửa mã
 * Thẻ chào; chỉ nhận dòng còn "chưa khớp" và không gắn đơn nào. Số tiền vượt phần còn phải thu → để nguyên cho
 * Điều hành xử lý tay.
 */

import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import { StandardPaymentRepository } from "../infra/standard-payment-repository"
import { extractStandardOrderCode } from "../workflow/standard-payment"

export const BANK_MATCH_LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000
const BATCH = 100
const ACTOR = "system:sepay-orders"

function systemContext(organizationId: string): TenantContext {
  return { organizationId, workspaceId: "", userId: ACTOR, branchId: null, capabilities: new Set() }
}

export async function matchStandardBankTransfers(
  now = new Date(),
  repo: Pick<StandardPaymentRepository, "listUnmatched" | "record"> = new StandardPaymentRepository(),
) {
  const events = await repo.listUnmatched(new Date(now.getTime() - BANK_MATCH_LOOKBACK_MS), BATCH)
  const result = { scanned: events.length, matched: 0, skipped: 0 }
  for (const e of events) {
    const code = extractStandardOrderCode(e.content)
    if (!code) {
      result.skipped += 1
      continue
    }
    try {
      await repo.record(
        systemContext(e.organization_id),
        { code },
        { amountVnd: Math.round(Number(e.amount_vnd)), method: "BANK_TRANSFER", reference: `${e.provider}:${e.external_id}`, note: "Tự khớp chuyển khoản" },
        e.id,
      )
      result.matched += 1
    } catch (error: unknown) {
      // Không tìm thấy đơn / vượt số còn phải thu / đã xử lý: để nguyên dòng "chưa khớp".
      result.skipped += 1
      log.info("orders.bank_match_skipped", { organizationId: e.organization_id, feature: "orders", message: error instanceof Error ? error.message : String(error) })
    }
  }
  return result
}
