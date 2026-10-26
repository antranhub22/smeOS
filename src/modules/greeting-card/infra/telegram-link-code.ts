import { createHmac } from "node:crypto"
import { env } from "@/lib/env"

/**
 * Mã liên kết nhóm Telegram của MỘT tổ chức: HMAC(SESSION_SECRET, tổ chức), không lưu DB.
 *
 * Bot điều phối là bot chung của nền tảng — mọi tenant thêm cùng một bot vào nhóm của mình.
 * Chỉ nhóm nào đã nhắn mã này mới được coi là nhóm của tổ chức (rà soát 21/10/2026, H1).
 */
export function telegramLinkCode(organizationId: string): string {
  const digest = createHmac("sha256", env.SESSION_SECRET).update(`telegram-link:${organizationId}`).digest("hex")
  return `SMEOS-${digest.slice(0, 10).toUpperCase()}`
}
