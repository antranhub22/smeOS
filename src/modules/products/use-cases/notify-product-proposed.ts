import { runInBackground } from "@/core/runtime/background"
import type { TenantContext } from "@/core/tenancy"
import { notifyStaffEvent } from "@/modules/greeting-card/use-cases/notify-staff"

/**
 * Báo Điều hành có mẫu đề xuất mới cần duyệt — đi qua ma trận thông báo nhân
 * viên sẵn có (Hộp việc + kênh tiệm đã bật). Chạy nền: thông báo lỗi không
 * được chặn việc tạo mẫu (`notifyStaffEvent` vốn không ném lỗi).
 */
export function notifyProductProposed(ctx: TenantContext, product: { name: string; code: string }) {
  runInBackground("products.notify_proposed", () =>
    notifyStaffEvent(ctx.organizationId, "PRODUCT_PROPOSED", {
      productName: product.name,
      extraNote: `Mã ${product.code}`,
    })
  )
}
