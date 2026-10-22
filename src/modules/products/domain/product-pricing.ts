/**
 * Kiểu giá của sản phẩm (PO chốt 22/10/2026), lưu trong `products.attributes.pricing`:
 * - FIXED   — một giá; có thể kèm giá cao điểm.
 * - RANGE   — giá theo phiên bản: mỗi tổ hợp đặc điểm (tối đa 2 nhóm, ví dụ Kích cỡ × Màu)
 *             có giá riêng và giá cao điểm riêng. "Từ … đến …" luôn tự tính từ các phiên bản
 *             đang bán, khách thanh toán đúng giá phiên bản đã chọn.
 * - CONTACT — không niêm yết giá, khách liên hệ (gọi / Zalo / nhắn tin), không đặt online.
 * Ngày cao điểm = ngày lễ cửa hàng khai (`brochure_holidays`) + cuối tuần nếu sản phẩm bật.
 * `attributes.price` vẫn giữ GIÁ THẤP NHẤT để báo cáo, sắp xếp, AI dùng chung (PO đồng ý).
 * Pure TypeScript.
 */

export const PRICING_KEY = "pricing"
export const PRICE_MODES = ["FIXED", "RANGE", "CONTACT"] as const
export type PriceMode = (typeof PRICE_MODES)[number]

export const MAX_DIMENSIONS = 2
export const MAX_DIMENSION_VALUES = 12
export const MAX_PRICE_VND = 1_000_000_000
const LABEL_MAX = 40

export interface PriceDimension {
  /** Mã nhóm theo ngành (`SIZE`, `COLOR`…) hoặc `CUSTOM_n` */
  key: string
  label: string
  values: string[]
}

export interface PriceOptionRow {
  /** Giá trị theo thứ tự `dimensions`, ví dụ ["Nhỏ", "Đỏ"] */
  values: string[]
  priceVnd: number | null
  /** Giá ngày cao điểm; `null` = như giá thường */
  peakPriceVnd: number | null
  active: boolean
}

export interface ProductPricing {
  mode: PriceMode
  /** FIXED: giá duy nhất */
  priceVnd: number | null
  peakPriceVnd: number | null
  dimensions: PriceDimension[]
  rows: PriceOptionRow[]
  /** Thứ 7, Chủ nhật tính là cao điểm */
  weekendIsPeak: boolean
}

export interface PriceSummary {
  mode: PriceMode
  minVnd: number | null
  maxVnd: number | null
  /** Có giá cao điểm khác giá thường */
  hasPeak: boolean
  /** Khách đặt online được không */
  orderable: boolean
}

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

function money(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= MAX_PRICE_VND ? Math.round(v) : null
}

function label(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, LABEL_MAX) : ""
}

/** Mã ổn định của một phiên bản — dùng làm `variantId` khi khách đặt. */
export function optionId(values: readonly string[]): string {
  return `opt:${values.map((v) => encodeURIComponent(v.toLowerCase())).join("|")}`
}

/** Phiên bản khai theo kiểu "Khoảng giá" (không phải size cũ) — khách bắt buộc chọn. */
export function isOptionId(id: string): boolean {
  return id.startsWith("opt:")
}

export function optionName(values: readonly string[]): string {
  return values.join(" / ")
}

function parseDimensions(raw: unknown): PriceDimension[] {
  if (!Array.isArray(raw)) return []
  const out: PriceDimension[] = []
  for (const d of raw) {
    const r = rec(d)
    const name = label(r.label)
    const seen = new Set<string>()
    const values: string[] = []
    for (const v of Array.isArray(r.values) ? r.values : []) {
      const s = label(v)
      if (s && !seen.has(s.toLowerCase())) {
        seen.add(s.toLowerCase())
        values.push(s)
      }
    }
    if (!name || values.length === 0) continue
    out.push({ key: label(r.key) || `CUSTOM_${out.length + 1}`, label: name, values: values.slice(0, MAX_DIMENSION_VALUES) })
    if (out.length >= MAX_DIMENSIONS) break
  }
  return out
}

/** Mọi tổ hợp giá trị của các nhóm (tích Descartes), theo thứ tự khai báo. */
export function combinations(dimensions: readonly PriceDimension[]): string[][] {
  return dimensions.reduce<string[][]>((acc, d) => acc.flatMap((prefix) => d.values.map((v) => [...prefix, v])), [[]])
}

/**
 * Đọc `attributes.pricing`. Sản phẩm cũ (chỉ có `attributes.price`) → FIXED với giá đó;
 * không có giá → FIXED chưa có giá (giữ hành vi cũ: nhận đơn, cửa hàng báo giá sau).
 */
export function parsePricing(attributes: unknown): ProductPricing {
  const attrs = rec(attributes)
  const p = rec(attrs[PRICING_KEY])
  const mode: PriceMode = PRICE_MODES.includes(p.mode as PriceMode) ? (p.mode as PriceMode) : "FIXED"
  const legacyPrice = money(attrs.price) ?? money(attrs.price_vnd)
  const dimensions = mode === "RANGE" ? parseDimensions(p.dimensions) : []
  const saved = new Map<string, Record<string, unknown>>()
  for (const r of Array.isArray(p.rows) ? p.rows : []) {
    const values = Array.isArray(rec(r).values) ? (rec(r).values as unknown[]).map(label) : []
    saved.set(optionId(values), rec(r))
  }
  const rows: PriceOptionRow[] = combinations(dimensions)
    .filter((c) => c.length > 0)
    .map((values) => {
      const r = saved.get(optionId(values)) ?? {}
      return { values, priceVnd: money(r.price_vnd), peakPriceVnd: money(r.peak_price_vnd), active: r.active !== false }
    })
  return {
    mode,
    priceVnd: mode === "FIXED" ? money(p.price_vnd) ?? legacyPrice : null,
    peakPriceVnd: mode === "FIXED" ? money(p.peak_price_vnd) : null,
    dimensions,
    rows,
    weekendIsPeak: p.weekend_is_peak === true,
  }
}

