/**
 * STORE OPERATION EVENTS — StoreOS
 *
 * Chứa các sự kiện liên quan đến mạng lưới, sản phẩm, AI, CRM và tài chính.
 * Tách file để tuân thủ giới hạn 350 dòng/tệp (SRP).
 *
 * @module notification/domain/events
 */
import type { NotificationEventDefinition } from "./_contract"

export const STORE_OPERATION_EVENTS: NotificationEventDefinition[] = [
  // ── NETWORK ──────────────────────────────────────────────────────────
  {
    key: "SUBCONTRACT_ORDER_RECEIVED",
    label: "Đơn gia công mạng lưới",
    description: "Khi có đơn gia công từ mạng lưới/chuỗi gửi về",
    group: "NETWORK",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "Network",
    deepLinkTemplate: "/don-gia-cong/{orderId}",
    roleDefaults: [
      {
        roleKey: "store_admin",
        channels: ["APP_INBOX", "TELEGRAM", "PUSH"],
        priority: "URGENT",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "coordinator",
        channels: ["APP_INBOX", "TELEGRAM"],
        priority: "URGENT",
        dispatchMode: "BROADCAST",
      },
    ],
  },
  {
    key: "SUBCONTRACT_DEADLINE_APPROACHING",
    label: "Đơn gia công sắp hết hạn",
    description: "Khi đơn gia công còn ít hơn 2 giờ tới deadline",
    group: "NETWORK",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "AlertClock",
    deepLinkTemplate: "/don-gia-cong/{orderId}",
    roleDefaults: [
      {
        roleKey: "store_admin",
        channels: ["APP_INBOX", "TELEGRAM", "PUSH"],
        priority: "CRITICAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "florist",
        channels: ["APP_INBOX", "PUSH"],
        priority: "CRITICAL",
        dispatchMode: "OWNER",
      },
    ],
  },

  // ── PRODUCT ──────────────────────────────────────────────────────────
  {
    key: "PRODUCT_PROPOSED",
    label: "Mẫu sản phẩm mới chờ duyệt",
    description: "Khi nhân viên đề xuất mẫu sản phẩm mới cần phê duyệt",
    group: "PRODUCT",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "Package",
    deepLinkTemplate: "/san-pham/de-xuat/{productId}",
    roleDefaults: [
      {
        roleKey: "store_admin",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
    ],
  },
  {
    key: "PRODUCT_APPROVED",
    label: "Mẫu sản phẩm đã duyệt",
    description: "Khi mẫu sản phẩm đề xuất được phê duyệt",
    group: "PRODUCT",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "CheckCircle",
    deepLinkTemplate: "/san-pham/{productId}",
    roleDefaults: [
      {
        roleKey: "marketing",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "sales",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
    ],
  },

  // ── AI ───────────────────────────────────────────────────────────────
  {
    key: "AI_JOB_COMPLETED",
    label: "AI xử lý xong",
    description: "Khi một job AI (chỉnh ảnh, viết nội dung...) hoàn thành",
    group: "AI",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "Sparkles",
    deepLinkTemplate: "/creative-studio/{jobId}",
    roleDefaults: [
      {
        roleKey: "*",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "OWNER",
      },
    ],
  },
  {
    key: "AI_JOB_FAILED",
    label: "AI xử lý thất bại",
    description: "Khi một job AI thất bại sau các lần retry",
    group: "AI",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "AlertCircle",
    deepLinkTemplate: "/creative-studio/{jobId}",
    roleDefaults: [
      {
        roleKey: "*",
        channels: ["APP_INBOX", "PUSH"],
        priority: "URGENT",
        dispatchMode: "OWNER",
      },
    ],
  },

  // ── CRM ──────────────────────────────────────────────────────────────
  {
    key: "CUSTOMER_BIRTHDAY",
    label: "Sinh nhật khách hàng",
    description: "Khi đến ngày sinh nhật của khách hàng trong danh sách CRM",
    group: "CRM",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "Cake",
    deepLinkTemplate: "/crm/khach-hang/{customerId}",
    roleDefaults: [
      {
        roleKey: "crm",
        channels: ["APP_INBOX", "EMAIL"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "sales",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "OWNER",
      },
    ],
  },
  {
    key: "CUSTOMER_ANNIVERSARY",
    label: "Ngày kỷ niệm khách hàng",
    description: "Khi đến ngày kỷ niệm đặt biệt của khách (cưới, kỷ niệm...)",
    group: "CRM",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "Heart",
    deepLinkTemplate: "/crm/khach-hang/{customerId}",
    roleDefaults: [
      {
        roleKey: "crm",
        channels: ["APP_INBOX", "EMAIL"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "sales",
        channels: ["APP_INBOX"],
        priority: "NORMAL",
        dispatchMode: "OWNER",
      },
    ],
  },

  // ── FINANCE ──────────────────────────────────────────────────────────
  {
    key: "DAILY_REVENUE_SUMMARY",
    label: "Tổng kết doanh thu ngày",
    description: "Báo cáo tổng kết doanh thu cuối ngày",
    group: "FINANCE",
    tier: "STORE",
    version: 1,
    defaultVisibleToTiers: [],
    iconName: "BarChart3",
    deepLinkTemplate: "/bao-cao/doanh-thu",
    roleDefaults: [
      {
        roleKey: "store_admin",
        channels: ["APP_INBOX", "EMAIL"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "ceo",
        channels: ["APP_INBOX", "EMAIL"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
      {
        roleKey: "finance_accounting",
        channels: ["APP_INBOX", "EMAIL"],
        priority: "NORMAL",
        dispatchMode: "BROADCAST",
      },
    ],
  },
]
