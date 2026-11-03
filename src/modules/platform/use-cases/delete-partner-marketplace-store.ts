/**
 * Xoá hồ sơ cửa hàng khỏi chợ đối tác (PO 03/11/2026) — CHỈ superadmin nền tảng, mã `N18`
 * (tách khỏi `N17` để người đồng bộ/nhập dữ liệu không xoá được). Luôn ghi nhật ký nền tảng.
 *
 * Ảnh đã tải vào kho (`platform/partner-stores/<id>/…`) KHÔNG bị xoá ở đây: hàng đợi xoá
 * tệp (`storage_outbox`) chỉ nhận tệp thuộc một tổ chức, và quy tắc kho cấm gọi xoá tệp
 * trực tiếp. Số ảnh còn lại được ghi vào nhật ký; đối soát kho liệt kê chúng là tệp mồ côi.
 */
import { notFound } from "@/core/http/errors"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import type { PlatformContext } from "@/core/platform/platform-context"
import { recordPlatformAuditLog } from "../infra/platform-audit-repository"
import { getPartnerMarketplaceRepository } from "../infra/partner-marketplace-repository"
import type { IPartnerMarketplaceRepository } from "../domain/repositories/partner-marketplace-repository.interface"

export const MARKETPLACE_DELETE_CAPABILITY = "N18"

export type DeleteStoreDeps = {
  repo: Pick<IPartnerMarketplaceRepository, "deleteById">
  audit: typeof recordPlatformAuditLog
}

export async function deleteMarketplaceStore(
  pctx: PlatformContext,
  storeId: string,
  deps: DeleteStoreDeps = { repo: getPartnerMarketplaceRepository(), audit: recordPlatformAuditLog }
): Promise<{ id: string; shopName: string }> {
  requirePlatformCapability(pctx, MARKETPLACE_DELETE_CAPABILITY)
  const removed = await deps.repo.deleteById(storeId)
  if (!removed) throw notFound()
  await deps.audit(pctx, {
    action: "platform.marketplace.store_delete",
    entityType: "partner_marketplace_stores",
    entityId: storeId,
    before: { shopName: removed.shopName, source: removed.source, photoCount: removed.photoKeys.length },
    after: null,
  })
  return { id: storeId, shopName: removed.shopName }
}
