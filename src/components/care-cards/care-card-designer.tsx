"use client"

import React, { useState } from "react"
import { Copy } from "@/components/ui/icon-set/copy"
import { Check } from "@/components/ui/icon-set/check"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Gift } from "@/components/ui/icon-set/gift"
import { Heart } from "@/components/ui/icon-set/heart"
import { ShieldCheck } from "@/components/ui/icon-set/shield-check"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CARE_CARD_TEMPLATES,
  getCareCardTemplate,
  buildCareCardShareText,
  type CareCardAssetCode,
  type CareCardContent,
} from "@/modules/care-cards/domain/care-card"
import { CareCardPreview } from "./care-card-preview"

interface CareCardDesignerProps {
  initialCode?: CareCardAssetCode
  recipientName?: string
  storeName?: string
  storePhone?: string | undefined
  onSelectCard?: (content: CareCardContent) => void
}

const TEMPLATE_KEYS: CareCardAssetCode[] = ["49", "50", "48", "51", "52", "55"]

export function CareCardDesigner({
  initialCode = "49",
  recipientName = "",
  storeName = "Cửa hàng của bạn",
  storePhone,
  onSelectCard,
}: CareCardDesignerProps) {
  const [selectedCode, setSelectedCode] = useState<CareCardAssetCode>(initialCode)
  const template = getCareCardTemplate(selectedCode)

  const [content, setContent] = useState<CareCardContent>({
    assetCode: selectedCode,
    recipientName,
    headline: template.defaultHeadline,
    messageBody: template.defaultMessage,
    signature: storeName,
    voucherCode: selectedCode === "52" ? "TRIAN10" : "",
    voucherValue: selectedCode === "52" ? "Giảm 10% đơn tiếp theo" : "",
    careInstructions: template.defaultInstructions ?? [],
    accentColor: template.suggestedTheme,
  })

  const [copied, setCopied] = useState(false)

  const handleSwitchTemplate = (code: CareCardAssetCode) => {
    setSelectedCode(code)
    const tpl = getCareCardTemplate(code)
    setContent((prev) => ({
      ...prev,
      assetCode: code,
      headline: tpl.defaultHeadline,
      messageBody: tpl.defaultMessage,
      careInstructions: tpl.defaultInstructions ?? [],
      voucherCode: code === "52" ? "TRIAN10" : prev.voucherCode,
      voucherValue: code === "52" ? "Giảm 10% đơn tiếp theo" : prev.voucherValue,
      accentColor: tpl.suggestedTheme,
    }))
  }

  const handleCopyText = async () => {
    const text = buildCareCardShareText(content, storeName)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Editor Column */}
      <div className="lg:col-span-7 space-y-5 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-sm">
        {/* Template Selector Chips */}
        <div>
          <label className="block text-body-sm font-semibold text-text mb-2">
            Chọn mẫu thiệp chăm sóc
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATE_KEYS.map((code) => {
              const tpl = CARE_CARD_TEMPLATES[code]
              const isSelected = selectedCode === code
              return (
                <Button variant="outline"
                  type="button"
                  key={code}
                  onClick={() => handleSwitchTemplate(code)}
                  className={`text-[length:inherit] h-auto justify-start font-[inherit] gap-0 cursor-pointer p-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs hover:bg-primary/5"
                      : "border-border hover:border-border-hover bg-surface-alt/40 text-text hover:bg-surface-alt/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {code === "52" ? (
                      <Gift className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    ) : code === "55" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    )}
                    <span className="text-caption font-bold truncate">{tpl.name}</span>
                  </div>
                  <p className="text-caption text-text-muted line-clamp-1">#{tpl.assetCode}</p>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 pt-2 border-t border-border/60">
          <div>
            <label htmlFor="care-card-1" className="block text-caption font-medium text-text-muted mb-1">
              Người nhận
            </label>
            <Input id="care-card-1"
              type="text"
              value={content.recipientName}
              onChange={(e) => setContent({ ...content, recipientName: e.target.value })}
              placeholder="VD: Chị Minh Anh, Anh Hoàng..."
            />
          </div>

          <div>
            <label htmlFor="care-card-2" className="block text-caption font-medium text-text-muted mb-1">
              Tiêu đề thiệp
            </label>
            <Input id="care-card-2"
              type="text"
              value={content.headline}
              onChange={(e) => setContent({ ...content, headline: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="care-card-3" className="block text-caption font-medium text-text-muted mb-1">
              Nội dung lời nhắn
            </label>
            <Textarea id="care-card-3"
              rows={4}
              value={content.messageBody}
              onChange={(e) => setContent({ ...content, messageBody: e.target.value })}
            />
          </div>

          {selectedCode === "52" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-alt border border-border">
              <div>
                <label htmlFor="care-card-4" className="block text-caption font-medium text-text-muted mb-1">
                  Mã quà tặng
                </label>
                <Input id="care-card-4"
                  type="text"
                  value={content.voucherCode || ""}
                  onChange={(e) => setContent({ ...content, voucherCode: e.target.value })}
                  placeholder="VD: QUATANG10"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="care-card-5" className="block text-caption font-medium text-text-muted mb-1">
                  Trị giá ưu đãi
                </label>
                <Input id="care-card-5"
                  type="text"
                  value={content.voucherValue || ""}
                  onChange={(e) => setContent({ ...content, voucherValue: e.target.value })}
                  placeholder="VD: 50.000 đ hoặc 10%"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="care-card-6" className="block text-caption font-medium text-text-muted mb-1">
              Chữ ký tiệm
            </label>
            <Input id="care-card-6"
              type="text"
              value={content.signature}
              onChange={(e) => setContent({ ...content, signature: e.target.value })}
            />
          </div>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Đã sao chép!" : "Sao chép lời nhắn"}</span>
          </Button>

          {onSelectCard && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onSelectCard(content)}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Dùng thiệp này gửi khách</span>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-body-sm font-semibold text-text">Xem trước tấm thiệp</span>
          <span className="text-caption text-text-muted">Khổ hiển thị chuẩn</span>
        </div>
        <CareCardPreview content={content} storeName={storeName} storePhone={storePhone} />
      </div>
    </div>
  )
}
