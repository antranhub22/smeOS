"use client"

import React from "react"
import { Users } from "lucide-react"

interface HomestayGuestFieldsProps {
  uid: string
  inputClassName: string
  isSelfBooking: boolean
  recipientName: string
  recipientPhone: string
  adultsCount: number
  childrenCount: number
  onSelfBookingToggle: (isSelf: boolean) => void
  onRecipientNameChange: (name: string) => void
  onRecipientPhoneChange: (phone: string) => void
  onAdultsChange: (count: number) => void
  onChildrenChange: (count: number) => void
  /** true khi công tắc "Tôi là người nhận phòng" đã hiển thị ở khối Người mua */
  hideSelfToggle?: boolean | undefined
}

export function HomestayGuestFields({
  uid,
  inputClassName,
  isSelfBooking,
  recipientName,
  recipientPhone,
  adultsCount,
  childrenCount,
  onSelfBookingToggle,
  onRecipientNameChange,
  onRecipientPhoneChange,
  onAdultsChange,
  onChildrenChange,
  hideSelfToggle,
}: HomestayGuestFieldsProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface-muted/40 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-body-sm font-extrabold text-foreground flex items-center gap-2">
          <Users size={17} className="text-primary" />
          <span>Khách lưu trú & Người nhận phòng</span>
        </div>

        {!hideSelfToggle && (
        <label className="flex items-center gap-1.5 cursor-pointer text-caption font-bold text-primary">
          <input
            type="checkbox"
            checked={isSelfBooking}
            onChange={(e) => onSelfBookingToggle(e.target.checked)}
            className="accent-primary rounded-sm"
          />
          <span>Tôi là người nhận phòng</span>
        </label>
        )}
      </div>

      {!isSelfBooking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
          <div>
            <label htmlFor={`${uid}-guestName`} className="block text-caption font-bold text-foreground mb-1">
              Người đại diện nhận phòng <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              id={`${uid}-guestName`}
              value={recipientName}
              placeholder="VD: Trần Thị B"
              onChange={(e) => onRecipientNameChange(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-guestPhone`} className="block text-caption font-bold text-foreground mb-1">
              Số điện thoại người nhận phòng <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              id={`${uid}-guestPhone`}
              value={recipientPhone}
              placeholder="VD: 0912345678"
              onChange={(e) => onRecipientPhoneChange(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      )}

      {/* Số lượng khách */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
          <span className="text-caption font-bold text-foreground">Người lớn</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={adultsCount <= 1}
              onClick={() => onAdultsChange(Math.max(1, adultsCount - 1))}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center font-bold text-body-sm disabled:opacity-30"
            >
              −
            </button>
            <span className="font-extrabold text-body-sm w-5 text-center">{adultsCount}</span>
            <button
              type="button"
              disabled={adultsCount >= 30}
              onClick={() => onAdultsChange(adultsCount + 1)}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center font-bold text-body-sm disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
          <span className="text-caption font-bold text-foreground">Trẻ em (&lt;12t)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={childrenCount <= 0}
              onClick={() => onChildrenChange(Math.max(0, childrenCount - 1))}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center font-bold text-body-sm disabled:opacity-30"
            >
              −
            </button>
            <span className="font-extrabold text-body-sm w-5 text-center">{childrenCount}</span>
            <button
              type="button"
              disabled={childrenCount >= 20}
              onClick={() => onChildrenChange(childrenCount + 1)}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center font-bold text-body-sm disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
