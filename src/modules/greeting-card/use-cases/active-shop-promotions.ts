import { loadPolicyGovernance } from "@/modules/organization/use-cases/governance-matrix"
import { resolveAppliedPolicies, type PublicAppliedPolicies } from "../domain/store-policy"
import { getShopContactRepository } from "../infra/shop-contact-repository"

export type ActiveShopPromotion = PublicAppliedPolicies["promotions"][number]

/**
 * Ưu đãi đang bật trong Hồ sơ tiệm (đã áp khoá tầng trên). Công cụ tạo ấn phẩm (landing page, poster)
 * chỉ được in ưu đãi từ danh sách này — không tự đặt ưu đãi (PO 29/10/2026).
 */
export async function listActiveShopPromotions(
  organizationId: string,
  repo = getShopContactRepository(),
): Promise<ActiveShopPromotion[]> {
  const raw = await repo.findByOrganizationId(organizationId)
  if (!raw) return []
  return resolveAppliedPolicies(undefined, raw.settings, raw.industry, await loadPolicyGovernance(organizationId)).promotions
}

/** % giảm của ưu đãi "Giảm %" đầu tiên đang bật; không có → undefined (không in ưu đãi giảm giá). */
export function shopDiscountPercent(promotions: readonly ActiveShopPromotion[]): number | undefined {
  return promotions.find((p) => p.kind === "PERCENT_OFF" && p.percent !== null)?.percent ?? undefined
}
