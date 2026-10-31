import type { Instrumentation } from "next"

import { reportRequestError } from "@/core/observability/request-error"

/**
 * Next.js gọi `register()` một lần khi tiến trình máy chủ khởi động (Next 16, `instrumentation.ts`).
 * Chỉ chạy ở runtime Node — bộ quét nền dùng Prisma, không chạy ở Edge.
 */
export async function register(): Promise<void> {
  if (process.env["NEXT_RUNTIME"] !== "nodejs") return
  // Theo dõi lỗi (E1.5): chỉ bật khi có SENTRY_DSN — thiếu thì chỉ còn log JSON như trước.
  const dsn = process.env["SENTRY_DSN"]
  if (dsn) {
    const [{ initSentryErrorTracker }, { setErrorTracker }] = await Promise.all([
      import("@/core/observability/adapters/sentry-error-tracker"),
      import("@/core/observability/error-tracker"),
    ])
    setErrorTracker(initSentryErrorTracker(dsn))
  }
  const { startBackgroundSweep } = await import("@/modules/greeting-card/use-cases/background-sweep-scheduler")
  startBackgroundSweep()
  // Đơn quá hạn thanh toán → lead cứu đơn (Đơn hàng đa nguồn, PO 31/10/2026) — chỉ đọc sự kiện huỷ.
  const { startLeadRecoverySweep } = await import("@/modules/acquisition/use-cases/lead-recovery-scheduler")
  startLeadRecoverySweep()
  // Chuyển khoản SePay còn "chưa khớp" sau bộ khớp Thẻ chào → khớp đơn ngoài Thẻ chào (P3b).
  const { startOrdersBankMatchSweep } = await import("@/modules/orders/use-cases/orders-sweep-scheduler")
  startOrdersBankMatchSweep()
}

/** Lỗi máy chủ không ai bắt → log có cấu trúc (rà soát 21/10/2026, giai đoạn 3 — quan trắc). */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  reportRequestError(error, request, context)
}
