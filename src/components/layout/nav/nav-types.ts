/**
 * Kiểu dữ liệu điều hướng hệ thống (Navigation Types SSOT)
 * Chuẩn hóa theo đặc tả SMEOS_4_TIER_ARCHITECTURE_AND_NAVIGATION_SSOT.md
 */

import type { RoleUxDefinition } from "@/modules/organization/domain/role-ux-catalog"

export type NavGroupKey =
  | "viec-chinh"
  | "ban-hang"
  | "san-pham"
  | "noi-dung"
  | "van-hanh"
  | "thiet-lap"
  | "to-chuc"
  | "cau-hinh"
  | "giam-sat"
  | "he-sinh-thai"
  | "chuan-hoa"
  | "thi-truong"
  // Tầng 1: SaaS Mother
  | "tong-quan-nen-tang"
  | "quan-tri-to-chuc"
  | "goi-cuoc-doanh-thu"
  | "ha-tang-ai"
  | "bao-mat-kiem-toan"
  // Tầng 2: SaaS Ngành (Affiliate & Standardization)
  | "tong-quan-nganh"
  | "cong-cu-affiliate"
  | "tu-dong-phan-bo"
  | "chuan-hoa-nganh"
  | "doi-soat-hoa-hong"
  // Tầng 3: ChainOS
  | "chi-huy-chuoi"
  | "ban-hang-chuoi"
  | "dieu-phoi-gia-cong"
  | "mang-luoi-chi-nhanh"
  | "bo-suu-tap-chuoi"
  | "doi-soat-chuoi"
  // Tầng 4: StoreOS
  | "viec-chinh-tiem"
  | "ban-hang-tiem"
  | "san-xuat-tiem"
  | "san-pham-kho-tiem"
  | "marketing-tiem"
  | "so-quy-cai-dat"

export interface NavEntry {
  href: string
  label: string
  group: string
  iconKey: string
  navKey: string
  capability?: string
  status?: "READY" | "COMING_SOON"
  mobileLabel?: string
}

export interface NavGroup {
  key: string
  label: string
  entries: NavEntry[]
}

export interface NavView {
  groups: NavGroup[]
}

export const HOME_ENTRY: NavEntry = {
  href: "/",
  label: "Trang chủ",
  group: "viec-chinh",
  iconKey: "Home",
  navKey: "home",
  mobileLabel: "Trang chủ",
}
