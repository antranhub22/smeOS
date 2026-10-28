/**
 * Thoát ký tự cho nội dung thông báo gửi ra kênh ngoài (email HTML, Telegram `parse_mode: HTML`).
 * Tiêu đề/nội dung có thể chứa dữ liệu khách nhập (tên, địa chỉ…) — AUD-016.
 */
export function escapeNotificationHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Chỉ nhận link http(s) tuyệt đối; còn lại (javascript:, data:…) trả null. */
export function safeHttpLink(raw: string | undefined | null): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}
