/**
 * Ngành của tổ chức — nguồn chuẩn là cột `organizations.industry_key` (khoá ngoại về `industries`, ADR-012 D-T6).
 *
 * Đọc (T-6b, T-6c-1): mã cũ đọc `settings.industry` ở rất nhiều nơi. Thay vì đổi chữ ký từng nơi, tầng infra gọi
 * `withIndustryKey` (hoặc `withOrganizationIndustry` cho dòng lồng `organization`) ngay khi đọc: `settings.industry`
 * được lấy từ cột, nên mọi nơi đọc phía sau dùng cột mà không đổi. Cột trống → giữ nguyên `settings` (dự phòng
 * cho dòng cũ tới T-6c-2).
 *
 * Ghi (T-6c-1): `splitIndustrySettings` tách `industry` khỏi settings trước khi ghi — cột nhận mã, JSON không còn
 * khoá `industry`. T-6c-2 xoá `settings.industry` còn lại trong CSDL và trigger đồng bộ.
 *
 * Luật thuần — không import Prisma.
 */
import { ALL_INDUSTRY_KEYS } from "./industry-profile"

type SettingsCarrier = { industry_key?: string | null; settings?: unknown }

function settingsObject(settings: unknown): Record<string, unknown> | null {
  return settings && typeof settings === "object" && !Array.isArray(settings) ? (settings as Record<string, unknown>) : null
}

/** Khoá ngành của một dòng tổ chức: cột trước, `settings.industry` sau, không có thì `null`. */
export function industryKeyOf(org: SettingsCarrier | null | undefined): string | null {
  if (!org) return null
  if (org.industry_key) return org.industry_key
  const industry = settingsObject(org.settings)?.industry
  return typeof industry === "string" ? industry : null
}

/** Bản sao dòng tổ chức có `settings.industry` = cột `industry_key` (khi cột có giá trị). */
export function withIndustryKey<T extends SettingsCarrier>(org: T): T {
  if (!org.industry_key) return org
  const settings = settingsObject(org.settings) ?? {}
  if (settings.industry === org.industry_key) return org
  return { ...org, settings: { ...settings, industry: org.industry_key } }
}

/** Như `withIndustryKey` cho dòng có quan hệ lồng `organization` (phiên, catalog, đơn…). */
export function withOrganizationIndustry<T extends { organization?: SettingsCarrier | null }>(row: T): T
export function withOrganizationIndustry<T extends { organization?: SettingsCarrier | null }>(row: T | null): T | null
export function withOrganizationIndustry<T extends { organization?: SettingsCarrier | null }>(row: T | null): T | null {
  if (!row?.organization) return row
  const organization = withIndustryKey(row.organization)
  return organization === row.organization ? row : { ...row, organization }
}

/** Mã ngành hợp lệ (theo plugin, khớp bảng `industries`), không phân biệt hoa thường; mã lạ → `null`. */
export function normalizeIndustryKey(value: unknown): string | null {
  if (typeof value !== "string") return null
  const key = value.trim().toUpperCase()
  return (ALL_INDUSTRY_KEYS as readonly string[]).includes(key) ? key : null
}

/**
 * Tách `industry` khỏi settings sắp ghi. Có khoá `industry` → `industryKey` là mã chuẩn hoá (mã lạ → `null`, như
 * trigger T-6a); không có → `industryKey` là `undefined` (không đụng cột).
 */
export function splitIndustrySettings(settings: Record<string, unknown>): { settings: Record<string, unknown>; industryKey?: string | null } {
  if (!("industry" in settings)) return { settings }
  const { industry, ...rest } = settings
  return { settings: rest, industryKey: normalizeIndustryKey(industry) }
}
