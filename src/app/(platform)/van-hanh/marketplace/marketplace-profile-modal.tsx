import React, { useEffect, useState } from "react"
import {
  X,
  Store,
  Award,
  User,
  Trash2,
} from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import Link from "next/link"
import { MarketplacePhotosTab } from "./marketplace-photos-tab"
import { MarketplaceOverviewTab } from "./marketplace-overview-tab"
import { MarketplaceCraftTab } from "./marketplace-craft-tab"
import { MarketplaceFacilityTab } from "./marketplace-facility-tab"
import { MarketplaceScoreTab } from "./marketplace-score-tab"

interface MarketplaceProfileModalProps {
  store: PartnerStoreMarketplaceEntity | null
  onClose: () => void
  /** Link chia sẻ công khai: ẩn nút dẫn vào console. */
  readOnly?: boolean
  /** Chỉ truyền khi người xem có quyền xoá (superadmin, `N18`). Trả câu lỗi hoặc null khi xoá xong. */
  onDelete?: (store: PartnerStoreMarketplaceEntity) => Promise<string | null>
}

export function MarketplaceProfileModal({ store, onClose, readOnly = false, onDelete }: MarketplaceProfileModalProps) {
  const [confirm, confirmDialog] = useConfirmDialog()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function requestDelete() {
    if (!store || !onDelete) return
    setConfirming(true)
    const yes = await confirm({
      title: `Xoá hồ sơ ${store.identity.shopName}?`,
      consequence: "Hồ sơ biến mất khỏi chợ đối tác và mọi link chia sẻ, không khôi phục được. Muốn có lại phải nhập lại từ tệp hoặc Sheet.",
      confirmLabel: "Xoá hồ sơ",
      tone: "danger",
    })
    setConfirming(false)
    if (!yes) return
    setDeleteError(await onDelete(store))
  }
  const [activeTab, setActiveTab] = useState<"overview" | "craft" | "facility" | "photos" | "score">("overview")

  useEffect(() => {
    // Đang mở hộp xác nhận xoá: Esc chỉ đóng hộp xác nhận
    if (!store || confirming) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [store, onClose, confirming])

  if (!store) return null

  const { identity, contact, digital, business, production, facilityAndDelivery, scoreAndTier, audit, media } = store

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Hồ sơ ${store.identity.shopName}`} onClick={(e) => e.stopPropagation()} className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border">
        {/* Modal Header Banner */}
        <div className="relative border-b border-border bg-primary-muted p-6 text-text">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hồ sơ"
            className="absolute right-4 top-4 rounded-full bg-surface p-2 text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border text-primary shadow-inner">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{identity.shopName}</h2>
                  <span className="rounded-full border border-warning-border bg-warning-bg px-2.5 py-0.5 text-xs font-bold text-warning-text">
                    {scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Chủ cửa hàng: <span className="font-semibold">{identity.ownerName}</span> • Liên hệ: {identity.contactPerson} ({identity.scale})
                </p>
              </div>
            </div>

            {/* Score pill */}
            {scoreAndTier.totalScore && (
              <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 border border-border">
                <Award className="h-5 w-5 text-warning" />
                <div>
                  <div className="text-caption uppercase font-bold text-text-muted">Tổng điểm</div>
                  <div className="text-lg font-black text-text leading-none">{scoreAndTier.totalScore}</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap border-b border-border text-xs font-semibold">
            {[
              { key: "overview", label: "Tổng quan & Pháp lý" },
              { key: "craft", label: "Dòng sản phẩm & Tay nghề" },
              { key: "facility", label: "Cơ sở vật chất & Giao vận" },
              { key: "photos", label: `Ảnh khảo sát (${store.media.driveImageIds.length})` },
              { key: "score", label: "Bảng điểm & Đề xuất Hợp tác" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as never)}
                className={`px-4 py-2.5 border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-text">
          {activeTab === "overview" && (
            <MarketplaceOverviewTab
              identity={identity}
              contact={contact}
              digital={digital}
              business={business}
              media={media}
            />
          )}

          {activeTab === "craft" && (
            <MarketplaceCraftTab production={production} />
          )}

          {activeTab === "facility" && (
            <MarketplaceFacilityTab facility={facilityAndDelivery} />
          )}

          {activeTab === "photos" && (
            <MarketplacePhotosTab media={media} shopName={identity.shopName} />
          )}

          {activeTab === "score" && (
            <MarketplaceScoreTab
              scoreAndTier={scoreAndTier}
              audit={audit}
              business={business}
            />
          )}
        </div>

        {/* Modal Footer Actions */}
        {deleteError && (
          <p role="alert" className="border-t border-danger-border bg-danger-bg px-4 py-2 text-sm text-danger-text">
            {deleteError}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-alt/40 p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng lại
            </Button>
            {!readOnly && onDelete && (
              <Button variant="danger" size="sm" className="gap-1.5" onClick={() => void requestDelete()}>
                <Trash2 className="h-4 w-4" /> Xoá hồ sơ
              </Button>
            )}
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2">
              <Link href={`/van-hanh/to-chuc` as never}>
                <Button size="sm" className="font-semibold gap-1.5">
                  <User className="h-4 w-4" /> Quản trị tổ chức (Giai đoạn 2)
                </Button>
              </Link>
            </div>
          )}
        </div>
        {/* Trong khung hồ sơ (đã chặn lan sự kiện) — bấm trong hộp xác nhận không đóng hồ sơ */}
        {confirmDialog}
      </div>
    </div>
  )
}
