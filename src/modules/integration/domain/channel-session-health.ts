/**
 * Tình trạng phiên tài khoản mạng xã hội (công cụ 54 — `/ket-noi`) — Pure TypeScript.
 *
 * Dịch vụ đăng bài giữ phiên đăng nhập; nền tảng tự đăng xuất sau một thời gian. Phiên
 * đăng nhập lần cuối quá `STALE_AFTER_DAYS` ngày → nhắc kiểm tra trước khi đăng bài lỗi.
 */

export const STALE_AFTER_DAYS = 30
const DAY_MS = 86_400_000

export type ChannelSessionHealth = "NOT_CONNECTED" | "NEEDS_LOGIN" | "STALE" | "HEALTHY"

export interface ChannelAccountLike {
  is_logged_in: number | boolean
  last_login?: string | null | undefined
}

export function channelSessionHealth(account: ChannelAccountLike | undefined, now: Date): ChannelSessionHealth {
  if (!account) return "NOT_CONNECTED"
  if (!account.is_logged_in) return "NEEDS_LOGIN"
  const last = account.last_login ? new Date(account.last_login).getTime() : Number.NaN
  if (Number.isNaN(last) || now.getTime() - last > STALE_AFTER_DAYS * DAY_MS) return "STALE"
  return "HEALTHY"
}

export interface ChannelHealthSummary {
  healthy: number
  stale: number
  needsLogin: number
}

export function summarizeChannelHealth(accounts: readonly ChannelAccountLike[], now: Date): ChannelHealthSummary {
  const summary: ChannelHealthSummary = { healthy: 0, stale: 0, needsLogin: 0 }
  for (const a of accounts) {
    const h = channelSessionHealth(a, now)
    if (h === "HEALTHY") summary.healthy++
    else if (h === "STALE") summary.stale++
    else if (h === "NEEDS_LOGIN") summary.needsLogin++
  }
  return summary
}
