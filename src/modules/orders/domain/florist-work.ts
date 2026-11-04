/**
 * Việc chế tác của thợ (checklist ALG 4.13) — luật thuần: thợ chỉ nhận việc và báo xong; công thức
 * đọc từ `order_items.metadata` (đơn Điều phối ghi `flowers` + `sampleImageUrl`). Không có giá.
 */

import type { ProductionStatus } from "./order-types"

export type FloristAction = "START" | "FINISH"

export const FLORIST_ACTIONS: readonly FloristAction[] = ["START", "FINISH"]

const FROM: Record<FloristAction, readonly ProductionStatus[]> = {
  START: ["ASSIGNED"],
  FINISH: ["ARRANGING", "QUALITY_CHECK"],
}
const TO: Record<FloristAction, ProductionStatus> = { START: "ARRANGING", FINISH: "READY" }

/** Trạng thái chế tác sau thao tác, hoặc `null` khi thao tác không hợp ở trạng thái hiện tại. */
export function floristNextStatus(current: ProductionStatus, action: FloristAction): ProductionStatus | null {
  return FROM[action].includes(current) ? TO[action] : null
}

export interface RecipeLine {
  flowerName: string
  quantity: number
  unit: string | null
  color: string | null
  role: string | null
}

export interface FloristItem {
  description: string | null
  quantity: number
  recipe: RecipeLine[]
  sampleImageUrl: string | null
}

const text = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null)

/** Rút công thức và ảnh mẫu từ metadata dòng hàng; bỏ mọi trường khác (giá vốn, ghi chú nội bộ). */
export function toFloristItem(item: { description: string | null; quantity: number; metadata: unknown }): FloristItem {
  const meta = item.metadata && typeof item.metadata === "object" ? (item.metadata as Record<string, unknown>) : {}
  const flowers = Array.isArray(meta.flowers) ? meta.flowers : []
  const recipe: RecipeLine[] = []
  for (const raw of flowers) {
    if (!raw || typeof raw !== "object") continue
    const f = raw as Record<string, unknown>
    const flowerName = text(f.flowerName)
    if (!flowerName) continue
    recipe.push({
      flowerName,
      quantity: typeof f.quantity === "number" ? f.quantity : 0,
      unit: text(f.unit),
      color: text(f.color),
      role: text(f.role),
    })
  }
  return { description: item.description, quantity: item.quantity, recipe, sampleImageUrl: text(meta.sampleImageUrl) }
}
