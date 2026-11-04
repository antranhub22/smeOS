import { unprocessable } from "@/core/http/errors"
import { hasCapability } from "@/core/rbac/capabilities"
import type { TenantContext } from "@/core/tenancy"
import { mergeEffectiveFloorCeilingRatio } from "@/modules/products/domain/pricing-rules"
import { getPricingRuleRepository } from "@/modules/products/infra/pricing-rule-repository"
import { computeProductCost } from "../domain/cost-calculator"
import { belowFloorMessage, floorPriceVnd } from "../domain/price-floor"
import { getCostingRepository } from "../infra/costing-repository"
import { loadCostingProfile } from "./costing-service"

export type FloorLine = { productId: string | null | undefined; quantity: number }

/** Mã năng lực "đặt giá dưới Sàn" — trần cứng Điều hành (`capability-catalog.ts`). */
export const BELOW_FLOOR_CAPABILITY = "C10"

/** Tổng giá sàn của các dòng hàng; 0 khi cửa hàng chưa đặt hệ số Sàn hoặc chưa tra được giá vốn. */
export async function floorTotalVnd(ctx: TenantContext, lines: readonly FloorLine[]): Promise<number> {
  const withProduct = lines.filter((l): l is { productId: string; quantity: number } => Boolean(l.productId) && l.quantity > 0)
  if (withProduct.length === 0) return 0
  const profile = await loadCostingProfile(ctx)
  if (!profile.config) return 0
  const ratio = mergeEffectiveFloorCeilingRatio(await getPricingRuleRepository().currentRows(ctx), ctx.branchId ?? null)
  if (!(ratio.floorRatio > 0)) return 0

  const repo = getCostingRepository()
  const materials = await repo.listMaterials(ctx, true)
  const floorByProduct = new Map<string, number>()
  for (const productId of new Set(withProduct.map((l) => l.productId))) {
    const [product, recipe] = await Promise.all([repo.productForCosting(ctx, productId), repo.findRecipe(ctx, productId)])
    if (!product || !recipe) continue
    const cost = computeProductCost(recipe, materials, profile.config, product.complexity)
    if (cost.complete) floorByProduct.set(productId, floorPriceVnd(cost.totalVnd, ratio.floorRatio))
  }
  return withProduct.reduce((sum, l) => sum + (floorByProduct.get(l.productId) ?? 0) * l.quantity, 0)
}

/**
 * Chặn lưu giá dưới sàn (checklist ALG 3.4): người không có C10 nhận 422 `BELOW_FLOOR` kèm giá sàn
 * để xin Điều hành duyệt; Điều hành (C10) lưu được — chính thao tác đó là phê duyệt.
 */
export async function assertNotBelowFloor(ctx: TenantContext, lines: readonly FloorLine[], totalVnd: number): Promise<void> {
  if (hasCapability(ctx, BELOW_FLOOR_CAPABILITY)) return
  const floorVnd = await floorTotalVnd(ctx, lines)
  const message = belowFloorMessage(totalVnd, floorVnd)
  if (message) throw unprocessable(message, { reason: "BELOW_FLOOR", floorVnd })
}
