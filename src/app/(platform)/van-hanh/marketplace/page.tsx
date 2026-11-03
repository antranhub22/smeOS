"use client"

// Chợ cửa hàng & đối tác (xem N1; đồng bộ và chia sẻ cần N17; xoá hồ sơ cần N18 — chỉ superadmin).
// Thông tin liên hệ đã che một phần.
import React from "react"
import { useSession } from "@/lib/session"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { MarketplaceBrowser } from "./marketplace-browser"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"
import { MarketplaceShareDialog } from "./marketplace-share-dialog"

const errorFor = (status: number) => (status === 403 ? "Tài khoản chưa có quyền xem chợ đối tác." : null)

/** Gọi API xoá; trả câu lỗi dễ hiểu hoặc null khi xong. Máy chủ vẫn kiểm N18. */
async function deleteStore(store: PartnerStoreMarketplaceEntity): Promise<string | null> {
  try {
    const res = await fetch(`/api/v1/platform/marketplace/stores/${encodeURIComponent(store.id)}`, { method: "DELETE" })
    if (res.ok) return null
    if (res.status === 403) return "Chỉ superadmin nền tảng mới được xoá hồ sơ."
    if (res.status === 404) return "Hồ sơ không còn — có thể đã được xoá trước đó."
    return "Không xoá được hồ sơ. Vui lòng thử lại."
  } catch {
    return "Không kết nối được máy chủ."
  }
}

export default function PlatformMarketplacePage() {
  const { can } = useSession()
  return (
    <MarketplaceBrowser
      {...(can("N18") ? { deleteStore } : {})}
      endpoint="/api/v1/platform/marketplace/stores"
      title="Chợ cửa hàng & đối tác"
      errorFor={errorFor}
      emptyHint="Chưa có hồ sơ khảo sát. Nhập tệp Excel hoặc đồng bộ từ Sheet."
      actions={({ loading, refresh }) => (
        <div className="flex flex-wrap items-center gap-2">
          <MarketplaceShareDialog />
          <MarketplaceSyncActions loading={loading} onRefresh={refresh} />
        </div>
      )}
    />
  )
}
