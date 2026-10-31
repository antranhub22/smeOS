import { log } from "@/core/observability/log"
import { matchStandardBankTransfers } from "./match-standard-bank-transfers"
import { remindCollectDue } from "./remind-collect-due"

const STARTED = Symbol.for("smeos.orders.bank-match")
const INTERVAL_MS = 60 * 1000

/**
 * Mỗi phút (gọi từ `src/instrumentation.ts`, sau bộ quét Thẻ chào): khớp chuyển khoản cho đơn ngoài Thẻ chào,
 * rồi nhắc thu tiền đơn giao trước đã quá hạn.
 * Một lần mỗi tiến trình; vòng trước chưa xong thì bỏ lượt; `unref`. Tắt bằng `ORDERS_BANK_MATCH=off`.
 */
export function startOrdersBankMatchSweep(): void {
  const g = globalThis as unknown as Record<symbol, boolean | undefined>
  if (g[STARTED]) return
  if (process.env["ORDERS_BANK_MATCH"] === "off") return
  g[STARTED] = true
  let running = false
  const timer = setInterval(() => {
    if (running) return
    running = true
    matchStandardBankTransfers()
      .then(async (r) => {
        if (r.matched > 0) log.info("orders.bank_match", { feature: "orders", ...r })
        const due = await remindCollectDue()
        if (due.reminded > 0) log.info("orders.collect_due_reminded", { feature: "orders", ...due })
      })
      .catch((error: unknown) => {
        log.error("orders.bank_match_failed", { feature: "orders", message: error instanceof Error ? error.message : String(error) })
      })
      .finally(() => {
        running = false
      })
  }, INTERVAL_MS)
  timer.unref?.()
}
