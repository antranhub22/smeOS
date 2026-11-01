"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, ExternalLink, Layers } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InlineError } from "@/components/ui/inline-error"
import { formatCurrency } from "@/lib/i18n/formatters"
import { quotationApi } from "./quotation-api"
import type { ProductItem, QuotationRecord } from "./quotation-types"

interface PartnerQuoteBuilderProps {
  products: ProductItem[]
  sampleProductLabel: string
  makerAction: string
  onQuotationCreated?: (quote: QuotationRecord) => void
}

export function PartnerQuoteBuilder({
  products,
  sampleProductLabel,
  makerAction,
  onQuotationCreated,
}: PartnerQuoteBuilderProps) {
  const [partnerItemName, setPartnerItemName] = useState("Sản phẩm đặt gia công")
  const [partnerPrice, setPartnerPrice] = useState("450000")
  const [deliveryFee, setDeliveryFee] = useState("30000")
  const [deadlineTime, setDeadlineTime] = useState("17:00 hôm nay")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdQuote, setCreatedQuote] = useState<QuotationRecord | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const totalPartnerPay = (Number(partnerPrice) || 0) + (Number(deliveryFee) || 0)

  const handleSave = async (isSend = false) => {
    if (!partnerItemName.trim()) {
      setErrorMsg("Vui lòng nhập tên sản phẩm cần gia công")
      return
    }
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const quote = await quotationApi.create({
        items: [
          {
            name: partnerItemName.trim(),
            qty: 1,
            unitPrice: totalPartnerPay,
            note: `Gia công: ${formatCurrency(Number(partnerPrice) || 0)} + Ship: ${formatCurrency(Number(deliveryFee) || 0)}. Hạn: ${deadlineTime}`,
          },
        ],
        notes: `Phiếu giao việc đối tác gia công (${makerAction}). Hạn: ${deadlineTime}`,
        terms: "Thanh toán khi hoàn thành bàn giao và kiểm tra chất lượng.",
      })

      const finalQuote = isSend ? await quotationApi.send(quote.id).catch(() => quote) : quote
      setCreatedQuote(finalQuote)
      onQuotationCreated?.(finalQuote)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo phiếu báo giá")
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = () => {
    if (!createdQuote) return
    const url = `${window.location.origin}/bg/${createdQuote.code.toLowerCase()}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quick Select from Library */}
      <Card className="p-4 bg-surface border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-caption font-semibold text-text">
            Chọn nhanh {sampleProductLabel} từ kho để điền thông số:
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {products.slice(0, 5).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPartnerItemName(p.title)
                setPartnerPrice(String(Math.round(p.price * 0.75)))
              }}
              className="flex-shrink-0 flex items-center gap-2 p-2 rounded-lg border border-border bg-surface hover:border-primary text-left cursor-pointer transition-colors"
            >
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-8 h-8 rounded-md object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-surface-alt flex items-center justify-center text-caption text-text-muted">
                  Ảnh
                </div>
              )}
              <div className="max-w-[130px]">
                <div className="text-caption font-bold text-text truncate">{p.title}</div>
                <div className="text-caption text-primary">
                  {formatCurrency(Math.round(p.price * 0.75))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-surface border-border space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-selected text-primary">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-body-sm font-bold text-text">
              Thông tin Báo giá cho Đối tác gia công ({makerAction})
            </h2>
            <p className="text-caption text-text-muted">
              Áp dụng cho các đơn giao việc hoặc liên kết cửa hàng đối tác
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="partner-item-name" className="text-caption font-semibold text-text">
              Tên {sampleProductLabel} cần gia công
            </label>
            <input
              id="partner-item-name"
              type="text"
              value={partnerItemName}
              onChange={(e) => setPartnerItemName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="partner-price" className="text-caption font-semibold text-text">
              Giá trả cho đối tác (VNĐ)
            </label>
            <input
              id="partner-price"
              type="number"
              value={partnerPrice}
              onChange={(e) => setPartnerPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="delivery-fee" className="text-caption font-semibold text-text">
              Phí giao nhận hỗ trợ (VNĐ)
            </label>
            <input
              id="delivery-fee"
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deadline-time" className="text-caption font-semibold text-text">
              Hạn chót hoàn thành
            </label>
            <input
              id="deadline-time"
              type="text"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Preview Ticket */}
        <div className="p-4 rounded-xl border border-dashed border-border bg-surface-alt space-y-2">
          <div className="flex items-center justify-between text-body-sm font-bold text-primary">
            <span>PHIẾU GIAO VIỆC GIA CÔNG {createdQuote ? `— ${createdQuote.code}` : ""}</span>
            <Badge tone="neutral">
              {createdQuote ? createdQuote.status : "Chờ gửi đối tác"}
            </Badge>
          </div>
          <div className="text-caption text-text">
            <strong>Yêu cầu sản xuất:</strong> {partnerItemName}
          </div>
          <div className="text-caption text-text">
            <strong>Thực nhận của Đối tác:</strong> {formatCurrency(totalPartnerPay)} (gồm cả phí giao nhận)
          </div>
          <div className="text-caption text-text-muted">
            <strong>Hạn chót hoàn thành:</strong> {deadlineTime}
          </div>
        </div>

        {errorMsg && <InlineError message={errorMsg} />}

        {createdQuote && (
          <div className="p-3 rounded-xl bg-surface-alt border border-border text-caption space-y-2">
            <div className="flex items-center justify-between text-primary font-bold">
              <span>Đã lưu phiếu báo giá: {createdQuote.code}</span>
              <span className="text-caption">{createdQuote.status}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Đã sao chép link!" : "Sao chép link gửi đối tác"}</span>
              </Button>
              <Link
                href={`/bg/${createdQuote.code.toLowerCase()}`}
                target="_blank"
                className="px-2.5 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt flex items-center gap-1 text-caption text-text"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem</span>
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleSave(false)}
          >
            Lưu nháp
          </Button>
          <Button
            variant="primary"
            disabled={submitting}
            onClick={() => handleSave(true)}
          >
            Xuất phiếu báo giá gửi Shop
          </Button>
        </div>
      </Card>
    </div>
  )
}
