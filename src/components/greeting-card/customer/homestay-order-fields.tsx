"use client"

import React, { useId } from "react"
import { Calendar, Users, Home, Clock, Car, Bike, Plane, CheckCircle2 } from "lucide-react"
import { ViDateInput } from "./vi-date-input"

interface HomestayOrderFieldsProps {
  idPrefix?: string | undefined
  inputClassName: string
  checkInDate: string
  checkOutDate: string
  minDate: string
  maxDate: string
  checkInTimeSlot: string
  customerName: string
  customerPhone: string
  recipientName: string
  recipientPhone: string
  isSelfBooking: boolean
  adultsCount: number
  childrenCount: number
  transitMethod: string
  specialRequests: string
  homestayAddress?: string | null | undefined
  homestayName?: string | null | undefined
  onCheckInChange: (date: string) => void
  onCheckOutChange: (date: string) => void
  onTimeSlotChange: (slot: string) => void
  onRecipientNameChange: (name: string) => void
  onRecipientPhoneChange: (phone: string) => void
  onSelfBookingToggle: (isSelf: boolean) => void
  onAdultsChange: (count: number) => void
  onChildrenChange: (count: number) => void
  onTransitChange: (transit: string) => void
  onSpecialRequestsChange: (text: string) => void
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1
  const t1 = new Date(`${checkIn}T00:00:00Z`).getTime()
  const t2 = new Date(`${checkOut}T00:00:00Z`).getTime()
  const diffDays = Math.round((t2 - t1) / 86_400_000)
  return diffDays > 0 ? diffDays : 1
}

const CHECK_IN_SLOTS = [
  "14:00 - 16:00 (Tiêu chuẩn)",
  "16:00 - 18:00 (Chiều)",
  "18:00 - 21:00 (Buổi tối)",
  "Sau 21:00 (Nhận phòng muộn)",
]

const TRANSIT_OPTIONS = [
  { key: "CAR", label: "Ô tô riêng (cần chỗ đỗ)", icon: Car },
  { key: "BIKE", label: "Xe máy", icon: Bike },
  { key: "TAXI", label: "Taxi / Xe đưa đón", icon: Plane },
]

