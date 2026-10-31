import React, { useState } from "react"
import {
  Store,
  MapPin,
  Phone,
  User,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  Camera,
} from "@/components/ui/icons"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { getStoreCoverImage } from "@/modules/platform/domain/marketplace-image-resolver"

interface MarketplaceStoreCardProps {
  store: PartnerStoreMarketplaceEntity
  onQuickView: (store: PartnerStoreMarketplaceEntity) => void
}

export function MarketplaceStoreCard({ store, onQuickView }: MarketplaceStoreCardProps) {
  const { id, identity, contact, business, production, scoreAndTier, media } = store
  const [imageError, setImageError] = useState(false)

  // Phân hạng đối tác
  const tier = scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"
  const isCertified = tier.toLowerCase().includes("chứng nhận") || tier.toLowerCase().includes("kim cương")

  // Fallback banner color theo tên nếu không có ảnh
  const charCode = identity.shopName.charCodeAt(0) || 65
  const bgColors = [
    "from-emerald-600 to-teal-800",
    "from-blue-600 to-indigo-800",
    "from-rose-600 to-pink-800",
    "from-amber-600 to-orange-800",
    "from-purple-600 to-violet-800",
  ]
  const bannerGradient = bgColors[charCode % bgColors.length]

  // Ảnh mặt tiền cửa hàng thực tế (ưu tiên ảnh đã tải)
  const storePhotoUrl = getStoreCoverImage(id, identity.shopName, media.coverPhotoUrl)

  return (
    <Card
      variant="interactive"
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      {/* Top Banner / Store Photo Thumbnail */}
      <div className={`relative h-40 w-full overflow-hidden bg-gradient-to-r ${bannerGradient}`}>
        {!imageError ? (
          <>
            <img
              src={storePhotoUrl}
              alt={`Cửa hàng ${identity.shopName}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Store className="h-16 w-16 text-white" />
          </div>
        )}

        {/* Top Badges & Real Photo Tag */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md ${
              isCertified
                ? "bg-amber-400 text-amber-950 font-bold shadow-sm"
                : "bg-black/50 text-white border border-white/20"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            {tier}
          </span>

          <div className="flex items-center gap-1.5">
            {media.driveImageIds.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/20">
                <Camera className="h-3 w-3 text-emerald-300" />
                {media.driveImageIds.length} ảnh khảo sát
              </span>
            )}
            {scoreAndTier.totalScore && (
              <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md border border-white/20 text-white">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span className="font-bold text-amber-200">{scoreAndTier.totalScore}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shop Avatar / Badge */}
        <div className="absolute -bottom-5 left-4 z-20 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-surface bg-surface text-primary shadow-md">
          <Store className="h-7 w-7 text-primary" />
        </div>
      </div>

      {/* Body Information */}
      <div className="flex flex-1 flex-col p-4 pt-7">
        {/* Name & Owner */}
        <div className="mb-2">
          <h3 className="line-clamp-1 text-base font-bold text-text group-hover:text-primary transition-colors">
            {identity.shopName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {identity.ownerName || "Chưa cập nhật"}
            </span>
            {identity.operatingYears && (
              <span>• {identity.operatingYears}</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mb-3 flex items-start gap-1.5 text-xs text-text-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted/80" />
          <span className="line-clamp-2 leading-relaxed">{contact.address || "Chưa có địa chỉ"}</span>
        </div>

        {/* Highlight Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {production.mainProductLine && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary">
              <Package className="h-3 w-3" />
              {production.mainProductLine}
            </span>
          )}
          {business.monthlyRevenue && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-alt px-2 py-0.5 text-[11px] text-text-muted">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              {business.monthlyRevenue}
            </span>
          )}
          {production.floristCount && (
            <span className="rounded-md bg-surface-alt px-2 py-0.5 text-[11px] text-text-muted">
              {production.floristCount} thợ cắm
            </span>
          )}
        </div>

        {/* Contact Hotline & Phone */}
        <div className="mt-auto border-t border-border/60 pt-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1 font-mono font-medium text-text">
              <Phone className="h-3.5 w-3.5 text-primary" />
              {contact.phone || "---"}
            </span>
            <span className="text-[11px] text-text-muted">
              {identity.scale || "1 cửa hàng"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 border-t border-border/60 bg-surface-alt/40 p-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs font-semibold"
          onClick={() => onQuickView(store)}
        >
          Hồ sơ chi tiết
        </Button>
        <Button
          size="sm"
          className="px-2.5 text-xs"
          onClick={() => onQuickView(store)}
          title="Xem chi tiết marketplace"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
