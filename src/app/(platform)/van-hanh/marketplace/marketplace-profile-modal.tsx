import React, { useState } from "react"
import {
  X,
  Store,
  Award,
  User,
} from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
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
}

export function MarketplaceProfileModal({ store, onClose }: MarketplaceProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "craft" | "facility" | "photos" | "score">("overview")

  if (!store) return null

  const { identity, contact, digital, business, production, facilityAndDelivery, scoreAndTier, audit, media } = store

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border">
        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-white/80 hover:bg-black/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{identity.shopName}</h2>
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-950 shadow-sm">
                    {scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Chủ shop: <span className="font-semibold">{identity.ownerName}</span> • Liên hệ: {identity.contactPerson} ({identity.scale})
                </p>
              </div>
            </div>

            {/* Score pill */}
            {scoreAndTier.totalScore && (
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-md border border-white/20">
                <Award className="h-5 w-5 text-amber-300" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/70">Tổng điểm</div>
                  <div className="text-lg font-black text-amber-200 leading-none">{scoreAndTier.totalScore}</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap border-b border-white/20 text-xs font-semibold">
            {[
              { key: "overview", label: "Tổng quan & Pháp lý" },
              { key: "craft", label: "Dòng sản phẩm & Tay nghề" },
              { key: "facility", label: "Cơ sở vật chất & Giao vận" },
              { key: "photos", label: `Hình ảnh thực tế (${store.media.driveImageIds.length})` },
              { key: "score", label: "Bảng điểm & Đề xuất Hợp tác" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as never)}
                className={`px-4 py-2.5 border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-amber-300 text-amber-200 font-bold"
                    : "border-transparent text-white/70 hover:text-white"
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
        <div className="flex items-center justify-between border-t border-border bg-surface-alt/40 p-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng lại
          </Button>

          <div className="flex items-center gap-2">
            <Link href={`/van-hanh/to-chuc` as never}>
              <Button size="sm" className="font-semibold gap-1.5">
                <User className="h-4 w-4" /> Quản trị tổ chức (Giai đoạn 2)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
