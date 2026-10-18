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

export interface IndustryOrderTerminology {
  readonly deliveryTimeLabel: string
  readonly customerRoleLabel: string
  readonly recipientRoleLabel: string
  readonly addressLabel: string
  readonly emptyAddressText: string
  readonly makerTabLabel: string
  readonly readyDeadlineLabel: string
  readonly fallbackTimeSlotText: string
  /** Nhãn khối Nguyên phụ liệu trên Thẻ Gia Công (vd: "Nguyên phụ liệu & Phong cách", "Vải & Phụ liệu", "Vật tư & Tiện ích") */
  readonly rawMaterialLabel: string
  /** Nhãn phần thông tin nhận hàng / nhận phòng trên Thẻ Gia Công (vd: "Thông tin người nhận", "Thông tin khách lưu trú") */
  readonly recipientInfoLabel: string
  /** Nhãn ảnh mẫu chuẩn tham chiếu trên Thẻ Gia Công (vd: "Ảnh Mẫu Chuẩn", "Ảnh Phòng Chuẩn", "Ảnh Món Chuẩn") */
  readonly referencePhotoLabel: string
}

const ORDER_TERMS_MAP: Record<IndustryKey, IndustryOrderTerminology> = {
  HOMESTAY: {
    deliveryTimeLabel: "Thời gian nhận phòng / lưu trú",
    customerRoleLabel: "Khách đặt phòng",
    recipientRoleLabel: "Khách lưu trú",
    addressLabel: "Địa điểm lưu trú / Cơ sở",
    emptyAddressText: "Chưa có địa chỉ cơ sở lưu trú cụ thể",
    makerTabLabel: "Thẻ chuẩn bị phòng",
    readyDeadlineLabel: "Hạn sẵn sàng đón tiếp",
    fallbackTimeSlotText: "Theo thỏa thuận",
    rawMaterialLabel: "Vật tư & Tiện ích phòng:",
    recipientInfoLabel: "Thông tin khách lưu trú:",
    referencePhotoLabel: "Ảnh Phòng Chuẩn",
  },
  FLORAL: {
    deliveryTimeLabel: "Khung giờ giao hàng",
    customerRoleLabel: "Người đặt hoa",
    recipientRoleLabel: "Người nhận hoa",
    addressLabel: "Địa chỉ giao hàng",
    emptyAddressText: "Chưa có địa chỉ giao hàng cụ thể",
    makerTabLabel: "Thẻ gia công",
    readyDeadlineLabel: "Hạn cắm xong",
    fallbackTimeSlotText: "Trong ngày",
    rawMaterialLabel: "Nguyên phụ liệu & Phong cách cắm:",
    recipientInfoLabel: "Thông tin người nhận:",
    referencePhotoLabel: "Ảnh Mẫu Chuẩn",
  },
  FNB: {
    deliveryTimeLabel: "Thời gian phục vụ / nhận món",
    customerRoleLabel: "Khách đặt món",
    recipientRoleLabel: "Người nhận / dùng món",
    addressLabel: "Địa chỉ giao món / bàn ăn",
    emptyAddressText: "Chưa có địa chỉ giao món cụ thể",
    makerTabLabel: "Thẻ bếp & pha chế",
    readyDeadlineLabel: "Hạn chế biến xong",
    fallbackTimeSlotText: "Trong ngày",
    rawMaterialLabel: "Nguyên liệu & Phong cách chế biến:",
    recipientInfoLabel: "Thông tin khách nhận món:",
    referencePhotoLabel: "Ảnh Món Chuẩn",
  },
  FASHION: {
    deliveryTimeLabel: "Khung giờ giao hàng",
    customerRoleLabel: "Người đặt may / mua",
    recipientRoleLabel: "Người nhận hàng",
    addressLabel: "Địa chỉ giao hàng",
    emptyAddressText: "Chưa có địa chỉ giao hàng cụ thể",
    makerTabLabel: "Thẻ may đo & gia công",
    readyDeadlineLabel: "Hạn may xong",
    fallbackTimeSlotText: "Trong ngày",
    rawMaterialLabel: "Vải & Phụ liệu & Phong cách may:",
    recipientInfoLabel: "Thông tin người nhận hàng:",
    referencePhotoLabel: "Ảnh Mẫu Thiết Kế",
  },
  CRAFT_GIFT: {
    deliveryTimeLabel: "Khung giờ giao hàng",
    customerRoleLabel: "Người đặt quà",
    recipientRoleLabel: "Người nhận quà",
    addressLabel: "Địa chỉ giao hàng",
    emptyAddressText: "Chưa có địa chỉ giao hàng cụ thể",
    makerTabLabel: "Thẻ chế tác thủ công",
    readyDeadlineLabel: "Hạn hoàn thành chế tác",
    fallbackTimeSlotText: "Trong ngày",
    rawMaterialLabel: "Nguyên phụ liệu & Phong cách chế tác:",
    recipientInfoLabel: "Thông tin người nhận quà:",
    referencePhotoLabel: "Ảnh Mẫu Quà Chuẩn",
  },
  SERVICES: {
    deliveryTimeLabel: "Thời gian hẹn dịch vụ",
    customerRoleLabel: "Khách đặt lịch",
    recipientRoleLabel: "Khách sử dụng dịch vụ",
    addressLabel: "Địa điểm thực hiện dịch vụ",
    emptyAddressText: "Chưa có địa điểm thực hiện cụ thể",
    makerTabLabel: "Thẻ thực hiện dịch vụ",
    readyDeadlineLabel: "Thời gian hẹn bắt đầu",
    fallbackTimeSlotText: "Theo lịch hẹn",
    rawMaterialLabel: "Vật tư & Thiết bị & Phong cách:",
    recipientInfoLabel: "Thông tin khách sử dụng dịch vụ:",
    referencePhotoLabel: "Ảnh Dịch Vụ Chuẩn",
  },
  RETAIL_GENERAL: {
    deliveryTimeLabel: "Khung giờ giao hàng",
    customerRoleLabel: "Người đặt hàng",
    recipientRoleLabel: "Người nhận hàng",
    addressLabel: "Địa chỉ giao hàng",
    emptyAddressText: "Chưa có địa chỉ giao hàng cụ thể",
    makerTabLabel: "Thẻ soạn hàng & đóng gói",
    readyDeadlineLabel: "Hạn soạn hàng xong",
    fallbackTimeSlotText: "Trong ngày",
    rawMaterialLabel: "Hàng hóa & Phương thức đóng gói:",
    recipientInfoLabel: "Thông tin người nhận hàng:",
    referencePhotoLabel: "Ảnh Sản Phẩm Chuẩn",
  },
}

/**
 * Lấy các thuật ngữ chuyên biệt cho đơn hàng và luồng điều phối theo ngành SSOT
 */
export function getIndustryOrderTerms(industryKey?: string | null): IndustryOrderTerminology {
  if (!industryKey || !(industryKey in ORDER_TERMS_MAP)) {
    return ORDER_TERMS_MAP[DEFAULT_INDUSTRY]
  }
  return ORDER_TERMS_MAP[industryKey as IndustryKey]
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
