"use client"

import React from "react"
import { Sparkles, Gift, Heart, ShieldCheck } from "@/components/ui/icons"
import type { CareCardContent } from "@/modules/care-cards/domain/care-card"

interface CareCardPreviewProps {
  content: CareCardContent
  storeName?: string
  storePhone?: string | undefined
}

export function CareCardPreview({ content, storeName = "Cửa hàng", storePhone }: CareCardPreviewProps) {
  const isVoucher = content.assetCode === "52"
  const isCareGuide = content.assetCode === "55"

  return (
    <div
      className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-lg p-6 sm:p-8 flex flex-col justify-between min-h-[420px]"
      style={{
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(var(--primary-rgb, 16, 185, 129), 0.03) 0%, transparent 80%)",
      }}
    >
      {/* Decorative top badge */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          {isVoucher ? (
            <Gift className="w-5 h-5 text-primary" aria-hidden="true" />
          ) : isCareGuide ? (
            <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
          ) : (
            <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
          )}
          <span className="text-caption font-semibold tracking-wider uppercase text-text-muted">
            {storeName}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>

      {/* Main card body */}
      <div className="py-6 space-y-4 text-center">
        {content.recipientName && (
          <p className="text-body-sm font-medium text-text-muted">
            Kính gửi: <span className="font-semibold text-text">{content.recipientName}</span>
          </p>
        )}

        <h3 className="text-xl sm:text-2xl font-bold text-text tracking-tight font-serif">
          {content.headline}
        </h3>

        <p className="text-body-sm text-text-muted leading-relaxed whitespace-pre-line px-2">
          {content.messageBody}
        </p>

        {/* Voucher section */}
        {(content.voucherCode || content.voucherValue) && (
          <div className="mt-4 p-4 rounded-xl bg-surface-alt border border-dashed border-primary/40 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-caption font-medium text-text-muted">
              <Gift className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Mã quà tặng ưu đãi</span>
            </div>
            <div className="text-lg font-mono font-bold text-primary tracking-wider">
              {content.voucherCode || "TRI-AN-KHACH-HANG"}
            </div>
            {content.voucherValue && (
              <div className="text-caption font-semibold text-text">
                Trị giá: {content.voucherValue}
              </div>
            )}
          </div>
        )}

        {/* Care instructions section */}
        {content.careInstructions && content.careInstructions.length > 0 && (
          <div className="mt-4 text-left p-4 rounded-xl bg-surface-alt border border-border/80 space-y-2">
            <p className="text-caption font-bold text-text flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
              Hướng dẫn chăm sóc:
            </p>
            <ul className="text-caption text-text-muted space-y-1.5 pl-1">
              {content.careInstructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card Footer / Signature */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between text-caption text-text-muted">
        <div>
          <span className="block italic">Thương mến,</span>
          <span className="font-semibold text-text">{content.signature || storeName}</span>
        </div>
        {storePhone && (
          <span className="text-right text-caption font-mono">
            Hotline: {storePhone}
          </span>
        )}
      </div>
    </div>
  )
}
