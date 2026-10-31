/**
 * Luật khách tiềm năng (công cụ 21) — Pure TypeScript.
 *
 * Khách để lại tên + SĐT trên trang công khai, BẮT BUỘC đồng ý cho cửa hàng liên hệ
 * (Nghị định 13/2023/NĐ-CP): lưu thời điểm + phiên bản lời đồng ý kèm mỗi lead.
 */

import { VN_PHONE, normalizeInquiryPhone } from "@/modules/crm/domain/product-inquiry"

export const LEAD_NAME_MAX = 100
export const LEAD_MESSAGE_MAX = 500
/** Mỗi SĐT tối đa bấy nhiêu lead/giờ mỗi cửa hàng — chặn gửi dồn. */
export const LEAD_PHONE_LIMIT_PER_HOUR = 3
/** Đổi câu chữ đồng ý ở form → tăng phiên bản. */
export const LEAD_CONSENT_VERSION = "2026-10-30"
export const LEAD_CONSENT_TEXT = "Tôi đồng ý để cửa hàng dùng tên và số điện thoại này để liên hệ tư vấn."

/** `IN_PROGRESS` thay `CONTACTED` từ 31/10/2026 (migration `orders_multi_source_lead_link`). */
export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "WON", "LOST"] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Mới",
  IN_PROGRESS: "Đang chăm",
  WON: "Đã chốt",
  LOST: "Không thành",
}

export type LeadSource = "CATALOG_LINK" | "SHORT_LINK" | "LANDING" | "CHAT" | "MANUAL"

export interface LeadInput {
  name: string
  phone: string
  message?: string | undefined
  consent: boolean
}

export interface Utm {
  source: string | null
  medium: string | null
  campaign: string | null
}

/** Lỗi theo trường (tiếng Việt); rỗng = hợp lệ. */
export function validateLeadInput(input: LeadInput): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = input.name.trim()
  if (!name) errors.name = "Vui lòng nhập tên của bạn"
  else if (name.length > LEAD_NAME_MAX) errors.name = `Tên tối đa ${LEAD_NAME_MAX} ký tự`
  if (!VN_PHONE.test(normalizeInquiryPhone(input.phone))) errors.phone = "Số điện thoại di động chưa đúng"
  if ((input.message ?? "").trim().length > LEAD_MESSAGE_MAX) errors.message = `Lời nhắn tối đa ${LEAD_MESSAGE_MAX} ký tự`
  if (input.consent !== true) errors.consent = "Vui lòng đồng ý để cửa hàng liên hệ lại"
  return errors
}

/** Chuỗi UTM: chỉ chữ, số, gạch; tối đa 60 ký tự; rỗng → null. */
export function sanitizeUtmValue(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
  return cleaned || null
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value)
}
