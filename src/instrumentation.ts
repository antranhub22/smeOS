import type { Instrumentation } from "next"

import { reportRequestError } from "@/core/observability/request-error"

/**
 * Next.js gọi `register()` một lần khi tiến trình máy chủ khởi động (Next 16, `instrumentation.ts`).
 * Chỉ chạy ở runtime Node — bộ quét nền dùng Prisma, không chạy ở Edge.
 */
export async function register(): Promise<void> {
  if (process.env["NEXT_RUNTIME"] !== "nodejs") return
  const { startBackgroundSweep } = await import("@/modules/greeting-card/use-cases/background-sweep-scheduler")
  startBackgroundSweep()
}

/** Lỗi máy chủ không ai bắt → log có cấu trúc (rà soát 21/10/2026, giai đoạn 3 — quan trắc). */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  reportRequestError(error, request, context)
}
