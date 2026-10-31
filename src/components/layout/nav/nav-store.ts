/**
 * Sidebar Tầng 4: StoreOS (Không gian làm việc cửa hàng)
 * Tư duy: Việc hôm nay — Công cụ (Thư viện) — Bán hàng — Sản phẩm — Vận hành — Quản trị.
 */

import type { RoleUxDefinition } from "@/modules/organization/domain/role-ux-catalog"
import { isRouteLocked } from "@/lib/feature-lock"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { getHiddenNavKeys } from "../nav-matrix"
import type { NavEntry, NavGroup, NavView } from "./nav-types"
import { HOME_ENTRY } from "./nav-types"

export const STORE_NAV_ENTRIES: readonly NavEntry[] = [
  // 01 · CÔNG CỤ
  {
    href: "/cong-cu",
    label: "Công cụ",
    group: "cong-cu",
    iconKey: "LayoutGrid",
    navKey: "toolkit",
    mobileLabel: "Công cụ",
  },
  {
    href: "/creative-studio",
    label: "Chế tác tự động",
    group: "cong-cu",
    iconKey: "Sparkles",
    navKey: "creative-studio",
    capability: "I1",
    mobileLabel: "Tự động A-Z",
  },
  {
    href: "/the-chao",
    label: "Thẻ chào sản phẩm",
    group: "cong-cu",
    iconKey: "CreditCard",
    navKey: "greeting-card",
    capability: "R1",
    mobileLabel: "Thẻ chào",
  },
  {
    href: "/catalog",
    label: "Tạo catalog",
    group: "cong-cu",
    iconKey: "Globe",
    navKey: "catalog",
    capability: "J1",
    mobileLabel: "Catalog",
  },
  {
    href: "/tai-anh",
    label: "Phân tích ảnh bằng AI",
    group: "cong-cu",
    iconKey: "Camera",
    navKey: "scan-photo",
    capability: "H1",
    mobileLabel: "Quét ảnh",
  },
  {
    href: "/video",
    label: "Tạo video",
    group: "cong-cu",
    iconKey: "Video",
    navKey: "video",
    capability: "I1",
    mobileLabel: "Video",
  },
  {
    href: "/noi-dung",
    label: "Viết nội dung marketing",
    group: "cong-cu",
    iconKey: "FileText",
    navKey: "content",
    capability: "I1",
    mobileLabel: "Nội dung",
  },
  {
    href: "/market-intelligence",
    label: "Xu hướng thị trường",
    group: "cong-cu",
    iconKey: "TrendingUp",
    navKey: "market-intel",
    capability: "I1",
    mobileLabel: "Xu hướng",
  },
  {
    href: "/kho-templates",
    label: "Mẫu ấn phẩm",
    group: "cong-cu",
    iconKey: "LayoutTemplate",
    navKey: "templates",
    mobileLabel: "Kho mẫu",
  },
  {
    href: "/cong-cu/toi-uu-he-thong",
    label: "Trợ lý tối ưu",
    group: "cong-cu",
    iconKey: "Brain",
    navKey: "system-optimizer",
    capability: "L6",
    mobileLabel: "Tối ưu",
  },


  // 02 · BÁN HÀNG & KHÁCH HÀNG
  {
    href: "/don-hang",
    label: "Đơn hàng",
    group: "ban-hang",
    iconKey: "ShoppingBag",
    navKey: "orders",
    capability: "R1",
    mobileLabel: "Đơn hàng",
  },
  {
    href: "/khach-hang",
    label: "Khách hàng",
    group: "ban-hang",
    iconKey: "Users",
    navKey: "customers",
    capability: "Q1",
    mobileLabel: "Khách hàng",
  },
  {
    href: "/hoi-thoai",
    label: "Hội thoại",
    group: "ban-hang",
    iconKey: "Bot",
    navKey: "chat",
    capability: "T1",
    mobileLabel: "Hội thoại",
  },

  // 03 · SẢN PHẨM
  {
    href: "/san-pham",
    label: "Danh mục sản phẩm",
    group: "san-pham",
    iconKey: "Tag",
    navKey: "products",
    capability: "L1",
    mobileLabel: "Sản phẩm",
  },
  {
    href: "/san-pham/tao-moi",
    label: "Tạo sản phẩm mới",
    group: "san-pham",
    iconKey: "Sparkles",
    navKey: "create-product",
    capability: "L2",
    mobileLabel: "Tạo mới",
  },
  {
    href: "/san-pham/nhap-hang-loat",
    label: "Nhập từ Excel & Ảnh",
    group: "san-pham",
    iconKey: "FileSpreadsheet",
    navKey: "bulk-import",
    capability: "L2",
    mobileLabel: "Nhập Excel",
  },
  {
    href: "/san-pham/kha-dung",
    label: "Khả dụng & Lịch",
    group: "san-pham",
    iconKey: "CalendarCheck",
    navKey: "availability",
    capability: "L1",
    mobileLabel: "Khả dụng",
  },

  // 04 · KHO & NGUYÊN LIỆU
  {
    href: "/kho-du-lieu",
    label: "Kho & Nguyên liệu",
    group: "kho",
    iconKey: "Folder",
    navKey: "storage",
    capability: "G1",
    mobileLabel: "Kho",
  },
  {
    href: "/gia",
    label: "Tính giá",
    group: "kho",
    iconKey: "Calculator",
    navKey: "pricing",
    capability: "L6",
    mobileLabel: "Tính giá",
  },

  // 04 · VẬN HÀNH
  {
    href: "/cua-hang",
    label: "Đơn nhận từ mạng lưới",
    group: "van-hanh",
    iconKey: "Inbox",
    navKey: "branch-portal",
    mobileLabel: "Đơn chuỗi",
  },
  {
    href: "/dieu-phoi",
    label: "Sản xuất & Điều phối",
    group: "van-hanh",
    iconKey: "Radio",
    navKey: "coordinator",
    capability: "C23",
    mobileLabel: "Điều phối",
  },
  {
    href: "/job",
    label: "Giao hàng & Bàn giao",
    group: "van-hanh",
    iconKey: "Clock",
    navKey: "jobs",
    capability: "G4",
    mobileLabel: "Job",
  },
  {
    href: "/duyet",
    label: "Việc chờ duyệt (QC)",
    group: "van-hanh",
    iconKey: "CheckCircle2",
    navKey: "approval",
    capability: "H3",
    mobileLabel: "Duyệt QC",
  },
  {
    href: "/tin-nhan",
    label: "Trao đổi nội bộ",
    group: "van-hanh",
    iconKey: "MessageSquare",
    navKey: "internal-chat",
    mobileLabel: "Tin nhắn",
  },

  // 05 · QUẢN TRỊ CỬA HÀNG
  {
    href: "/so-lieu",
    label: "Báo cáo kinh doanh",
    group: "quan-tri",
    iconKey: "BarChart3",
    navKey: "stats",
    capability: "U3",
    mobileLabel: "Số liệu",
  },
  {
    href: "/muc-dung",
    label: "Sổ quỹ & Thu chi",
    group: "quan-tri",
    iconKey: "WalletCards",
    navKey: "usage",
    capability: "G8",
    mobileLabel: "Sổ quỹ",
  },
  {
    href: "/tri-thuc",
    label: "Tri thức & Quy trình",
    group: "quan-tri",
    iconKey: "BookOpen",
    navKey: "knowledge",
    mobileLabel: "Tri thức",
  },
  {
    href: "/cai-dat?tab=INFO",
    label: "Hồ sơ cửa hàng",
    group: "quan-tri",
    iconKey: "Building2",
    navKey: "business-profile",
    capability: "F1",
    mobileLabel: "Hồ sơ",
  },
  {
    href: "/cai-dat",
    label: "Cài đặt tiệm",
    group: "quan-tri",
    iconKey: "Settings2",
    navKey: "settings",
    capability: "F1",
    mobileLabel: "Cài đặt",
  },
  {
    href: "/cai-dat/thong-bao",
    label: "Ma trận thông báo",
    group: "quan-tri",
    iconKey: "Bell",
    navKey: "store-notifications",
    capability: "F1",
    mobileLabel: "Thông báo",
  },
  {
    href: "/cai-dat/ma-tran-uudai",
    label: "Ma trận ưu đãi",
    group: "quan-tri",
    iconKey: "Tag",
    navKey: "store-matrix-promotions",
    capability: "F1",
    mobileLabel: "Ưu đãi",
  },
  {
    href: "/cai-dat/ma-tran-camket",
    label: "Ma trận cam kết",
    group: "quan-tri",
    iconKey: "ShieldCheck",
    navKey: "store-matrix-commitments",
    capability: "F1",
    mobileLabel: "Cam kết",
  },
  {
    href: "/cai-dat/ma-tran-chinhsach",
    label: "Ma trận chính sách",
    group: "quan-tri",
    iconKey: "FileText",
    navKey: "store-matrix-policies",
    capability: "F1",
    mobileLabel: "Chính sách",
  },
  {
    href: "/cai-dat/ma-tran-thanhtoan-datco",
    label: "Ma trận thanh toán",
    group: "quan-tri",
    iconKey: "CreditCard",
    navKey: "store-matrix-payments",
    capability: "F1",
    mobileLabel: "Thanh toán",
  },
  {
    href: "/cai-dat/ma-tran-phigiacong",
    label: "Ma trận phí gia công",
    group: "quan-tri",
    iconKey: "Wrench",
    navKey: "store-matrix-craft-fees",
    capability: "F1",
    mobileLabel: "Phí thợ",
  },
] as const

