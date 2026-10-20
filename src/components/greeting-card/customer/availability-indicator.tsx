"use client"

import React from "react"
import { CheckCircle2, AlertCircle, CalendarX, Sparkles, Loader2 } from "lucide-react"
import type { AvailabilityMode } from "@/modules/greeting-card/domain/product-availability-config"

interface AvailabilityIndicatorProps {
  available: boolean | null
  mode?: AvailabilityMode | null | undefined
  message?: string | null | undefined
  nextAvailableDate?: string | null | undefined
  remainingQuantity?: number | null | undefined
  loading?: boolean | undefined
  onSelectDate?: ((date: string) => void) | undefined
}

export function AvailabilityIndicator({
  available,
  mode,
  message,
  nextAvailableDate,
  remainingQuantity,
  loading,
  onSelectDate,
}: AvailabilityIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-caption text-text-muted py-1" role="status">
        <Loader2 size={13} className="animate-spin text-primary" />
        <span>Đang kiểm tra tình trạng...</span>
      </div>
    )
  }

  if (available === null) {
    if (!message) return null
    return (
      <div className="flex items-center gap-1.5 text-caption text-text-muted py-1">
        <span>💡 {message}</span>
      </div>
    )
  }

  if (available === false) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-1.5 p-3 rounded-xl border border-danger/30 bg-danger/10 text-danger text-caption animate-in fade-in duration-200"
      >
        <div className="flex items-start gap-2">
          {mode === "BOOKING_CALENDAR" ? (
            <CalendarX size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-semibold leading-relaxed">
            {message || (mode === "BOOKING_CALENDAR" ? "Phòng đã có khách trong khoảng ngày này" : "Tạm hết hàng")}
          </div>
        </div>

        {nextAvailableDate && onSelectDate && (
          <div className="flex items-center justify-between pt-1 border-t border-danger/20">
            <span className="text-caption font-medium">Gợi ý ngày trống gần nhất:</span>
            <button
              type="button"
              onClick={() => onSelectDate(nextAvailableDate)}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition"
            >
              <Sparkles size={12} />
              {nextAvailableDate}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Cảnh báo sắp hết hàng
  if (remainingQuantity !== null && remainingQuantity !== undefined && remainingQuantity > 0 && remainingQuantity <= 3) {
    return (
      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-warning/30 bg-warning/10 text-warning text-caption font-medium">
        <AlertCircle size={14} className="shrink-0" />
        <span>Chỉ còn {remainingQuantity} sản phẩm trong kho</span>
      </div>
    )
  }

  // Xác nhận phòng còn trống (cho Homestay) hoặc khả dụng
  if (available === true) {
    const successText =
      message ||
      (mode === "BOOKING_CALENDAR"
        ? "Phòng còn trống, sẵn sàng nhận đặt phòng"
        : "Sản phẩm khả dụng, sẵn sàng tiếp nhận đơn")

    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-success/30 bg-success/10 text-success text-caption font-semibold animate-in fade-in duration-200">
        <CheckCircle2 size={16} className="shrink-0 text-success" />
        <span>{successText}</span>
      </div>
    )
  }

  return null
}
