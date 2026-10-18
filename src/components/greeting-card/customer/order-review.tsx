"use client"

import { ArrowLeft, Check, Gift, ShieldCheck, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BrochureQuote } from "@/modules/greeting-card/domain/brochure-pricing"
import type { CustomerOrderSubmitInput, ProductSnapshot } from "@/modules/greeting-card/domain/greeting-card-types"
import type { PublicAppliedPolicies } from "@/modules/greeting-card/domain/store-policy"
import { PrivacyNotice } from "./privacy-notice"
import { openShopInfo } from "./shop-info-sheet"
import { FlowerImage } from "@/components/greeting-card/flower-image"
import React, { useState } from "react"

const vnd = (n: number) => `${n.toLocaleString("vi-VN")} đ`

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-body-sm text-text-muted">{label}</dt>
      <dd className={`text-right text-body-sm ${strong ? "font-extrabold text-primary" : "font-semibold text-foreground"}`}>{value}</dd>
    </div>
  )
}

/** "dd/mm/yyyy" từ "yyyy-mm-dd" (ngày giao khách đã chọn). */
function viDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  return y && m && d ? `${d}/${m}/${y}` : iso
}

/**
 * Bước "Xem lại đơn" trước khi gửi: khách kiểm mẫu, số tiền, người nhận, ngày giờ giao
 * rồi mới xác nhận — tránh đặt nhầm và đúng chuẩn giao kết hợp đồng trực tuyến.
 */