export const NAV_GROUP_CONFIG = [
  { key: "cong-cu", label: "01 · CÔNG CỤ" },
  { key: "ban-hang", label: "02 · BÁN HÀNG & KHÁCH" },
  { key: "san-pham", label: "03 · SẢN PHẨM" },
  { key: "kho", label: "04 · KHO & NGUYÊN LIỆU" },
  { key: "van-hanh", label: "05 · VẬN HÀNH" },
  { key: "quan-tri", label: "06 · QUẢN TRỊ TIỆM" },
] as const

function adaptStoreEntries(industryKey?: string | null): readonly NavEntry[] {
  const hiddenKeys = getHiddenNavKeys(industryKey)
  const visible = hiddenKeys.size > 0
    ? STORE_NAV_ENTRIES.filter((e) => !hiddenKeys.has(e.navKey))
    : STORE_NAV_ENTRIES

  if (!industryKey || industryKey === "FLORAL") return visible
  const terms = getIndustryTerminology(industryKey)

  return visible.map((entry) => {
    if (entry.href === "/the-chao") {
      const shortTitle = terms.catalogTitle.length > 20
        ? terms.catalogTitle.replace(/ & .*/, "")
        : terms.catalogTitle
      return {
        ...entry,
        label: `Thẻ chào & ${shortTitle}`,
        mobileLabel: shortTitle.slice(0, 8),
      }
    }
    if (entry.href === "/san-pham/tao-moi") {
      return { ...entry, label: terms.createButtonLabel, mobileLabel: "Tạo mới" }
    }
    if (entry.href === "/tai-anh") {
      return { ...entry, label: terms.scanButtonLabel, mobileLabel: "Quét ảnh" }
    }
    if (entry.href === "/san-pham/kha-dung") {
      if (industryKey === "HOMESTAY") return { ...entry, label: "Lịch phòng & Khả dụng", mobileLabel: "Lịch phòng" }
      if (industryKey === "FNB") return { ...entry, label: "Lịch phục vụ", mobileLabel: "Lịch bàn" }
      if (industryKey === "SERVICES") return { ...entry, label: "Lịch ca & Đặt hẹn", mobileLabel: "Lịch hẹn" }
      return { ...entry, label: "Khả dụng & Tồn kho", mobileLabel: "Khả dụng" }
    }
    return entry
  })
}