export function HomestayOrderFields({
  idPrefix,
  inputClassName,
  checkInDate,
  checkOutDate,
  minDate,
  maxDate,
  checkInTimeSlot,
  recipientName,
  recipientPhone,
  isSelfBooking,
  adultsCount,
  childrenCount,
  transitMethod,
  specialRequests,
  homestayAddress,
  homestayName,
  onCheckInChange,
  onCheckOutChange,
  onTimeSlotChange,
  onRecipientNameChange,
  onRecipientPhoneChange,
  onSelfBookingToggle,
  onAdultsChange,
  onChildrenChange,
  onTransitChange,
  onSpecialRequestsChange,
}: HomestayOrderFieldsProps) {
  const uid = idPrefix || useId()
  const nights = calculateNights(checkInDate, checkOutDate)

  // Ngày checkout tối thiểu = ngày checkin + 1 ngày
  const minCheckOut = checkInDate
    ? new Date(new Date(`${checkInDate}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10)
    : minDate

  return (
    <div className="flex flex-col gap-4">
      {/* 1. KHỐI LỊCH NHẬN & TRẢ PHÒNG */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-body-sm font-extrabold text-foreground flex items-center gap-2">
            <Calendar size={17} className="text-primary" />
            <span>Thời gian lưu trú</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-extrabold bg-primary text-white shadow-xs">
            🌙 {nights} đêm lưu trú
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-checkInDate`} className="block text-caption font-bold text-foreground mb-1">
              Ngày nhận phòng (Check-in) <span className="text-danger">*</span>
            </label>
            <ViDateInput
              id={`${uid}-checkInDate`}
              required
              min={minDate}
              max={maxDate}
              value={checkInDate}
              onChange={(val) => {
                onCheckInChange(val)
                // Tự động đẩy checkOutDate nếu đang nhỏ hơn hoặc bằng checkIn
                if (!checkOutDate || checkOutDate <= val) {
                  const nextDay = new Date(new Date(`${val}T00:00:00Z`).getTime() + 86_400_000)
                    .toISOString()
                    .slice(0, 10)
                  onCheckOutChange(nextDay)
                }
              }}
              className={inputClassName}
            />
            <span className="text-caption text-text-muted mt-0.5 block">Nhận phòng từ 14:00</span>
          </div>

          <div>
            <label htmlFor={`${uid}-checkOutDate`} className="block text-caption font-bold text-foreground mb-1">
              Ngày trả phòng (Check-out) <span className="text-danger">*</span>
            </label>
            <ViDateInput
              id={`${uid}-checkOutDate`}
              required
              min={minCheckOut}
              max={maxDate}
              value={checkOutDate}
              onChange={onCheckOutChange}
              className={inputClassName}
            />
            <span className="text-caption text-text-muted mt-0.5 block">Trả phòng trước 12:00</span>
          </div>
        </div>

        {/* Khung giờ nhận phòng */}
        <div>
          <label htmlFor={`${uid}-checkInTime`} className="block text-caption font-bold text-foreground mb-1">
            Giờ nhận phòng dự kiến
          </label>
          <div className="relative">
            <select
              id={`${uid}-checkInTime`}
              value={checkInTimeSlot}
              onChange={(e) => onTimeSlotChange(e.target.value)}
              className={inputClassName}
            >
              <option value="">— Chọn khung giờ dự kiến đến —</option>
              {CHECK_IN_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <Clock size={15} className="absolute right-3 top-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. KHỐI THÔNG TIN KHÁCH LƯU TRÚ */}
      <div className="p-4 rounded-xl border border-border bg-surface-muted/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-body-sm font-extrabold text-foreground flex items-center gap-2">
            <Users size={17} className="text-primary" />
            <span>Khách lưu trú & Người nhận phòng</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-caption font-bold text-primary">
            <input
              type="checkbox"
              checked={isSelfBooking}
              onChange={(e) => onSelfBookingToggle(e.target.checked)}
              className="accent-primary rounded-sm"
            />
            <span>Tôi là người nhận phòng</span>
          </label>
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

      {/* 3. KHỐI ĐỊA ĐIỂM HOMESTAY & PHƯƠNG TIỆN */}
      <div className="p-4 rounded-xl border border-border bg-surface-muted/30 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-body-sm font-extrabold text-foreground">
          <Home size={17} className="text-primary" />
          <span>Địa điểm lưu trú & Đón tiếp</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-background text-body-sm">
          <div className="font-bold text-foreground">{homestayName || "Homestay / Biệt thự nghỉ dưỡng"}</div>
          <div className="text-text-muted text-caption mt-0.5">
            {homestayAddress || "Quý khách đến trực tiếp cơ sở để nhận phòng. Quản gia sẽ đón tiếp và bàn giao chìa khóa."}
          </div>
        </div>

        <div>
          <label className="block text-caption font-bold text-foreground mb-1.5">
            Phương tiện di chuyển đến (để chuẩn bị chỗ đỗ xe)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TRANSIT_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = transitMethod === opt.key
              return (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => onTransitChange(active ? "" : opt.key)}
                  className={`p-2.5 rounded-lg border text-caption font-bold flex items-center gap-2 transition text-left ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon size={16} />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. GHI CHÚ CHO QUẢN GIA / CHỦ NHÀ */}
      <div>
        <label htmlFor={`${uid}-specialRequests`} className="block text-caption font-bold text-foreground mb-1">
          Yêu cầu đặc biệt cho Quản gia / Chủ nhà
        </label>
        <textarea
          id={`${uid}-specialRequests`}
          rows={3}
          maxLength={500}
          value={specialRequests}
          onChange={(e) => onSpecialRequestsChange(e.target.value)}
          placeholder="VD: Gia đình có trẻ nhỏ cần kê thêm đệm phụ; cần mượn bếp nướng than BBQ ngoài trời; check-in muộn sau 20:00..."
          className={`${inputClassName} h-auto py-2 resize-none text-body-sm`}
        />
        <div className="flex items-center gap-1.5 text-caption text-text-muted mt-1.5">
          <CheckCircle2 size={13} className="text-success shrink-0" />
          <span>Chủ nhà luôn hỗ trợ và chuẩn bị chu đáo trước giờ đón tiếp.</span>
        </div>
      </div>
    </div>
  )
}
