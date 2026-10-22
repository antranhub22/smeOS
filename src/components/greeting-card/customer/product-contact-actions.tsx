"use client"

import React, { useState } from "react"
import { MessageCircle, MessageSquareText, Phone } from "lucide-react"
import type { ShopContact } from "@/modules/greeting-card/domain/shop-contact"
import { ProductInquiryForm } from "./product-inquiry-form"

interface Props {
  shop: ShopContact | null | undefined
  catalogId: string
  product: { id: string; name: string }
  variantName?: string | null | undefined
}

const BTN = "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface text-body-sm font-bold text-foreground hover:bg-surface-muted"

/** Ba cách liên hệ cho mẫu "Liên hệ" / phiên bản theo ý khách: Gọi điện, Zalo, Nhắn tin (form). */
export function ProductContactActions({ shop, catalogId, product, variantName }: Props) {
  const [showForm, setShowForm] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {shop?.phone && (
          <a href={`tel:${shop.phone}`} className={BTN}>
            <Phone size={16} aria-hidden="true" /> Gọi điện
          </a>
        )}
        {shop?.zaloUrl && (
          <a href={shop.zaloUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
            <MessageCircle size={16} aria-hidden="true" /> Zalo
          </a>
        )}
        <button type="button" aria-expanded={showForm} onClick={() => setShowForm((v) => !v)} className={BTN}>
          <MessageSquareText size={16} aria-hidden="true" /> Nhắn tin
        </button>
      </div>
      {showForm && <ProductInquiryForm catalogId={catalogId} product={product} variantName={variantName} />}
    </div>
  )
}
