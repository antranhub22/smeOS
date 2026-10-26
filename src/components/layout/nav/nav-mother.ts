/**
 * Sidebar Tầng 1: SaaS Mother (Platform Console /van-hanh)
 * Quản trị toàn bộ 3 tầng dưới, hạ tầng đám mây, đa tenant và tài nguyên AI.
 */

import type { NavEntry, NavGroup, NavView } from "./nav-types"

export const MOTHER_NAV_ENTRIES: readonly NavEntry[] = [
  // 1. Tổ chức & Khách hàng
  {
    href: "/van-hanh",
    label: "Tổng quan nền tảng",
    group: "to-chuc",
    iconKey: "LayoutDashboard",
    navKey: "platform-overview",
    mobileLabel: "Tổng quan",
  },
  {
    href: "/van-hanh/dang-ky",
    label: "Đăng ký mới",
    group: "to-chuc",
    iconKey: "UserPlus",
    navKey: "platform-registrations",
    mobileLabel: "Đăng ký",
  },
  {
    href: "/van-hanh/to-chuc",
    label: "Danh sách tổ chức",
    group: "to-chuc",
    iconKey: "Building2",
    navKey: "platform-organizations",
    mobileLabel: "Tổ chức",
  },
  {
    href: "/van-hanh/phe-duyet",
    label: "Phê duyệt yêu cầu",
    group: "to-chuc",
    iconKey: "CheckCircle2",
    navKey: "platform-approvals",
    mobileLabel: "Phê duyệt",
  },

  // 2. Cấu hình nền tảng
  {
    href: "/van-hanh/nganh",
    label: "Ma trận ngành",
    group: "cau-hinh",
    iconKey: "Layers",
    navKey: "platform-industry-matrix",
    mobileLabel: "Ngành",
  },
  {
    href: "/van-hanh/truong-du-lieu",
    label: "Trường dữ liệu",
    group: "cau-hinh",
    iconKey: "SlidersHorizontal",
    navKey: "platform-custom-fields",
    mobileLabel: "Trường",
  },
  {
    href: "/van-hanh/du-lieu",
    label: "Dữ liệu tổ chức",
    group: "cau-hinh",
    iconKey: "Database",
    navKey: "platform-org-data",
    mobileLabel: "Dữ liệu",
  },

  // 3. Vận hành & Giám sát
  {
    href: "/van-hanh/muc-dung",
    label: "Mức dùng & Chi phí",
    group: "giam-sat",
    iconKey: "WalletCards",
    navKey: "platform-usage",
    mobileLabel: "Mức dùng",
  },
  {
    href: "/van-hanh/suc-khoe",
    label: "Sức khoẻ hệ thống",
    group: "giam-sat",
    iconKey: "Activity",
    navKey: "platform-health",
    mobileLabel: "Sức khoẻ",
  },
  {
    href: "/van-hanh/nhat-ky",
    label: "Nhật ký hệ thống",
    group: "giam-sat",
    iconKey: "ShieldCheck",
    navKey: "platform-audit",
    mobileLabel: "Nhật ký",
  },
] as const

const MOTHER_GROUPS_CONFIG = [
  { key: "to-chuc", label: "Tổ chức & Khách hàng" },
  { key: "cau-hinh", label: "Cấu hình nền tảng" },
  { key: "giam-sat", label: "Vận hành & Giám sát" },
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
