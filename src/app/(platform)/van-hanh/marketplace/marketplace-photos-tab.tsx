import React from "react"
import { ExternalLink, Store } from "@/components/ui/icons"
import type { PartnerStoreMedia } from "@/modules/platform/domain/partner-marketplace.types"
import { MARKETPLACE_STORE_IMAGES } from "@/modules/platform/domain/marketplace-image-resolver"

interface MarketplacePhotosTabProps {
  media: PartnerStoreMedia
  shopName: string
}

export function MarketplacePhotosTab({ media, shopName }: MarketplacePhotosTabProps) {
  // Ưu tiên ảnh thực tế đã tải về từ Drive; nếu chưa có thì dùng bộ ảnh mẫu
  const displayPhotos =
    media.photoGalleryUrls && media.photoGalleryUrls.length > 0
      ? media.photoGalleryUrls
      : MARKETPLACE_STORE_IMAGES.slice(0, 6)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border p-4 bg-surface-alt/30">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
            Bộ Ảnh Khảo Sát Hiện Trường & Mặt Bằng Cửa Hàng
          </h4>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            {media.driveImageIds.length} ảnh gốc trên Drive
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Hạng mục khảo sát: {media.requiredPhotoTypes || "Mặt tiền, Biển hiệu, Không gian, Kho/khu bảo quản, Tủ mát"}
        </p>
      </div>

      {/* Grid of Storefront Photos */}
      <div>
        <h5 className="text-xs font-bold text-text mb-3 flex items-center gap-1.5">
          <Store className="h-4 w-4 text-primary" /> Ảnh chụp thực tế không gian & sản phẩm:
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayPhotos.map((imgUrl, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface-alt aspect-video shadow-sm"
            >
              <img
                src={imgUrl}
                alt={`Ảnh ${shopName} - ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                <span className="text-[11px] font-medium text-white">Ảnh khu vực {idx + 1}</span>
                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-amber-300 transition-colors p-1"
                  title="Mở xem ảnh lớn"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive links section */}
      {media.driveImageIds.length > 0 && (
        <div className="rounded-xl border border-border p-4 bg-surface text-xs space-y-2">
          <span className="font-semibold text-text block">Liên kết Google Drive hồ sơ khảo sát gốc:</span>
          <div className="flex flex-wrap gap-2">
            {media.driveImageIds.map((driveId, idx) => (
              <a
                key={idx}
                href={`https://drive.google.com/file/d/${driveId}/view`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-text hover:text-primary transition-colors bg-surface-alt/50"
              >
                <span>Ảnh Drive #{idx + 1}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
