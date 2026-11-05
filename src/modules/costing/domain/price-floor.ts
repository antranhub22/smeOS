/**
 * Giá sàn của đơn (checklist ALG 3.4, 9.11): sàn của một mẫu = giá vốn × hệ số Sàn của cửa hàng
 * (`floor_ceiling_ratio.floorRatio`), làm tròn LÊN nghìn — giá sàn không bao giờ thấp hơn thật.
 * Sàn của đơn = tổng sàn từng dòng × số lượng. Chỉ tính các mẫu đã có công thức và đủ đơn giá; không
 * tra được giá vốn thì không chặn (không đoán số). Pure TypeScript.
 */

import { formatCurrency } from "@/lib/i18n/formatters"

export function floorPriceVnd(costVnd: number, floorRatio: number): number {
  if (!(costVnd > 0) || !(floorRatio > 0)) return 0
  return Math.ceil((costVnd * floorRatio) / 1000) * 1000
}

/** Thông điệp chặn khi tổng (tiền hàng, chưa gồm phí giao/VAT) thấp hơn sàn; `null` khi hợp lệ. */
export function belowFloorMessage(totalVnd: number, floorVnd: number): string | null {
  if (!(floorVnd > 0) || totalVnd >= floorVnd) return null
  return `Giá ${formatCurrency(totalVnd)} thấp hơn giá sàn ${formatCurrency(floorVnd)} — cần Điều hành duyệt`
}
