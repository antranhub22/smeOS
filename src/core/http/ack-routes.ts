import { pathPattern } from "./deprecation"

/**
 * Route chỉ trả xác nhận (không mang dữ liệu) mà trang khách gọi kiểu "bắn rồi quên" — `fetch(...)`
 * không đọc thân phản hồi (đếm lượt xem, nhận chủ phiên rồi `router.refresh()`).
 *
 * Chromium không hoàn tất một request có `Cache-Control: no-store` khi trang không đọc thân: kết nối bị
 * giữ tới khi GC dọn đối tượng `Response`, và trang không bao giờ "rảnh mạng" (`networkidle`). Mặc định
 * `no-store` của `jsonResponse` (audit API-17) vì vậy được hạ thành `no-cache` cho đúng các route này,
 * kể cả phản hồi lỗi. `no-cache` vẫn bắt hỏi lại máy chủ; phản hồi POST không bị dùng lại từ bộ đệm.
 *
 * Thêm route vào đây khi client gọi mà không đọc thân và thân không chứa dữ liệu cần giấu.
 */
export const ACK_ONLY_ROUTES: readonly { method: "POST"; path: string }[] = [
  { method: "POST", path: "/api/v1/public/greeting-catalog/[id]/event" },
  { method: "POST", path: "/api/v1/public/brochure/[sendCode]/event" },
  { method: "POST", path: "/api/v1/public/brochure/[sendCode]/claim" },
]

export function isAckOnlyRoute(method: string, pathname: string): boolean {
  return ACK_ONLY_ROUTES.some((route) => route.method === method.toUpperCase() && pathPattern(route.path).test(pathname))
}

/** Đổi `no-store` mặc định thành `no-cache` cho route chỉ xác nhận; route tự đặt giá trị khác giữ nguyên. */
export function withAckCacheHeader(response: Response, method: string, pathname: string): Response {
  if (!isAckOnlyRoute(method, pathname) || response.headers.get("cache-control") !== "no-store") return response
  try {
    response.headers.set("cache-control", "no-cache")
  } catch {
    // Header bất biến — giữ nguyên phản hồi
  }
  return response
}
