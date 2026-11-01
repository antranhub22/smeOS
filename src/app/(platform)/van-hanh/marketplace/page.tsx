"use client"

// Chợ cửa hàng & đối tác (xem N1; đồng bộ và chia sẻ cần N17). Thông tin liên hệ đã che một phần.
import React from "react"
import { MarketplaceBrowser } from "./marketplace-browser"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"
import { MarketplaceShareDialog } from "./marketplace-share-dialog"

const errorFor = (status: number) => (status === 403 ? "Tài khoản chưa có quyền xem chợ đối tác." : null)

export default function PlatformMarketplacePage() {
  return (
    <MarketplaceBrowser
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