export function buildStoreNav(
  can: (code: string) => boolean,
  role: RoleUxDefinition | null,
  industryKey?: string | null,
  navHiddenKeys?: string[] | null,
  unlockedToolKeys?: string[] | null
): NavView {
  const baseEntries = adaptStoreEntries(industryKey)
  const extraHidden = new Set<string>(navHiddenKeys ?? [])
  const hasWhitelist = Array.isArray(unlockedToolKeys) // [] = cấp trên khoá hết, chỉ null mới là mặc định
  const allowedWhitelist = new Set<string>(unlockedToolKeys ?? [])

  const entries = baseEntries.filter((e) => {
    // 1. Kiểm tra nếu bị ẩn theo ma trận ngành / cấp trên
    if (extraHidden.has(e.navKey)) return false
    // 2. Nếu có danh sách Whitelist từ cấp trên -> các công cụ thuộc nhóm cong-cu phải được duyệt
    // (riêng mục thư viện cố định 'toolkit' luôn mở)
    if (hasWhitelist && e.group === "cong-cu" && e.navKey !== "toolkit") {
      return allowedWhitelist.has(e.navKey)
    }
    return true
  })
  const isAccessible = (item: NavEntry) => !item.capability || can(item.capability)

  const pinnedHrefs = new Set<string>()
  const viecChinhEntries: NavEntry[] = []

  if (role && role.navPriority && role.navPriority.length > 0) {
    viecChinhEntries.push(HOME_ENTRY)
    pinnedHrefs.add(HOME_ENTRY.href)

    for (const href of role.navPriority) {
      if (pinnedHrefs.has(href)) continue
      const found = entries.find((entry) => entry.href === href)
      if (found && found.status !== "COMING_SOON" && !isRouteLocked(found.href) && isAccessible(found)) {
        viecChinhEntries.push(found)
        pinnedHrefs.add(found.href)
      }
    }
  }

  const groups: NavGroup[] = []

  if (viecChinhEntries.length > 0 && role) {
    groups.push({
      key: "viec-chinh",
      label: `Việc hôm nay · ${role.label}`,
      entries: viecChinhEntries,
    })
  } else if (role?.key === "store_admin") {
    groups.push({
      key: "viec-chinh",
      label: "Việc hôm nay",
      entries: [HOME_ENTRY],
    })
  }

  for (const config of NAV_GROUP_CONFIG) {
    const groupEntries = entries.filter(
      (entry) =>
        entry.group === config.key &&
        // Nhóm quản trị tiệm (cài đặt, hồ sơ, ma trận) luôn luôn hiển thị đầy đủ, không bị loại bởi pinnedHrefs
        (config.key === "quan-tri" || !pinnedHrefs.has(entry.href)) &&
        isAccessible(entry)
    )
    if (groupEntries.length > 0) {
      groups.push({
        key: config.key,
        label: config.label,
        entries: groupEntries,
      })
    }
  }

  return { groups }
}
