/**
 * industry-profile.ts — Định nghĩa và danh mục cấu hình ngành (Industry Profile SSOT)
 *
 * Cho phép smeOS thích ứng linh hoạt đa ngành (Bán lẻ, Thời trang, F&B, Quà tặng/Thủ công, Dịch vụ, Hoa tươi)
 * mà không phải sửa đổi cấu trúc CSDL hay viết lại logic nghiệp vụ cốt lõi.
 *
 * Tích hợp kiến trúc IndustryPluginContract SSOT:
 * Quản lý tập trung mọi thông tin từ Định danh, Thuật ngữ, Danh mục, BOM, Template in ấn đến AI Config.
 *
 * Luật thuần — Không import Prisma, không phụ thuộc client.
 */

import type {
  IndustryPluginContract,
  IndustryTerminology as PluginTerminology,
} from "./industry-plugin-contract"
import { INDUSTRY_REGISTRY } from "./industries"

export type IndustryKey =
  | "FLORAL"          // Hoa & Cây cảnh (Ngành mặc định/kế thừa)
  | "FASHION"         // Thời trang, may mặc, phụ kiện
  | "FNB"             // Ẩm thực, nhà hàng, quán cafe, tiệm bánh
  | "CRAFT_GIFT"      // Quà tặng, đồ thủ công, đồ trang trí
  | "RETAIL_GENERAL"  // Bán lẻ tổng hợp, siêu thị mini, tạp hóa
  | "SERVICES"        // Dịch vụ, salon, spa, sửa chữa
  | "HOMESTAY"        // Homestay, lưu trú, villa, căn hộ dịch vụ

export const ALL_INDUSTRY_KEYS = [
  "FLORAL",
  "FASHION",
  "FNB",
  "CRAFT_GIFT",
  "RETAIL_GENERAL",
  "SERVICES",
  "HOMESTAY",
] as const

export const DEFAULT_INDUSTRY: IndustryKey = "FLORAL"

export type IndustryTerminology = PluginTerminology

export interface IndustryDefinition {
  readonly key: IndustryKey
  readonly name: string
  readonly description: string
  readonly terms: IndustryTerminology
}

/**
 * Bản đồ tương thích ngược: chuyển đổi từ Plugin sang Definition
 */
export const INDUSTRY_CATALOG: Record<IndustryKey, IndustryDefinition> = Object.fromEntries(
  Object.entries(INDUSTRY_REGISTRY).map(([key, plugin]) => [
    key as IndustryKey,
    {
      key: plugin.identity.key as IndustryKey,
      name: plugin.identity.name,
      description: plugin.identity.description,
      terms: plugin.terminology,
    },
  ])
) as Record<IndustryKey, IndustryDefinition>

/**
 * Lấy đặc tả Plugin đầy đủ 6 khối thành phần của ngành
 */
export function getIndustryPlugin(industryKey?: string | null): IndustryPluginContract {
  if (!industryKey || !(industryKey in INDUSTRY_REGISTRY)) {
    return INDUSTRY_REGISTRY[DEFAULT_INDUSTRY]!
  }
  return INDUSTRY_REGISTRY[industryKey]!
}

/**
 * Lấy định nghĩa ngành, tự động dự phòng về FLORAL nếu không tìm thấy
 */
export function getIndustryDefinition(industryKey?: string | null): IndustryDefinition {
  if (!industryKey || !(industryKey in INDUSTRY_CATALOG)) {
    return INDUSTRY_CATALOG[DEFAULT_INDUSTRY]
  }
  return INDUSTRY_CATALOG[industryKey as IndustryKey]
}

/**
 * Lấy bộ từ điển thuật ngữ tương ứng với ngành
 */
export function getIndustryTerminology(industryKey?: string | null): IndustryTerminology {
  return getIndustryDefinition(industryKey).terms
}

/**
 * Danh sách tất cả các ngành hỗ trợ trong hệ thống
 */
export function listAllIndustries(): readonly IndustryDefinition[] {
  return Object.values(INDUSTRY_CATALOG)
}

/**
 * Danh sách tất cả các Plugin ngành đầy đủ
 */
export function listAllIndustryPlugins(): readonly IndustryPluginContract[] {
  return Object.values(INDUSTRY_REGISTRY)
}

export * from "./industry-plugin-contract"
export * from "./industries"
