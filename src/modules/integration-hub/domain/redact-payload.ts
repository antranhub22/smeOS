/**
 * Che dữ liệu cá nhân và bí mật trước khi lưu payload sự kiện vào nhật ký.
 * Giới hạn độ sâu và độ dài để một payload lớn/độc không làm phình bảng.
 */

const SECRET_KEY = /(token|secret|password|signature|authorization|api[_-]?key)/i
const PHONE = /(\+?84|0)(\d[\s.-]?){8,10}\d/g
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const MAX_DEPTH = 6
const MAX_STRING = 500
const MAX_KEYS = 100

function redactString(value: string): string {
  const masked = value.replace(EMAIL, "[email]").replace(PHONE, "[sđt]")
  return masked.length > MAX_STRING ? `${masked.slice(0, MAX_STRING)}…` : masked
}

export function redactPayload(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[…]"
  if (typeof value === "string") return redactString(value)
  if (Array.isArray(value)) return value.slice(0, MAX_KEYS).map((item) => redactPayload(item, depth + 1))
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value).slice(0, MAX_KEYS)) {
      out[key] = SECRET_KEY.test(key) ? "[đã ẩn]" : redactPayload(item, depth + 1)
    }
    return out
  }
  return value
}
