import { runInBackground } from "@/core/runtime/background"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"
import { formatNumber } from "@/lib/i18n/formatters"

/**
 * Cảnh báo credit (checklist ALG 10.5) — phát nền sau lần trừ đã tính xong, không chặn luồng nghiệp vụ.
 * `USAGE_LIMIT_NEAR`: dùng tới 80% hạn mức tháng (hoặc trần AI). `CREDIT_LOW`: số dư dưới 20% lần nạp gần
 * nhất (hoặc hạn mức tháng). Cờ "một lần mỗi kỳ" đã bật trong cùng giao dịch trừ credit.
 */

export interface CreditAlerts {
  near: Array<{ service: "CREDIT" | "AI"; used: number; limit: number }>
  lowBalance: number | null
}

export function queueCreditAlerts(organizationId: string, alerts: CreditAlerts): void {
  if (alerts.near.length === 0 && alerts.lowBalance === null) return
  runInBackground("credit-alerts", async () => {
    for (const n of alerts.near) {
      await notifyOrganization({
        organizationId,
        eventKey: "USAGE_LIMIT_NEAR",
        title: n.service === "AI" ? "Sắp chạm trần credit AI tháng này" : "Sắp chạm hạn mức credit tháng này",
        message: `Đã dùng ${formatNumber(n.used)}/${formatNumber(n.limit)} credit. Khi chạm hạn mức, các tác vụ dùng credit sẽ tạm dừng tới tháng sau.`,
      })
    }
    if (alerts.lowBalance !== null) {
      await notifyOrganization({
        organizationId,
        eventKey: "CREDIT_LOW",
        title: "Credit sắp hết",
        message: `Số dư còn ${formatNumber(alerts.lowBalance)} credit. Nạp thêm để không gián đoạn các tác vụ AI và tin nhắn.`,
      })
    }
  })
}
