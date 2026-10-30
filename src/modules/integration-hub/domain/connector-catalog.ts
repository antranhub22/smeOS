/**
 * Danh mục đầu nối SSOT — ma trận vai theo tầng lấy từ đề xuất mục 5
 * (docs/archive/drafts/DE_XUAT_KIEN_TRUC_TRUNG_TAM_TICH_HOP.md).
 */

import type { ConnectorManifest, TierRole } from "./connector-manifest"

type Roles = Readonly<{ MOTHER: TierRole; INDUSTRY: TierRole; CHAIN: TierRole; STORE: TierRole }>

const OWN_ACCOUNT: Roles = { MOTHER: "PROVIDE", INDUSTRY: "ENABLE", CHAIN: "CONNECT", STORE: "CONNECT" }
const CHAIN_SHARED: Roles = { MOTHER: "PROVIDE", INDUSTRY: "ENABLE", CHAIN: "CONNECT", STORE: "INHERIT" }
const PAYMENT: Roles = { MOTHER: "NONE", INDUSTRY: "ENABLE", CHAIN: "CONNECT", STORE: "CONNECT" }

const SALES_CHANNEL = (key: string, label: string, description: string): ConnectorManifest => ({
  key,
  category: "SALES_CHANNEL",
  label,
  description,
  capabilities: ["CATALOG_PUSH", "ORDER_PULL", "INVENTORY_PUSH", "WEBHOOK_IN"],
  auth: "OAUTH2",
  tiers: OWN_ACCOUNT,
  planFeature: "integrations.sales_channels",
  multiAccount: true,
  status: "COMING_SOON",
})

export const CONNECTOR_CATALOG: readonly ConnectorManifest[] = [
  SALES_CHANNEL("shopee", "Shopee", "Đăng sản phẩm, nhận đơn và đồng bộ tồn kho với gian hàng Shopee."),
  SALES_CHANNEL("tiktok_shop", "TikTok Shop", "Đăng sản phẩm, nhận đơn và đồng bộ tồn kho với TikTok Shop."),
  SALES_CHANNEL("lazada", "Lazada", "Đăng sản phẩm, nhận đơn và đồng bộ tồn kho với Lazada."),
  {
    ...SALES_CHANNEL("meta_catalog", "Danh mục Facebook & Instagram", "Đưa sản phẩm lên danh mục để chạy quảng cáo và gắn thẻ sản phẩm."),
    capabilities: ["CATALOG_PUSH"],
    tiers: CHAIN_SHARED,
  },
  {
    ...SALES_CHANNEL("google_merchant", "Google Merchant", "Hiện sản phẩm trên Google Mua sắm."),
    capabilities: ["CATALOG_PUSH"],
    tiers: CHAIN_SHARED,
  },
  SALES_CHANNEL("haravan", "Haravan", "Đồng bộ sản phẩm, đơn hàng và tồn kho với website Haravan."),
  SALES_CHANNEL("sapo", "Sapo", "Đồng bộ sản phẩm, đơn hàng và tồn kho với Sapo."),
  SALES_CHANNEL("kiotviet", "KiotViet", "Đồng bộ sản phẩm, đơn hàng và tồn kho với phần mềm bán hàng KiotViet."),
  {
    key: "facebook_messenger",
    category: "MESSAGING",
    label: "Facebook Messenger",
    description: "Nhận tin nhắn từ Trang Facebook và để trợ lý trả lời khách.",
    capabilities: ["MESSAGE_IN", "MESSAGE_OUT", "WEBHOOK_IN"],
    auth: "OAUTH2",
    tiers: OWN_ACCOUNT,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/hoi-thoai/kenh-tich-hop",
  },
  {
    key: "zalo_oa",
    category: "MESSAGING",
    label: "Zalo OA",
    description: "Nhận và trả lời tin nhắn khách qua Zalo Official Account.",
    capabilities: ["MESSAGE_IN", "MESSAGE_OUT", "WEBHOOK_IN"],
    auth: "OAUTH2",
    tiers: OWN_ACCOUNT,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/hoi-thoai/kenh-tich-hop",
  },
  {
    key: "sepay",
    category: "PAYMENT",
    label: "SePay",
    description: "Tự đối khớp chuyển khoản ngân hàng với đơn hàng.",
    capabilities: ["PAYMENT_IN", "WEBHOOK_IN"],
    auth: "WEBHOOK_KEY",
    tiers: PAYMENT,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/cai-dat",
  },
  {
    key: "zalo_zns",
    category: "NOTIFICATION",
    label: "Zalo ZNS",
    description: "Gửi tin báo trạng thái đơn cho khách qua Zalo.",
    capabilities: ["NOTIFY_OUT"],
    auth: "OAUTH2",
    tiers: CHAIN_SHARED,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/cai-dat",
  },
  {
    key: "telegram",
    category: "NOTIFICATION",
    label: "Telegram",
    description: "Báo đơn mới và việc cần làm vào nhóm Telegram của cửa hàng.",
    capabilities: ["NOTIFY_OUT"],
    auth: "BOT_TOKEN",
    tiers: OWN_ACCOUNT,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/cai-dat/thong-bao",
  },
  {
    key: "esms",
    category: "NOTIFICATION",
    label: "SMS thương hiệu (eSMS)",
    description: "Gửi tin nhắn SMS mang tên thương hiệu cho khách.",
    capabilities: ["NOTIFY_OUT"],
    auth: "API_KEY",
    tiers: CHAIN_SHARED,
    planFeature: null,
    multiAccount: false,
    status: "LEGACY",
    legacyHref: "/cai-dat",
  },
  {
    key: "chain_link",
    category: "CHAIN_STORE",
    label: "Liên kết chuỗi và cửa hàng",
    description: "Mời cửa hàng vào chuỗi, nhận đơn gia công và mở công cụ cho chi nhánh.",
    capabilities: [],
    auth: "INTERNAL",
    tiers: { MOTHER: "NONE", INDUSTRY: "NONE", CHAIN: "CONNECT", STORE: "CONNECT" },
    planFeature: null,
    multiAccount: true,
    status: "LEGACY",
    legacyHref: "/noi-bo/ket-noi",
  },
  {
    key: "api_tokens",
    category: "API_WEBHOOK",
    label: "API cho phần mềm khác",
    description: "Cấp khoá để phần mềm của bạn đọc sản phẩm, đơn hàng và số liệu.",
    capabilities: [],
    auth: "INTERNAL",
    tiers: { MOTHER: "PROVIDE", INDUSTRY: "NONE", CHAIN: "CONNECT", STORE: "CONNECT" },
    planFeature: "integrations.api",
    multiAccount: true,
    status: "LEGACY",
    legacyHref: "/noi-bo/ket-noi",
  },
  {
    key: "test_echo",
    category: "API_WEBHOOK",
    label: "Kết nối thử",
    description: "Kết nối mẫu để thử luồng nhận sự kiện (chỉ có ở môi trường thử).",
    capabilities: ["WEBHOOK_IN"],
    auth: "WEBHOOK_KEY",
    tiers: OWN_ACCOUNT,
    planFeature: null,
    multiAccount: true,
    status: "BETA",
    devOnly: true,
  },
]

export function findManifest(key: string): ConnectorManifest | null {
  return CONNECTOR_CATALOG.find((m) => m.key === key) ?? null
}
