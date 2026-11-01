/**
 * KPI Definitions & First-Touch Attribution Engine (Marketing & Sales Center).
 *
 * SSOT: `03_KE_HOACH_TRIEN_KHAI.md` mục PR-7 (7.1).
 * Nguyên tắc:
 * 1. Quy thuộc first-touch qua link ngắn: một lead chỉ thuộc đúng một Usage (không tính trùng).
 * 2. Chỉ hiển thị chỉ số có dữ liệu; ẩn chỉ số chưa có dữ liệu.
 * 3. Mỗi module tối đa 3 chỉ số.
 * 4. Thuần túy domain logic, zero ORM.
 */

import type { BusinessModuleKey } from "./asset-type"
export type { BusinessModuleKey }

export type KpiTimeWindow = "7D" | "30D" | "90D" | "ALL"

export type KpiSource =
  | "asset_usages"
  | "short_links"
  | "leads"
  | "quotations"
  | "customer_interactions"
  | "print_renditions"
  | "brand_profiles"

export interface KpiDefinition {
  readonly key: string
  readonly module: BusinessModuleKey
  readonly label: string
  readonly description: string
  readonly unit: string
  readonly formula: string
  readonly source: KpiSource
}

export const KPI_REGISTRY: readonly KpiDefinition[] = [
  // 1. Thương hiệu (brand)
  {
    key: "brand_assets_count",
    module: "brand",
    label: "Tư liệu thương hiệu",
    description: "Số lượng tư liệu nhận diện chính thức đã lưu trữ",
    unit: "tư liệu",
    formula: "COUNT(asset_usages WHERE destination = 'LIBRARY' AND module = 'brand')",
    source: "asset_usages",
  },
  {
    key: "brand_profile_score",
    module: "brand",
    label: "Hồ sơ thương hiệu",
    description: "Độ hoàn thiện định vị, màu sắc và logo cửa hàng",
    unit: "%",
    formula: "PERCENTAGE(brand_profile_completed_fields)",
    source: "brand_profiles",
  },

  // 2. Nội dung (content)
  {
    key: "content_created_count",
    module: "content",
    label: "Tư liệu sản xuất",
    description: "Tổng số tư liệu ảnh, bài viết, video đã sản xuất",
    unit: "tư liệu",
    formula: "COUNT(library_items)",
    source: "asset_usages",
  },
  {
    key: "content_reuse_rate",
    module: "content",
    label: "Tỷ lệ tái sử dụng",
    description: "Tỷ lệ tư liệu được dùng trên từ 2 kênh trở lên",
    unit: "%",
    formula: "COUNT(DISTINCT source_id with >1 usages) / COUNT(DISTINCT source_id) * 100",
    source: "asset_usages",
  },

  // 3. Quảng bá (promotion)
  {
    key: "promo_total_clicks",
    module: "promotion",
    label: "Lượt truy cập",
    description: "Tổng số lượt quét mã QR và bấm liên kết quảng bá",
    unit: "lượt",
    formula: "SUM(short_links.scan_count)",
    source: "short_links",
  },
  {
    key: "promo_leads_count",
    module: "promotion",
    label: "Khách tiềm năng",
    description: "Số khách để lại thông tin được quy thuộc lần chạm đầu (first-touch)",
    unit: "khách",
    formula: "COUNT(DISTINCT first_touch_leads)",
    source: "leads",
  },
  {
    key: "promo_conversion_rate",
    module: "promotion",
    label: "Tỷ lệ chuyển đổi lead",
    description: "Tỷ lệ khách để lại thông tin trên tổng lượt truy cập",
    unit: "%",
    formula: "(leads / clicks) * 100",
    source: "leads",
  },

  // 4. Bán hàng (sales)
  {
    key: "sales_quotes_created",
    module: "sales",
    label: "Báo giá đã gửi",
    description: "Số lượng báo giá soạn và gửi tới khách hàng",
    unit: "báo giá",
    formula: "COUNT(quotations)",
    source: "quotations",
  },
  {
    key: "sales_quotes_accepted",
    module: "sales",
    label: "Báo giá được chốt",
    description: "Số báo giá khách đồng ý hoặc đã chuyển thành đơn hàng",
    unit: "đơn",
    formula: "COUNT(quotations WHERE status = 'ACCEPTED')",
    source: "quotations",
  },
  {
    key: "sales_quote_revenue",
    module: "sales",
    label: "Doanh số báo giá",
    description: "Tổng giá trị các báo giá đã được duyệt chốt",
    unit: "₫",
    formula: "SUM(quotations.total_amount WHERE status = 'ACCEPTED')",
    source: "quotations",
  },

  // 5. Chăm sóc (care)
  {
    key: "care_customers_touched",
    module: "care",
    label: "Khách được chăm sóc",
    description: "Số khách hàng đã nhận thiệp hoặc lời hỏi thăm",
    unit: "khách",
    formula: "COUNT(DISTINCT customer_interactions.customer_id)",
    source: "customer_interactions",
  },
  {
    key: "care_interactions_count",
    module: "care",
    label: "Lượt tương tác",
    description: "Tổng số lượt trao đổi qua Zalo, gọi điện và gửi thiệp",
    unit: "lượt",
    formula: "COUNT(customer_interactions)",
    source: "customer_interactions",
  },
  {
    key: "care_active_segments",
    module: "care",
    label: "Nhóm khách mục tiêu",
    description: "Số nhóm khách hàng chủ động đang được theo dõi",
    unit: "nhóm",
    formula: "COUNT(customer_segments)",
    source: "customer_interactions",
  },

  // 6. Ấn phẩm & In (print)
  {
    key: "print_renditions_count",
    module: "print",
    label: "Bản in đã xuất",
    description: "Số file PDF chuẩn in ấn 300 DPI đã xuất xưởng",
    unit: "bản",
    formula: "COUNT(print_renditions WHERE status = 'COMPLETED')",
    source: "print_renditions",
  },
]

