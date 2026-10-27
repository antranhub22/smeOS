/**
 * Sidebar Tầng 1: SaaS Mother (Platform Control Center · Quản trị nền tảng SaaS)
 * Quản trị toàn bộ 3 tầng dưới, hạ tầng đám mây, đa tenant, AI resources và bảo mật.
 */

import type { NavEntry, NavGroup, NavView } from "./nav-types"

export const MOTHER_NAV_ENTRIES: readonly NavEntry[] = [
  // 1. TỔNG QUAN
  {
    href: "/van-hanh",
    label: "Tổng quan nền tảng",
    group: "tong-quan",
    iconKey: "LayoutDashboard",
    navKey: "platform-overview",
    mobileLabel: "Tổng quan",
  },

  // 2. TỔ CHỨC & DỊCH VỤ
  {
    href: "/van-hanh/to-chuc",
    label: "Tổ chức & Tenant",
    group: "to-chuc-dich-vu",
    iconKey: "Building2",
    navKey: "platform-organizations",
    mobileLabel: "Tổ chức",
  },
  {
    href: "/van-hanh/dang-ky",
    label: "Đăng ký & Phê duyệt",
    group: "to-chuc-dich-vu",
    iconKey: "UserPlus",
    navKey: "platform-registrations",
    mobileLabel: "Đăng ký",
  },
  {
    href: "/van-hanh/phe-duyet",
    label: "Gói dịch vụ & Đăng ký",
    group: "to-chuc-dich-vu",
    iconKey: "CreditCard",
    navKey: "platform-subscriptions",
    mobileLabel: "Gói cước",
  },
  {
    href: "/van-hanh/nganh",
    label: "Ngành hàng & Năng lực",
    group: "to-chuc-dich-vu",
    iconKey: "Layers",
    navKey: "platform-industry-matrix",
    mobileLabel: "Ngành hàng",
  },
  {
    href: "/van-hanh/nganh?tab=tools",
    label: "Thư viện & Ma trận Công cụ",
    group: "to-chuc-dich-vu",
    iconKey: "LayoutGrid",
    navKey: "platform-toolkit-matrix",
    mobileLabel: "Công cụ",
  },

  // 3. GIÁM SÁT SẢN PHẨM & KHO (toàn nền tảng)
  {
    href: "/van-hanh/san-pham",
    label: "Catalog & Sản phẩm toàn hệ thống",
    group: "san-pham-kho-platform",
    iconKey: "Package",
    navKey: "platform-products",
    mobileLabel: "Sản phẩm",
  },
  {
    href: "/van-hanh/truong-du-lieu",
    label: "Schema & Taxonomy toàn cầu",
    group: "san-pham-kho-platform",
    iconKey: "Layers",
    navKey: "platform-taxonomy",
    mobileLabel: "Schema",
  },
  {
    href: "/van-hanh/du-lieu",
    label: "Tổng hợp Kho & Tồn kho",
    group: "san-pham-kho-platform",
    iconKey: "Folder",
    navKey: "platform-inventory",
    mobileLabel: "Tồn kho",
  },

  // 3. HẠ TẦNG & TÀI NGUYÊN
  {
    href: "/cai-dat-ai",
    label: "AI Providers & Models",
    group: "ha-tang-tai-nguyen",
    iconKey: "Cpu",
    navKey: "platform-ai-providers",
    mobileLabel: "AI Models",
  },
  {
    href: "/van-hanh/muc-dung",
    label: "Mức dùng & Chi phí",
    group: "ha-tang-tai-nguyen",
    iconKey: "WalletCards",
    navKey: "platform-usage",
    mobileLabel: "Mức dùng",
  },
  {
    href: "/van-hanh/du-lieu",
    label: "Dữ liệu & Lưu trữ",
    group: "ha-tang-tai-nguyen",
    iconKey: "Database",
    navKey: "platform-org-data",
    mobileLabel: "Dữ liệu",
  },

  // 4. ĐỘ TIN CẬY & BẢO MẬT
  {
    href: "/van-hanh/suc-khoe",
    label: "Sức khỏe hệ thống",
    group: "do-tin-cay-bao-mat",
    iconKey: "Activity",
    navKey: "platform-health",
    mobileLabel: "Sức khỏe",
  },
  {
    href: "/van-hanh/nhat-ky",
    label: "Bảo mật & Nhật ký kiểm toán",
    group: "do-tin-cay-bao-mat",
    iconKey: "ShieldCheck",
    navKey: "platform-audit",
    mobileLabel: "Kiểm toán",
  },

  // 5. THIẾT LẬP
  {
    href: "/van-hanh/truong-du-lieu",
    label: "Cấu hình nền tảng",
    group: "thiet-lap-platform",
    iconKey: "SlidersHorizontal",
    navKey: "platform-custom-fields",
    mobileLabel: "Cấu hình",
  },
] as const

export const MOTHER_GROUPS_CONFIG = [
  { key: "tong-quan", label: "TỔNG QUAN" },
  { key: "to-chuc-dich-vu", label: "TỔ CHỨC & DỊCH VỤ" },
  { key: "san-pham-kho-platform", label: "SẢN PHẨM & KHO" },
  { key: "ha-tang-tai-nguyen", label: "HẠ TẦNG & TÀI NGUYÊN" },
  { key: "do-tin-cay-bao-mat", label: "ĐỘ TIN CẬY & BẢO MẬT" },
  { key: "thiet-lap-platform", label: "THIẾT LẬP" },
] as const


export function buildMotherNav(can: (code: string) => boolean): NavView {
  const groups: NavGroup[] = []

  for (const config of MOTHER_GROUPS_CONFIG) {
    const entries = MOTHER_NAV_ENTRIES.filter(
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
