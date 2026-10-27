/**
 * Sidebar Tầng 3: ChainOS (Không gian điều hành chuỗi)
 * Tư duy: Điều hành chuỗi — Công cụ — Quản lý mạng lưới — Quản trị kết quả.
 */

import type { RoleUxDefinition } from "@/modules/organization/domain/role-ux-catalog"
import type { NavEntry, NavGroup, NavView } from "./nav-types"

export const CHAIN_NAV_ENTRIES: readonly NavEntry[] = [
  // 01 · ĐIỀU HÀNH
  {
    href: "/",
    label: "Tổng quan chuỗi",
    group: "dieu-hanh-chuoi",
    iconKey: "LayoutDashboard",
    navKey: "chain-command",
    mobileLabel: "Chỉ huy",
  },
  {
    href: "/don-hang",
    label: "Đơn hàng chuỗi",
    group: "dieu-hanh-chuoi",
    iconKey: "ShoppingBag",
    navKey: "chain-orders",
    capability: "R1",
    mobileLabel: "Đơn hàng",
  },
  {
    href: "/dieu-phoi",
    label: "Tháp điều phối",
    group: "dieu-hanh-chuoi",
    iconKey: "Radio",
    navKey: "chain-coordinator",
    capability: "C23",
    mobileLabel: "Điều phối",
  },
  {
    href: "/duyet",
    label: "Duyệt chất lượng",
    group: "dieu-hanh-chuoi",
    iconKey: "CheckCircle2",
    navKey: "chain-qc",
    capability: "H3",
    mobileLabel: "Duyệt QC",
  },

  // 02 · CÔNG CỤ
  {
    href: "/cong-cu",
    label: "Thư viện 51 công cụ (9 nhóm)",
    group: "cong-cu-chuoi",
    iconKey: "LayoutGrid",
    navKey: "chain-toolkit",
    mobileLabel: "Công cụ",
  },
  {
    href: "/creative-studio",
    label: "Chế tác tự động A-Z",
    group: "cong-cu-chuoi",
    iconKey: "Sparkles",
    navKey: "chain-auto-campaign",
    capability: "I1",
    mobileLabel: "Tự động A-Z",
  },
  {
    href: "/catalog",
    label: "Catalog & Kênh bán",
    group: "cong-cu-chuoi",
    iconKey: "Globe",
    navKey: "chain-catalog",
    capability: "J1",
    mobileLabel: "Catalog",
  },
  {
    href: "/the-chao",
    label: "Thẻ chào sản phẩm",
    group: "cong-cu-chuoi",
    iconKey: "CreditCard",
    navKey: "chain-greeting-card",
    capability: "R1",
    mobileLabel: "Thẻ chào",
  },
  {
    href: "/market-intelligence",
    label: "Xu hướng & Cơ hội thị trường",
    group: "cong-cu-chuoi",
    iconKey: "TrendingUp",
    navKey: "chain-market",
    capability: "I1",
    mobileLabel: "Xu hướng",
  },
  {
    href: "/video",
    label: "Công cụ ảnh & Video",
    group: "cong-cu-chuoi",
    iconKey: "Video",
    navKey: "chain-video",
    capability: "I1",
    mobileLabel: "Video",
  },
  {
    href: "/kho-templates",
    label: "Kho mẫu & Ấn phẩm",
    group: "cong-cu-chuoi",
    iconKey: "LayoutTemplate",
    navKey: "chain-templates",
    mobileLabel: "Kho mẫu",
  },
  {
    href: "/san-pham",
    label: "Quản lý bộ sưu tập & Giá",
    group: "san-pham-kho-chuoi",
    iconKey: "Tag",
    navKey: "chain-collections",
    capability: "L1",
    mobileLabel: "Sưu tập",
  },

  // 03 · KINH DOANH & KHÁCH HÀNG
  {
    href: "/khach-hang",
    label: "Khách hàng & CSKH",
    group: "kinh-doanh-chuoi",
    iconKey: "Users",
    navKey: "chain-customers",
    capability: "Q1",
    mobileLabel: "Khách hàng",
  },
  {
    href: "/hoi-thoai",
    label: "Hội thoại",
    group: "kinh-doanh-chuoi",
    iconKey: "Bot",
    navKey: "chain-chat",
    capability: "T1",
    mobileLabel: "Hội thoại",
  },
  {
    href: "/dieu-phoi/doi-tac",
    label: "Chi nhánh & Xưởng",
    group: "kinh-doanh-chuoi",
    iconKey: "Store",
    navKey: "chain-branches",
    mobileLabel: "Chi nhánh",
  },
  {
    href: "/san-pham/kha-dung",
    label: "Khả dụng & Năng lực",
    group: "san-pham-kho-chuoi",
    iconKey: "CalendarCheck",
    navKey: "chain-availability",
    capability: "L1",
    mobileLabel: "Khả dụng",
  },

  // SẢN PHẨM & KHO CHUỘI (tiếp theo)
  {
    href: "/gia",
    label: "Chính sách giá & Chiết khấu chuỗi",
    group: "san-pham-kho-chuoi",
    iconKey: "WalletCards",
    navKey: "chain-pricing",
    capability: "L6",
    mobileLabel: "Giá chuỗi",
  },
  {
    href: "/kho-du-lieu",
    label: "Kho nguyên liệu chuỗi",
    group: "san-pham-kho-chuoi",
    iconKey: "Folder",
    navKey: "chain-storage",
    capability: "G1",
    mobileLabel: "Kho",
  },

  // 04 · BÁO CÁO & TÀI CHÍNH
  {
    href: "/so-lieu",
    label: "Báo cáo hiệu suất",
    group: "bao-cao-tai-chinh-chuoi",
    iconKey: "BarChart3",
    navKey: "chain-stats",
    capability: "U3",
    mobileLabel: "Hiệu suất",
  },
  {
    href: "/du-lieu",
    label: "Đối soát & Công nợ",
    group: "bao-cao-tai-chinh-chuoi",
    iconKey: "Database",
    navKey: "chain-clearing",
    mobileLabel: "Đối soát",
  },

  // 05 · THIẾT LẬP
  {
    href: "/cai-dat",
    label: "Chính sách & Cài đặt",
    group: "thiet-lap-chuoi",
    iconKey: "Settings2",
    navKey: "chain-settings",
    capability: "F1",
    mobileLabel: "Cài đặt",
  },
] as const

export const CHAIN_GROUPS_CONFIG = [
  { key: "dieu-hanh-chuoi", label: "01 · ĐIỀU HÀNH" },
  { key: "cong-cu-chuoi", label: "02 · CÔNG CỤ" },
  { key: "san-pham-kho-chuoi", label: "03 · SẢN PHẨM & KHO" },
  { key: "kinh-doanh-chuoi", label: "04 · KINH DOANH & KHÁCH" },
  { key: "bao-cao-tai-chinh-chuoi", label: "05 · BÁO CÁO & TÀI CHÍNH" },
  { key: "thiet-lap-chuoi", label: "06 · THIẾT LẬP" },
] as const

export function buildChainNav(
  can: (code: string) => boolean,
  role?: RoleUxDefinition | null
): NavView {
  const isAccessible = (item: NavEntry) => !item.capability || can(item.capability)

  const groups: NavGroup[] = []

  for (const config of CHAIN_GROUPS_CONFIG) {
    const groupEntries = CHAIN_NAV_ENTRIES.filter(
      (entry) =>
        entry.group === config.key &&
        isAccessible(entry)
    )
    if (groupEntries.length > 0) {
      groups.push({
        key: config.key,
        label: config.label,
        entries: [...groupEntries],
      })
    }
  }

  return { groups }
}