export interface LeadAttributionInput {
  leadId: string
  shortLinkId: string | null
  createdAt: Date
}

export interface UsageAttributionInput {
  usageId: string
  shortLinkId: string | null
  createdAt: Date
  campaignId?: string | null | undefined
}

export interface LeadAttributionResult {
  leadId: string
  usageId: string | null
  shortLinkId: string | null
  campaignId: string | null
  attributedAt: Date
}

/**
 * Quy thuộc First-Touch qua Link ngắn (PO 01/11/2026, PR-7):
 * - Mỗi Lead chỉ thuộc DUY NHẤT một Usage (Usage có shortLinkId khớp được tạo sớm nhất).
 * - Tuyệt đối KHÔNG tính trùng lead cho nhiều Usage.
 * - Lead không có shortLinkId hoặc không khớp Usage nào sẽ có usageId = null.
 */
export function attributeLeadsFirstTouch(
  leads: readonly LeadAttributionInput[],
  usages: readonly UsageAttributionInput[]
): Map<string, LeadAttributionResult> {
  const result = new Map<string, LeadAttributionResult>()

  // Bản đồ tìm Usage sớm nhất cho từng shortLinkId
  // Sắp xếp Usages theo thời gian tạo tăng dần
  const sortedUsages = [...usages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  const firstUsageByShortLink = new Map<string, UsageAttributionInput>()
  for (const u of sortedUsages) {
    if (u.shortLinkId && !firstUsageByShortLink.has(u.shortLinkId)) {
      firstUsageByShortLink.set(u.shortLinkId, u)
    }
  }

  for (const lead of leads) {
    if (!lead.shortLinkId) {
      result.set(lead.leadId, {
        leadId: lead.leadId,
        usageId: null,
        shortLinkId: null,
        campaignId: null,
        attributedAt: lead.createdAt,
      })
      continue
    }

    const matchedUsage = firstUsageByShortLink.get(lead.shortLinkId)
    result.set(lead.leadId, {
      leadId: lead.leadId,
      usageId: matchedUsage ? matchedUsage.usageId : null,
      shortLinkId: lead.shortLinkId,
      campaignId: matchedUsage?.campaignId ?? null,
      attributedAt: lead.createdAt,
    })
  }

  return result
}

export interface RawKpiMetrics {
  brandAssetsCount?: number | undefined
  brandProfileScore?: number | undefined
  contentCreatedCount?: number | undefined
  contentReuseRate?: number | undefined
  promoTotalClicks?: number | undefined
  promoLeadsCount?: number | undefined
  promoConversionRate?: number | undefined
  salesQuotesCreated?: number | undefined
  salesQuotesAccepted?: number | undefined
  salesQuoteRevenue?: number | undefined
  careCustomersTouched?: number | undefined
  careInteractionsCount?: number | undefined
  careActiveSegments?: number | undefined
  printRenditionsCount?: number | undefined
}

export interface KpiValueItem {
  key: string
  module: BusinessModuleKey
  label: string
  description: string
  value: number
  unit: string
  formattedValue: string
}

export interface ModuleKpiStrip {
  module: BusinessModuleKey
  hasData: boolean
  items: KpiValueItem[]
}

function formatSimpleNumber(val: number): string {
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/**
 * Tổng hợp dải chỉ số KPI cho từng module:
 * - Chỉ trả về các chỉ số có dữ liệu (value > 0).
 * - Mỗi module tối đa 3 chỉ số.
 */
export function buildModuleKpis(metrics: RawKpiMetrics): Record<BusinessModuleKey, ModuleKpiStrip> {
  const allModules: BusinessModuleKey[] = ["brand", "content", "promotion", "sales", "care", "print"]
  const result: Record<BusinessModuleKey, ModuleKpiStrip> = {
    brand: { module: "brand", hasData: false, items: [] },
    content: { module: "content", hasData: false, items: [] },
    promotion: { module: "promotion", hasData: false, items: [] },
    sales: { module: "sales", hasData: false, items: [] },
    care: { module: "care", hasData: false, items: [] },
    print: { module: "print", hasData: false, items: [] },
  }

  const pushIfData = (key: string, value: number | undefined) => {
    if (value === undefined || value === null || value <= 0) return
    const def = KPI_REGISTRY.find((k) => k.key === key)
    if (!def) return

    const strip = result[def.module]!
    if (strip.items.length >= 3) return // Tối đa 3 số mỗi module

    let formattedValue = String(value)
    if (def.unit === "₫") {
      formattedValue = formatSimpleNumber(value) + " ₫"
    } else if (def.unit === "%") {
      formattedValue = `${value.toFixed(1)}%`
    } else {
      formattedValue = formatSimpleNumber(value)
    }

    strip.items.push({
      key: def.key,
      module: def.module,
      label: def.label,
      description: def.description,
      value,
      unit: def.unit,
      formattedValue,
    })
    strip.hasData = true
  }

  // 1. Brand
  pushIfData("brand_assets_count", metrics.brandAssetsCount)
  pushIfData("brand_profile_score", metrics.brandProfileScore)

  // 2. Content
  pushIfData("content_created_count", metrics.contentCreatedCount)
  pushIfData("content_reuse_rate", metrics.contentReuseRate)

  // 3. Promotion
  pushIfData("promo_total_clicks", metrics.promoTotalClicks)
  pushIfData("promo_leads_count", metrics.promoLeadsCount)
  pushIfData("promo_conversion_rate", metrics.promoConversionRate)

  // 4. Sales
  pushIfData("sales_quotes_created", metrics.salesQuotesCreated)
  pushIfData("sales_quotes_accepted", metrics.salesQuotesAccepted)
  pushIfData("sales_quote_revenue", metrics.salesQuoteRevenue)

  // 5. Care
  pushIfData("care_customers_touched", metrics.careCustomersTouched)
  pushIfData("care_interactions_count", metrics.careInteractionsCount)
  pushIfData("care_active_segments", metrics.careActiveSegments)

  // 6. Print
  pushIfData("print_renditions_count", metrics.printRenditionsCount)

  return result
}
