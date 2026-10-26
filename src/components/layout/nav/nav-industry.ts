/**
 * Sidebar Tầng 2: SaaS Ngành (Affiliate Engine & Standardization Hub)
 * Chuẩn hóa ngành hàng + Cỗ máy bán hàng Affiliate tự động xuyên cửa hàng.
 */

import type { NavEntry, NavGroup, NavView } from "./nav-types"

export const INDUSTRY_NAV_ENTRIES: readonly NavEntry[] = [
  // 1. Hệ sinh thái Đa Ngành & Công cụ Affiliate
  {
    href: "/",
    label: "Tổng quan SaaS Ngành",
    group: "he-sinh-thai",
    iconKey: "LayoutDashboard",
    navKey: "industry-overview",
    mobileLabel: "Tổng quan",
  },
  {
    href: "/van-hanh/nganh",
    label: "Ma trận & Plugin Ngành",
    group: "he-sinh-thai",
    iconKey: "Layers",
    navKey: "industry-matrix",
    mobileLabel: "Ngành",
  },
  {
    href: "/kho-templates",
    label: "Kho mẫu ấn phẩm A6",
    group: "he-sinh-thai",
    iconKey: "LayoutTemplate",
    navKey: "industry-templates",
    mobileLabel: "Mẫu A6",
  },
  {
    href: "/landing-page",
    label: "Landing Page Sản phẩm",
    group: "he-sinh-thai",
    iconKey: "Globe",
    navKey: "industry-landing",
    mobileLabel: "Landing",
  },
  {
    href: "/catalog",
    label: "Catalog Liên kết & QR",
    group: "he-sinh-thai",
    iconKey: "QrCode",
    navKey: "industry-catalog",
    capability: "J1",
    mobileLabel: "Catalog",
  },
  {
    href: "/the-chao",
    label: "Thẻ chào Bán hàng",
    group: "he-sinh-thai",
    iconKey: "Sparkles",
    navKey: "industry-greeting-card",
    capability: "R1",
    mobileLabel: "Thẻ chào",
  },

  // 2. Chuẩn hóa, Định lượng & Điều phối
  {
    href: "/san-pham",
    label: "Danh mục & Sản phẩm mẫu",
    group: "chuan-hoa",
    iconKey: "Package",
    navKey: "industry-products",
    capability: "L1",
    mobileLabel: "Sản phẩm",
  },
  {
    href: "/van-hanh/truong-du-lieu",
    label: "Trường dữ liệu mở rộng",
    group: "chuan-hoa",
    iconKey: "SlidersHorizontal",
    navKey: "industry-fields",
    mobileLabel: "Trường",
  },
  {
    href: "/dieu-phoi",
    label: "Điều phối Đơn Tự động",
    group: "chuan-hoa",
    iconKey: "Radio",
    navKey: "industry-dispatch",
    capability: "C23",
    mobileLabel: "Điều phối",
  },
  {
    href: "/dieu-phoi/doi-tac",
    label: "Mạng lưới Shop Đối tác",
    group: "chuan-hoa",
    iconKey: "Building2",
    navKey: "industry-partners",
    mobileLabel: "Đối tác",
  },
  {
    href: "/duyet",
    label: "Duyệt Chất lượng (QC)",
    group: "chuan-hoa",
    iconKey: "CheckCircle2",
    navKey: "industry-approvals",
    capability: "H3",
    mobileLabel: "Duyệt QC",
  },

  // 3. Thị trường, Báo cáo & Đối soát
  {
    href: "/don-hang",
    label: "Trung tâm Đơn Mạng lưới",
    group: "thi-truong",
    iconKey: "ShoppingBag",
    navKey: "industry-orders",
    capability: "R1",
    mobileLabel: "Đơn hàng",
  },
  {
    href: "/market-intelligence",
    label: "Thị trường & Xu hướng",
    group: "thi-truong",
    iconKey: "TrendingUp",
    navKey: "industry-market",
    capability: "V2",
    mobileLabel: "Thị trường",
  },
  {
    href: "/van-hanh/du-lieu",
    label: "Dữ liệu ngành & Đối soát",
    group: "thi-truong",
    iconKey: "Database",
    navKey: "industry-data",
    mobileLabel: "Dữ liệu",
  },
] as const

const INDUSTRY_GROUPS_CONFIG = [
  { key: "he-sinh-thai", label: "Hệ sinh thái Đa Ngành & Công cụ Affiliate" },
  { key: "chuan-hoa", label: "Chuẩn hóa, Định lượng & Điều phối" },
  { key: "thi-truong", label: "Thị trường, Báo cáo & Đối soát" },
] as const

export function buildIndustryNav(can: (code: string) => boolean): NavView {
  const groups: NavGroup[] = []

  for (const config of INDUSTRY_GROUPS_CONFIG) {
    const entries = INDUSTRY_NAV_ENTRIES.filter(
      (entry) =>
        entry.group === config.key &&
        (!entry.capability || can(entry.capability))
    )
    if (entries.length > 0) {
      groups.push({
        key: config.key,
        label: config.label,
        entries: [...entries],
      })
    }
  }

  return { groups }
}
