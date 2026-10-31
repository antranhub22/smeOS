import type { PlatformContext } from "@/core/platform/platform-context"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import type {
  IPartnerMarketplaceRepository,
  ListMarketplaceStoresFilter,
  ListMarketplaceStoresResult,
} from "../domain/repositories/partner-marketplace-repository.interface"
import { getPartnerMarketplaceRepository } from "../infra/partner-marketplace-repository"

/**
 * `listMarketplaceStores`: Lấy danh sách các đối tác/cửa hàng cho Marketplace (SaaS Mother)
 * Phân quyền yêu cầu năng lực N1 (Xem/quản trị tổ chức nền tảng).
 * Áp dụng Dependency Inversion: repo được truyền vào qua tham số hàm với default factory.
 */
export async function listMarketplaceStores(
  pctx: PlatformContext,
  query?: ListMarketplaceStoresFilter,
  repo: IPartnerMarketplaceRepository = getPartnerMarketplaceRepository()
): Promise<ListMarketplaceStoresResult> {
  requirePlatformCapability(pctx, "N1")
  return repo.listStores(query)
}
