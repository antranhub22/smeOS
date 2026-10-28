import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Chữ ký webhook Facebook/Messenger: header `X-Hub-Signature-256: sha256=<hex>` là HMAC-SHA256
 * của THÂN GỐC với App Secret. Thiếu secret hoặc header → luôn từ chối (audit AUD-028: trước đây
 * route nhận mọi POST không kiểm chữ ký, ai cũng giả được tin nhắn và đốt lượt AI của tiệm).
 */
export function verifyFacebookSignature(rawBody: string, header: string | null, appSecret: string | undefined): boolean {
  if (!header || !appSecret?.trim()) return false
  const received = header.replace(/^sha256=/i, "").trim().toLowerCase()
  const expected = createHmac("sha256", appSecret.trim()).update(rawBody, "utf8").digest("hex")
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** So khớp verify token khi Facebook đăng ký webhook (GET). Không có token cấu hình → từ chối. */
export function matchesVerifyToken(provided: string | null, configured: string | undefined): boolean {
  if (!provided || !configured?.trim()) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(configured.trim())
  return a.length === b.length && timingSafeEqual(a, b)
}