export function OrderReview(props: {
  product: ProductSnapshot
  variantName: string | null
  input: CustomerOrderSubmitInput
  quote: BrochureQuote | null
  appliedPolicies?: PublicAppliedPolicies | null | undefined
  submitting: boolean
  error: string | null
  industryKey?: string | null | undefined
  onEdit: () => void
  onConfirm: (confirmedTerms: boolean) => void
}) {
  const { product, input, quote, appliedPolicies, industryKey } = props
  const isHomestay = industryKey === "HOMESTAY"
  const awaitingQuote = quote?.awaitingQuote || (quote?.totalVnd ?? product.price) <= 0
  // Có thỏa thuận → khách phải tự tick (không tick sẵn); máy chủ cũng chặn nếu thiếu
  const needsTerms = (appliedPolicies?.agreements.length ?? 0) > 0
  const [termsAgreed, setTermsAgreed] = useState(false)

  const selectedPromo = appliedPolicies?.promotions.find((p) => p.id === input.selectedPromotionId)

  return (
    <section aria-labelledby="order-review-title" className="flex flex-col gap-4">
      <h2 id="order-review-title" className="text-title font-extrabold text-foreground">
        {isHomestay ? "Xem lại thông tin đặt phòng" : "Xem lại đơn trước khi đặt"}
      </h2>

      {/* Ảnh mẫu đã chọn — khách nhìn lại đúng sản phẩm trước khi xác nhận */}
      <figure className="flex items-center gap-4 rounded-xl border border-border bg-surface-muted p-3">
        <FlowerImage
          src={product.imageUrl}
          driveLink={product.driveLink}
          alt={`Ảnh ${product.name}`}
          sizes="(min-width: 640px) 128px, 96px"
          fallback="icon"
          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:h-32 sm:w-32"
        />
        <figcaption className="min-w-0 flex-1">
          <p className="text-caption text-text-muted">{isHomestay ? "Hạng phòng đã chọn" : "Sản phẩm bạn đã chọn"}</p>
          <p className="text-body font-extrabold text-foreground">{product.name}</p>
          {props.variantName && <p className="text-body-sm text-text-muted">{props.variantName}</p>}
        </figcaption>
      </figure>

      <dl className="rounded-xl border border-border bg-surface-muted px-4 py-2 divide-y divide-border">
        <Row label={isHomestay ? "Hạng phòng" : "Sản phẩm"} value={props.variantName ? `${product.name} · ${props.variantName}` : product.name} />
        {quote && quote.quantity > 1 && <Row label={isHomestay ? "Số đêm / Số phòng" : "Số lượng"} value={String(quote.quantity)} />}
        {quote && !awaitingQuote && <Row label="Tạm tính" value={vnd(quote.subtotalVnd)} />}
        {quote && quote.discountVnd > 0 && <Row label={`Giảm giá${quote.voucherCode ? ` (${quote.voucherCode})` : ""}`} value={`− ${vnd(quote.discountVnd)}`} />}
        {quote?.shippingZone && (
          <Row label={isHomestay ? `Phí dịch vụ (${quote.shippingZone.name})` : `Phí giao (${quote.shippingZone.name})`} value={quote.shippingFeeVnd > 0 ? vnd(quote.shippingFeeVnd) : "Miễn phí"} />
        )}
        {quote?.promotionDiscountVnd ? <Row label={`Ưu đãi${selectedPromo ? ` (${selectedPromo.title})` : ""}`} value={`− ${vnd(quote.promotionDiscountVnd)}`} /> : null}
        {quote?.holidaySurchargeVnd ? <Row label={`Phụ phí ngày lễ (${quote.holidayName ?? ""})`} value={`+ ${vnd(quote.holidaySurchargeVnd)}`} /> : null}
        <Row label={isHomestay ? "Tổng tiền đặt phòng" : "Tổng đơn hàng"} value={awaitingQuote ? "Cửa hàng báo giá sau" : vnd(quote?.totalVnd ?? product.price)} strong />
        {!awaitingQuote && quote?.paymentPlan && quote.paymentPlan.dueLaterVnd > 0 && (
          <>
            <Row label={`Đặt cọc hôm nay (${quote.paymentPlan.depositPercent}%)`} value={vnd(quote.paymentPlan.dueNowVnd)} strong />
            <Row label={isHomestay ? "Thanh toán khi nhận phòng" : "Thanh toán phần còn lại khi nhận hàng"} value={vnd(quote.paymentPlan.dueLaterVnd)} />
          </>
        )}
      </dl>

      <dl className="rounded-xl border border-border px-4 py-2 divide-y divide-border">
        <Row label="Người đặt" value={`${input.customerName} · ${input.customerPhone}${input.customerEmail ? ` · ${input.customerEmail}` : ""}`} />
        <Row label={isHomestay ? "Người nhận phòng" : "Người nhận"} value={`${input.recipientName} · ${input.recipientPhone}`} />
        <Row label={isHomestay ? "Thời gian nhận phòng" : "Thời gian"} value={`${viDate(input.deliveryDate)} · ${input.deliveryTimeSlot ?? ""}`} />
        <Row label={isHomestay ? "Địa điểm lưu trú" : "Địa chỉ"} value={input.deliveryAddress} />
        {input.cardMessage?.trim() && <Row label={isHomestay ? "Nội quy & Thẻ chào mừng" : "Lời nhắn thiệp"} value={`“${input.cardMessage.trim()}”`} />}
        {input.senderNote?.trim() && <Row label={isHomestay ? "Yêu cầu cho Quản gia" : "Ghi chú đơn hàng"} value={input.senderNote.trim()} />}
        {input.deliveryNote?.trim() && <Row label="Ghi chú thêm" value={input.deliveryNote.trim()} />}
        {input.mapUrl?.trim() && <Row label="Vị trí bản đồ" value="Đã gửi link Google Maps" />}
      </dl>

      {/* CHÍNH SÁCH: ƯU ĐÃI, (lối mở) CAM KẾT, THỎA THUẬN (SPEC #2 & #5) */}
      <div className="space-y-3">
        {selectedPromo && (
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
            <h4 className="text-caption font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Gift size={14} />
              <span>Ưu đãi áp dụng cho đơn hàng</span>
            </h4>
            <p className="text-body-sm font-bold text-foreground">{selectedPromo.title}</p>
            <p className="text-caption text-text-muted">{selectedPromo.customerText}</p>
          </div>
        )}

        {/* Cam kết chuyển lên khung "Thông tin cửa hàng" ở thanh trên cùng (PO 08/10/2026) — ở đây chỉ còn lối mở */}
        <button
          type="button"
          onClick={() => openShopInfo("commitments")}
          className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-3.5 text-left text-body-sm font-bold text-success"
        >
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Xem cam kết của cửa hàng</span>
        </button>

        {appliedPolicies?.agreements && appliedPolicies.agreements.length > 0 && (
          <div className="p-3.5 rounded-xl border border-border bg-surface-muted space-y-2">
            <h4 className="text-caption font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <FileText size={14} />
              <span>Thỏa thuận khi thực hiện đơn ({appliedPolicies.agreements.length})</span>
            </h4>
            <ul className="space-y-1.5 text-caption text-text-muted">
              {appliedPolicies.agreements.map((a) => (
                <li key={a.id} className="flex items-start gap-1.5">
                  <span className="text-text-muted font-bold">•</span>
                  <span><strong className="text-foreground">{a.title}:</strong> {a.customerText}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CHECKBOX XÁC NHẬN THỎA THUẬN (SPEC #2 D, #5) */}
      {needsTerms && <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer select-none">
        <input
          type="checkbox"
          checked={termsAgreed}
          onChange={(e) => setTermsAgreed(e.target.checked)}
          className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4"
        />
        <span className="text-caption leading-relaxed text-foreground">
          Tôi đã đọc và đồng ý với {appliedPolicies?.agreements.length} <strong>thỏa thuận</strong> ở trên cho đơn hàng này.
        </span>
      </label>}

      {props.error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-bg p-3 text-body-sm text-danger">
          {props.error}
        </p>
      )}

      <Button
        type="button"
        onClick={() => props.onConfirm(needsTerms && termsAgreed)}
        disabled={props.submitting || (needsTerms && !termsAgreed)}
        className="h-12 w-full gap-2 rounded-xl text-body font-extrabold"
      >
        <Check size={18} aria-hidden="true" />
        {props.submitting ? "Đang gửi đơn hàng..." : awaitingQuote ? "Xác nhận gửi đơn" : "Xác nhận đặt hoa & thanh toán"}
      </Button>
      <PrivacyNotice />
      <Button type="button" variant="ghost" onClick={props.onEdit} disabled={props.submitting} className="gap-1.5 text-text-muted">
        <ArrowLeft size={16} aria-hidden="true" />
        Sửa thông tin
      </Button>
    </section>
  )
}
