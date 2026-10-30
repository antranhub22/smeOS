"use client"

import React from "react"
import { MessageCircle, Phone } from "lucide-react"
import type { StyleDefinition } from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { shopCallUrl, shopZaloUrl } from "./public-contact-links"

interface PublicStickyActionsProps {
  shopName: string
  phone: string | null
  topic: string
  style: StyleDefinition
}

/** Thanh hành động cố định đáy màn hình di động (desktop đã có nút gọi trên header): nhắn Zalo + gọi. Ẩn khi tiệm chưa khai số điện thoại. */
export function PublicStickyActions({ shopName, phone, topic, style }: PublicStickyActionsProps) {
  const zalo = shopZaloUrl(shopName, phone, topic)
  const call = shopCallUrl(phone)
  if (!zalo || !call) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden"
      style={{ backgroundColor: style.tokens.surface, borderColor: style.tokens.border }}
    >
      <div className="mx-auto flex max-w-4xl gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: style.tokens.ctaBg, color: style.tokens.ctaText }}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Nhắn Zalo đặt hoa
        </a>
        <a
          href={call}
          aria-label={`Gọi ${shopName}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold"
          style={{ borderColor: style.tokens.border, color: style.tokens.textPrimary }}
        >
          <Phone size={16} aria-hidden="true" />
          Gọi
        </a>
      </div>
    </div>
  )
}
