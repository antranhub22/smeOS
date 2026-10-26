/**
 * Sidebar Tầng 3: ChainOS (Chuỗi Thương hiệu Đơn ngành)
 * Vận hành chuỗi: Bán hàng thương hiệu Chuỗi tập trung + Điều hành và phân bổ đơn mạng lưới.
 */

import type { RoleUxDefinition } from "@/modules/organization/domain/role-ux-catalog"
import { isRouteLocked } from "@/lib/feature-lock"
import type { NavEntry, NavGroup, NavView } from "./nav-types"
import { HOME_ENTRY } from "./nav-types"

export const CHAIN_NAV_ENTRIES: readonly NavEntry[] = [
  // 1. Chỉ huy Chuỗi
  {
    href: "/",
    label: "Chỉ huy Mạng lưới",
    group: "chi-huy-chuoi",
    iconKey: "LayoutDashboard",
    navKey: "chain-command",
    mobileLabel: "Chỉ huy",
  },
  {
    href: "/so-lieu",
    label: "Báo cáo Hợp nhất",
    group: "chi-huy-chuoi",
    iconKey: "BarChart3",
    navKey: "chain-stats",
    capability: "U3",
    mobileLabel: "Số liệu",
  },

  // 2. Bán hàng Thương hiệu Chuỗi (HQ Central Sales)
  {
    href: "/don-hang",
    label: "Đơn hàng Trực tiếp",
    group: "ban-hang-chuoi",
    iconKey: "ShoppingBag",
    navKey: "chain-orders",
    capability: "R1",
    mobileLabel: "Đơn hàng",
  },
  {
    href: "/catalog",
    label: "Catalog Thương hiệu",
    group: "ban-hang-chuoi",
    iconKey: "Globe",
    navKey: "chain-catalog",
    capability: "J1",
    mobileLabel: "Catalog",
  },
  {
    href: "/khach-hang",
    label: "Khách hàng Thân thiết",
    group: "ban-hang-chuoi",
    iconKey: "Users",
    navKey: "chain-customers",
    capability: "Q1",
    mobileLabel: "Khách hàng",
  },
  {
    href: "/hoi-thoai",
    label: "Hộp thư CSKH",
    group: "ban-hang-chuoi",
    iconKey: "Bot",
    navKey: "chain-chat",
    capability: "T1",
    mobileLabel: "CSKH",
  },

  // 3. Điều phối Đơn & Gia công Chi nhánh
  {
    href: "/dieu-phoi",
    label: "Tháp Điều phối Đơn",
    group: "dieu-phoi-gia-cong",
    iconKey: "Radio",
    navKey: "chain-coordinator",
    capability: "C23",
    mobileLabel: "Điều phối",
  },
  {
    href: "/duyet",
    label: "Duyệt Chất lượng (QC)",
    group: "dieu-phoi-gia-cong",
    iconKey: "CheckCircle2",
    navKey: "chain-qc",
    capability: "H3",
    mobileLabel: "Duyệt QC",
  },
  {
    href: "/tin-nhan",
    label: "Chat Điều hành Nội bộ",
    group: "dieu-phoi-gia-cong",
    iconKey: "MessageSquare",
    navKey: "chain-internal-chat",
    mobileLabel: "Tin nhắn",
  },

  // 4. Mạng lưới Chi nhánh & Xưởng Ngoài
  {
    href: "/dieu-phoi/doi-tac",
    label: "Danh bạ Chi nhánh & Xưởng",
    group: "mang-luoi-chi-nhanh",
    iconKey: "Store",
    navKey: "chain-branches",
    mobileLabel: "Chi nhánh",
  },
  {
    href: "/san-pham/kha-dung",
    label: "Khả dụng & Tồn kho",
    group: "mang-luoi-chi-nhanh",
    iconKey: "CalendarCheck",
    navKey: "chain-availability",
    capability: "L1",
    mobileLabel: "Khả dụng",
  },
  {
    href: "/noi-bo/ket-noi",
    label: "Mã Kết nối & Định danh",
    group: "mang-luoi-chi-nhanh",
    iconKey: "BadgeCheck",
    navKey: "chain-identity",
    mobileLabel: "Kết nối",
  },

  // 5. Bộ sưu tập & Bảng giá Chuỗi
  {
    href: "/san-pham",
    label: "Bộ sưu tập Chuỗi",
    group: "bo-suu-tap-chuoi",
    iconKey: "Tag",
    navKey: "chain-collections",
    capability: "L1",
    mobileLabel: "Sản phẩm",
  },
  {
    href: "/gia",
    label: "Bảng giá & Chiết khấu",
    group: "bo-suu-tap-chuoi",
    iconKey: "WalletCards",
    navKey: "chain-pricing",
    capability: "L6",
    mobileLabel: "Tính giá",
  },
  {
    href: "/creative-studio",
    label: "Studio Chiến dịch AI",
    group: "bo-suu-tap-chuoi",
    iconKey: "Sparkles",
    navKey: "chain-studio",
    capability: "I1",
    mobileLabel: "Studio",
  },

  // 6. Đối soát & Tài chính Chuỗi
  {
    href: "/du-lieu",
    label: "Dữ liệu & Đối soát",
    group: "doi-soat-chuoi",
    iconKey: "Database",
    navKey: "chain-clearing",
    mobileLabel: "Đối soát",
  },
  {
    href: "/cai-dat",
    label: "Chính sách & Cài đặt",
    group: "doi-soat-chuoi",
    iconKey: "Settings2",
    navKey: "chain-settings",
    capability: "F1",
    mobileLabel: "Cài đặt",
  },
] as const

const CHAIN_GROUPS_CONFIG = [
  { key: "chi-huy-chuoi", label: "Trung tâm Chỉ huy" },
  { key: "ban-hang-chuoi", label: "Bán hàng Thương hiệu" },
  { key: "dieu-phoi-gia-cong", label: "Điều phối & Gia công" },
  { key: "mang-luoi-chi-nhanh", label: "Chi nhánh & Xưởng" },
  { key: "bo-suu-tap-chuoi", label: "Bộ sưu tập & Bảng giá" },
  { key: "doi-soat-chuoi", label: "Đối soát & Tài chính" },
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
