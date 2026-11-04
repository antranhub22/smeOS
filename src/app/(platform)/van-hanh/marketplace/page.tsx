"use client"

// Chợ cửa hàng & đối tác (xem N1; đồng bộ và chia sẻ cần N17; xoá hồ sơ cần N18 — chỉ superadmin).
// Thông tin liên hệ đã che một phần.
import React from "react"
import { useSession } from "@/lib/session"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { MarketplaceBrowser } from "./marketplace-browser"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"
import { MarketplaceShareDialog } from "./marketplace-share-dialog"
import type { BulkDeleteRequest, BulkDeleteResult } from "./marketplace-bulk-delete-bar"

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

/** Số id mỗi lần gọi API — khớp trần máy chủ; danh sách lớn hơn gửi thành nhiều lượt. */
const BULK_CHUNK = 500

async function postBulkDelete(body: BulkDeleteRequest): Promise<BulkDeleteResult> {
  try {
    const res = await fetch("/api/v1/platform/marketplace/stores/bulk-delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => null)) as { data?: { deleted: number }; error?: { message?: string } } | null
    if (res.ok && json?.data) return json.data
    if (res.status === 403) return { error: "Chỉ superadmin nền tảng mới được xoá hồ sơ." }
    return { error: json?.error?.message ?? "Không xoá được. Vui lòng thử lại." }
  } catch {
    return { error: "Không kết nối được máy chủ." }
  }
}

/** Xoá hàng loạt; danh sách chọn dài chia lượt 500, dừng ở lượt lỗi đầu tiên. */
async function deleteStores(request: BulkDeleteRequest): Promise<BulkDeleteResult> {
  if (!("ids" in request)) return postBulkDelete(request)
  let deleted = 0
  for (let i = 0; i < request.ids.length; i += BULK_CHUNK) {
    const result = await postBulkDelete({ ids: request.ids.slice(i, i + BULK_CHUNK) })
    if ("error" in result) return deleted ? { error: `Đã xoá ${deleted} hồ sơ, phần còn lại lỗi: ${result.error}` } : result
    deleted += result.deleted
  }
  return { deleted }
}

export default function PlatformMarketplacePage() {
  const { can } = useSession()
  return (
    <MarketplaceBrowser
      {...(can("N18") ? { deleteStore, deleteStores } : {})}
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
