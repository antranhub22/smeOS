import React from "react"
import { ExternalLink, Store } from "@/components/ui/icons"
import type { PartnerStoreMedia } from "@/modules/platform/domain/partner-marketplace.types"

interface MarketplacePhotosTabProps {
  media: PartnerStoreMedia
  shopName: string
}

export function MarketplacePhotosTab({ media, shopName }: MarketplacePhotosTabProps) {
  // Chỉ ảnh khảo sát thật đã tải vào kho (URL ký có hạn) — không dùng ảnh mẫu
  const displayPhotos = media.photoGalleryUrls ?? []

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border p-4 bg-surface-alt/30">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
            Bộ Ảnh Khảo Sát Hiện Trường & Mặt Bằng Cửa Hàng
          </h4>
          <span className="text-caption font-semibold text-success-text bg-success-bg px-2 py-0.5 rounded-full">
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
        {displayPhotos.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-text-muted">
            {media.driveImageIds.length > 0
              ? "Ảnh khảo sát chưa được tải về. Bấm “Tải ảnh khảo sát” ở đầu trang để tải."
              : "Cửa hàng này chưa có ảnh khảo sát."}
          </p>
        )}
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
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-surface/90 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-caption font-medium text-text">Ảnh {idx + 1}</span>
                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-text hover:text-primary transition-colors"
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
