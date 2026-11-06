/**
 * Ngành của tổ chức — nguồn chuẩn là cột `organizations.industry_key` (khoá ngoại về `industries`, ADR-012 D-T6).
 *
 * T-6b: mã cũ đọc `settings.industry` ở rất nhiều nơi. Thay vì đổi chữ ký từng nơi, tầng infra gọi
 * `withIndustryKey` ngay khi đọc dòng tổ chức: `settings.industry` được lấy từ cột, nên mọi nơi đọc phía sau dùng
 * cột mà không đổi. Cột trống (mã lạ, dòng chưa đồng bộ) → giữ nguyên `settings`. T-6c bỏ `settings.industry`
 * khỏi CSDL; hàm này vẫn cấp giá trị cho mã phía sau.
 *
 * Luật thuần — không import Prisma.
 */

/** Khoá ngành của một dòng tổ chức: cột trước, `settings.industry` sau, không có thì `null`. */
export function industryKeyOf(org: { industry_key?: string | null; settings?: unknown } | null | undefined): string | null {
  if (!org) return null
  if (org.industry_key) return org.industry_key
  const settings = org.settings && typeof org.settings === "object" && !Array.isArray(org.settings) ? (org.settings as Record<string, unknown>) : null
  return typeof settings?.industry === "string" ? settings.industry : null
}

/** Bản sao dòng tổ chức có `settings.industry` = cột `industry_key` (khi cột có giá trị). */
export function withIndustryKey<T extends { industry_key?: string | null; settings?: unknown }>(org: T): T {
  if (!org.industry_key) return org
  const settings = org.settings && typeof org.settings === "object" && !Array.isArray(org.settings) ? (org.settings as Record<string, unknown>) : {}
  if (settings.industry === org.industry_key) return org
  return { ...org, settings: { ...settings, industry: org.industry_key } }
}
