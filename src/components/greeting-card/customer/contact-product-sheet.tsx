"use client"

import React from "react"
import { X } from "@/components/ui/icons"
import type { ShopContact } from "@/modules/greeting-card/domain/shop-contact"
import type { GreetingCatalogProduct } from "@/modules/greeting-card/domain/greeting-card-types"
import { ProductContactActions } from "./product-contact-actions"

interface Props {
  product: GreetingCatalogProduct
  shop: ShopContact
  inquiryUrl: string
  onClose: () => void
}

/** Khung liên hệ khi khách chọn mẫu "Liên hệ" ở link chào riêng (mẫu không đặt online). */
export function ContactProductSheet({ product, shop, inquiryUrl, onClose }: Props) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="contact-product-title" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 id="contact-product-title" className="text-title-sm font-extrabold text-foreground">{product.name}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1 text-text-muted hover:text-foreground">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mb-3 text-body-sm text-text-muted">
          Mẫu này cửa hàng tư vấn giá trực tiếp. Bạn gọi điện, nhắn Zalo hoặc để lại tin nhắn nhé.
        </p>
        <ProductContactActions shop={shop} inquiryUrl={inquiryUrl} product={product} />
      </div>
    </div>
  )
}
