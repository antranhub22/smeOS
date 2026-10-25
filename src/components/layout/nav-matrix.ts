/**
 * nav-matrix.ts — Industry Navigation Matrix SSOT
 *
 * Lớp 1 trong chuỗi lọc 3 lớp: Industry Nav Matrix → RBAC → Feature Lock.
 * Admin SaaS cấu hình tại Console `/van-hanh` — tổ chức KHÔNG biết/KHÔNG thấy.
 *
 * Mỗi mục sidebar có một `navKey` duy nhất. Matrix xác định mục nào hiển thị
 * cho ngành nào dựa trên `hiddenNavKeys` trong Industry Plugin.
 *
 * Luật thuần — không import React, không import Prisma.
 */

import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"
import matrixOverrides from "@/lib/data/industry-nav-matrix-overrides.json"

/**
 * Toàn bộ navKey hợp lệ trong hệ thống.
 * Đăng ký ở đây trước khi dùng trong NAV_ENTRIES.
 */
export const ALL_NAV_KEYS = [
  "home",
  "customers",
  "orders",
  "chat",
  "catalog",
  "greeting-card",
  "products",
  "availability",
  "create-product",
  "bulk-import",
  "scan-photo",
  "storage",
  "pricing",
  "market-intel",
  "creative-studio",
  "marketing-photo",
  "video",
  "content",
  "schedule",
  "templates",
  "coordinator",
  "chain-data",
  "jobs",
  "approval",
  "stats",
  "usage",
  "audit",
  "profile",
  "knowledge",
  "ai-policy",
  "channels",
  "engine",
  "settings",
] as const

export type NavKey = (typeof ALL_NAV_KEYS)[number]

/** Ánh xạ href → navKey để liên kết NAV_ENTRIES với matrix. */
export const HREF_TO_NAV_KEY: Record<string, NavKey> = {
  "/": "home",
  "/khach-hang": "customers",
  "/don-hang": "orders",
  "/hoi-thoai": "chat",
  "/catalog": "catalog",
  "/the-chao": "greeting-card",
  "/san-pham": "products",
  "/san-pham/kha-dung": "availability",
  "/san-pham/tao-moi": "create-product",
  "/san-pham/nhap-hang-loat": "bulk-import",
  "/tai-anh": "scan-photo",
  "/kho-du-lieu": "storage",
  "/gia": "pricing",
  "/market-intelligence": "market-intel",
  "/creative-studio": "creative-studio",
  "/creative-studio?tab=area-d": "marketing-photo",
  "/video": "video",
  "/noi-dung": "content",
  "/lich-dang": "schedule",
  "/kho-templates": "templates",
  "/dieu-phoi": "coordinator",
  "/du-lieu": "chain-data",
  "/job": "jobs",
  "/duyet": "approval",
  "/so-lieu": "stats",
  "/muc-dung": "usage",
  "/audit": "audit",
  "/ho-so": "profile",
  "/tri-thuc": "knowledge",
  "/cai-dat-ai": "ai-policy",
  "/ket-noi": "channels",
  "/bo-may": "engine",
  "/cai-dat": "settings",
}

/**
 * Tính toán tập navKey bị ẩn cho một ngành cụ thể.
 *
 * Lớp 1: Đọc từ Platform Admin Overrides (nếu có cấu hình tại Console `/van-hanh`).
 * Mặc định: Đọc từ Industry Plugin (code-level SSOT).
 */
export function getHiddenNavKeys(
  industryKey?: string | null,
  customOverrides?: Record<string, string[]>
): ReadonlySet<string> {
  const plugin = getIndustryPlugin(industryKey)
  const defaultHidden = plugin.navigation.hiddenNavKeys
  const overridesSource = customOverrides ?? (matrixOverrides as Record<string, string[]>)
  const key = plugin.identity.key
  const overrideHidden = overridesSource[key]

  if (Array.isArray(overrideHidden) && overrideHidden.length > 0) {
    return new Set(overrideHidden)
  }
  return new Set(defaultHidden)
}

/**
 * Kiểm tra một navKey có hiển thị cho ngành đã cho hay không.
 */
export function isNavKeyVisible(
  navKey: string,
  industryKey?: string | null
): boolean {
  const hidden = getHiddenNavKeys(industryKey)
  return !hidden.has(navKey)
}

/**
 * Lọc danh sách href: chỉ giữ lại href có navKey được hiển thị cho ngành.
 */
export function filterHrefsByIndustry(
  hrefs: readonly string[],
  industryKey?: string | null
): string[] {
  const hidden = getHiddenNavKeys(industryKey)
  return hrefs.filter((href) => {
    const navKey = HREF_TO_NAV_KEY[href]
    if (!navKey) return true // href không có trong matrix → luôn hiện
    return !hidden.has(navKey)
  })
}
