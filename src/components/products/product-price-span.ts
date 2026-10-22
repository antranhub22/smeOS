import { parsePricing, summarizePricing } from "@/modules/products/domain/product-pricing"

/**
 * Khoảng giá thật của một sản phẩm cho bộ lọc/sắp xếp danh sách: Khoảng giá → [thấp nhất, cao nhất];
 * Liên hệ / chưa có giá → null (không khớp bộ lọc giá, xếp cuối).
 */
export function productPriceSpan(p: { price_vnd: number | null; attributes?: Record<string, unknown> | null | undefined }): { min: number; max: number } | null {
  if (p.attributes?.pricing) {
    const s = summarizePricing(parsePricing(p.attributes))
    if (s.mode === "CONTACT" || s.minVnd === null) return null
    return { min: s.minVnd, max: s.maxVnd ?? s.minVnd }
  }
  return p.price_vnd === null ? null : { min: p.price_vnd, max: p.price_vnd }
}

/** Khoảng giá sản phẩm giao với khoảng lọc [min, max] (null = không giới hạn đầu đó). */
export function spanOverlaps(span: { min: number; max: number } | null, min: number | null, max: number | null): boolean {
  if (span === null) return false
  if (min !== null && span.max < min) return false
  if (max !== null && span.min > max) return false
  return true
}
