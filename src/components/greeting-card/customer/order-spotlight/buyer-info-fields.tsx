"use client"

import React from "react"
import { ORDER_FIELD_MAX } from "@/modules/greeting-card/domain/greeting-card-rules"

const LABEL = "block text-body-sm font-bold text-foreground mb-1"

/** Khối Người mua: họ tên, SĐT, email + công tắc "Tôi cũng là người nhận" (form giao hàng tiêu chuẩn). */
export function BuyerInfoFields({
  idPrefix,
  inputClassName,
  customerName,
  customerPhone,
  customerEmail,
  sameAsRecipient,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onSameAsRecipientChange,
}: {
  idPrefix: string
  inputClassName: string
  customerName: string
  customerPhone: string
  customerEmail: string
  /** undefined = không hiện công tắc (homestay đã có lựa chọn riêng) */
  sameAsRecipient?: boolean | undefined
  onCustomerNameChange: (v: string) => void
  onCustomerPhoneChange: (v: string) => void
  onCustomerEmailChange: (v: string) => void
  onSameAsRecipientChange?: ((v: boolean) => void) | undefined
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-customerName`} className={LABEL}>
            Họ tên của bạn <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: Nguyễn Văn A"
            value={customerName}
            maxLength={ORDER_FIELD_MAX.name}
            id={`${idPrefix}-customerName`}
            autoComplete="name"
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-customerPhone`} className={LABEL}>
            Số điện thoại của bạn <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="VD: 0901234567"
            value={customerPhone}
            maxLength={15}
            id={`${idPrefix}-customerPhone`}
            autoComplete="tel"
            inputMode="tel"
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-customerEmail`} className={LABEL}>
          Email <span className="text-caption font-normal text-text-muted">(tùy chọn)</span>
        </label>
        <input
          type="email"
          placeholder="VD: email@example.com"
          value={customerEmail}
          maxLength={100}
          id={`${idPrefix}-customerEmail`}
          autoComplete="email"
          onChange={(e) => onCustomerEmailChange(e.target.value)}
          className={inputClassName}
        />
      </div>

      {sameAsRecipient !== undefined && onSameAsRecipientChange && (
        <label
          htmlFor={`${idPrefix}-sameAsRecipient`}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
            sameAsRecipient ? "border-primary/50 bg-primary/5" : "border-border bg-background hover:border-primary/40"
          }`}
        >
          <input
            id={`${idPrefix}-sameAsRecipient`}
            type="checkbox"
            checked={sameAsRecipient}
            onChange={(e) => onSameAsRecipientChange(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-primary"
          />
          <span className="min-w-0">
            <span className="block text-body-sm font-bold text-foreground">Tôi cũng là người nhận</span>
            <span className="block text-caption text-text-muted">Dùng họ tên và số điện thoại ở trên để nhận hàng.</span>
          </span>
        </label>
      )}
    </>
  )
}