/** Ghi lại dạng lưu trong `attributes` (snake_case), kèm `price` = giá thấp nhất. */
export function serializePricing(pricing: ProductPricing): { price: number | null; price_vnd: number | null; pricing: Record<string, unknown> } {
  const min = summarizePricing(pricing).minVnd
  return {
    price: min,
    price_vnd: min,
    pricing: {
      mode: pricing.mode,
      price_vnd: pricing.mode === "FIXED" ? pricing.priceVnd : null,
      peak_price_vnd: pricing.mode === "FIXED" ? pricing.peakPriceVnd : null,
      dimensions: pricing.mode === "RANGE" ? pricing.dimensions : [],
      rows:
        pricing.mode === "RANGE"
          ? pricing.rows.map((r) => ({ values: r.values, price_vnd: r.priceVnd, peak_price_vnd: r.peakPriceVnd, active: r.active }))
          : [],
      weekend_is_peak: pricing.weekendIsPeak,
    },
  }
}

/** Lỗi theo trường (tiếng Việt); rỗng = hợp lệ. */
export function validatePricing(pricing: ProductPricing): string[] {
  const errors: string[] = []
  if (pricing.mode === "FIXED" && pricing.peakPriceVnd !== null && pricing.priceVnd === null) {
    errors.push("Vui lòng nhập giá thường trước khi nhập giá cao điểm")
  }
  if (pricing.mode === "RANGE") {
    if (pricing.dimensions.length === 0) errors.push("Vui lòng thêm ít nhất một nhóm đặc điểm (ví dụ Kích cỡ)")
    const active = pricing.rows.filter((r) => r.active)
    if (pricing.dimensions.length > 0 && active.length === 0) errors.push("Cần ít nhất một phiên bản đang bán")
    for (const r of active) {
      if (r.priceVnd === null) errors.push(`Vui lòng nhập giá cho phiên bản ${optionName(r.values)}`)
    }
  }
  return errors
}

/** Khoảng giá hiển thị — chỉ tính phiên bản đang bán, cả giá thường lẫn giá cao điểm. */
export function summarizePricing(pricing: ProductPricing): PriceSummary {
  if (pricing.mode === "CONTACT") return { mode: "CONTACT", minVnd: null, maxVnd: null, hasPeak: false, orderable: false }
  const pairs: Array<[number, number | null]> =
    pricing.mode === "FIXED"
      ? pricing.priceVnd !== null ? [[pricing.priceVnd, pricing.peakPriceVnd]] : []
      : pricing.rows.filter((r) => r.active && r.priceVnd !== null).map((r) => [r.priceVnd as number, r.peakPriceVnd])
  const base = pairs.map(([b]) => b)
  const all = pairs.flatMap(([b, p]) => (p === null ? [b] : [b, p]))
  const hasPeak = pairs.some(([b, p]) => p !== null && p !== b)
  return {
    mode: pricing.mode,
    minVnd: base.length ? Math.min(...base) : null,
    maxVnd: all.length ? Math.max(...all) : null,
    hasPeak,
    orderable: pricing.mode === "FIXED" || base.length > 0,
  }
}

/** Phiên bản khách chọn được (đang bán, có giá) — cho trang đặt hàng. */
export function sellableOptions(pricing: ProductPricing): Array<{ id: string; name: string; priceVnd: number; peakPriceVnd: number | null }> {
  if (pricing.mode !== "RANGE") return []
  return pricing.rows
    .filter((r): r is PriceOptionRow & { priceVnd: number } => r.active && r.priceVnd !== null)
    .map((r) => ({ id: optionId(r.values), name: optionName(r.values), priceVnd: r.priceVnd, peakPriceVnd: r.peakPriceVnd }))
}

/** Thứ 7 / Chủ nhật của ngày `YYYY-MM-DD` (theo lịch, không phụ thuộc múi giờ máy chủ). */
export function isWeekend(date: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return false
  const day = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay()
  return day === 0 || day === 6
}

/** Đơn giá phải trả: giá cao điểm khi ngày giao là cao điểm và phiên bản có giá cao điểm. */
export function unitPriceFor(priceVnd: number, peakPriceVnd: number | null, isPeakDay: boolean): number {
  return isPeakDay && peakPriceVnd !== null ? peakPriceVnd : priceVnd
}

export function formatVnd(v: number): string {
  return `${v.toLocaleString("vi-VN")} ₫`
}

/** Nhãn giá ngắn cho thẻ sản phẩm. */
export function priceLabel(summary: PriceSummary): string {
  if (summary.mode === "CONTACT") return "Liên hệ"
  if (summary.minVnd === null) return "Chưa có giá"
  if (summary.maxVnd === null || summary.maxVnd === summary.minVnd) return formatVnd(summary.minVnd)
  return `${formatVnd(summary.minVnd)} – ${formatVnd(summary.maxVnd)}`
}

/** Đổi nhóm đặc điểm: dựng lại bảng phiên bản, giữ giá đã nhập của tổ hợp còn tồn tại. */
export function withDimensions(pricing: ProductPricing, dimensions: PriceDimension[]): ProductPricing {
  const old = new Map(pricing.rows.map((r) => [optionId(r.values), r]))
  const rows = combinations(dimensions.slice(0, MAX_DIMENSIONS))
    .filter((c) => c.length > 0)
    .map((values) => ({ priceVnd: null, peakPriceVnd: null, active: true, ...old.get(optionId(values)), values }))
  return { ...pricing, dimensions: dimensions.slice(0, MAX_DIMENSIONS), rows }
}
