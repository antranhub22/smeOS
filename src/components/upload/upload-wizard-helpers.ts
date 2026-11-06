/** Đọc kết quả phân tích ảnh và nhãn dòng nguyên liệu cho màn Tải ảnh — tách khỏi `upload-wizard.tsx` (K11). */
export type AnalysisRow = {
  id: string
  asset_id: string
  job_id: string
  raw: Record<string, unknown>
  edited: Record<string, unknown> | null
  approval_state: "PENDING" | "APPROVED" | "REJECTED"
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}
}
export function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : []
}
export function asText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}
export function asNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null
}
export function effectiveAnalysis(row: AnalysisRow): Record<string, unknown> {
  return row.edited ?? row.raw
}
export function bomOf(row: AnalysisRow): Record<string, unknown> {
  return asRecord(effectiveAnalysis(row).bom)
}

export const SECTION_LABELS: Record<string, string> = {
  flowers: "Hoa",
  foliage: "Lá",
  accessories: "Phụ kiện",
  wrapping: "Bao bì / Gói",
}

export function rowLabel(section: string, row: Record<string, unknown>): string {
  if (section === "wrapping") {
    const layer = asText(row.layer) ?? "Lớp gói"
    const material = asText(row.material)
    return material ? `${layer} · ${material}` : layer
  }
  return asText(row.name) ?? asText(row.nhom_hoa) ?? "Chưa xác định"
}
export function rowColor(row: Record<string, unknown>): string | null {
  return asText(row.mau) ?? asText(row.color)
}
export function rowQuantity(row: Record<string, unknown>): number | null {
  return asNumber(row.quantity)
}
export function rowConfidence(row: Record<string, unknown>): number | null {
  return asNumber(row.confidence)
}
// Nhãn thô gốc tiếng Anh của mô hình — luôn có với hoa/lá (bộ `local_cv`,
// 09/11), không có với các bộ máy khác hay các khoang khác. Hiển thị phụ,
// mờ, dưới tên chính — hữu ích nhất khi tên chính là "Chưa xác định được
// tên giống" (không khớp được danh mục), để người soát còn manh mối sửa
// tay thay vì chỉ thấy một dòng "chưa biết".
export function rowRawLabel(row: Record<string, unknown>): string | null {
  return asText(row.dau_hieu_nhan_dang)
}

export const COLOR_SWATCHES: Record<string, string> = {
  Đỏ: "#C0392B",
  Hồng: "#E48692",
  Trắng: "#F4F1EA",
  Vàng: "#E8B923",
  Cam: "#E07B39",
  Tím: "#8E6FB5",
  Xanh: "#5F9670",
  "Xanh lá": "#5F9670",
  "Xanh dương": "#3B6FA0",
  Nâu: "#B08D57",
  Kem: "#EDE3D0",
  Đen: "#2B2B2B",
}
export function colorSwatch(label: string): string {
  return COLOR_SWATCHES[label] ?? "#D9D2C7"
}
