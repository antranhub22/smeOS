"use client"

import React from "react"
import { ORDER_FIELD_MAX } from "@/modules/greeting-card/domain/greeting-card-rules"
import { DELIVERY_NOTE_MAX, MAP_URL_MAX } from "@/modules/greeting-card/domain/delivery-note"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { useI18n } from "@/lib/i18n"

export interface OrderNotesValue {
  cardMessage: string
  senderNote: string
  deliveryNote: string
  mapUrl: string
}

const LABEL = "block text-body-sm font-bold text-foreground mb-1"

function getCardPlaceholder(industryKey: string | null | undefined, isEn: boolean): string {
  if (isEn) {
    return "e.g., Happy Birthday to the most wonderful person! Wishing you all the best..."
  }
  switch (industryKey) {
    case "FASHION":
      return "VD: Lời nhắn gửi kèm trang phục, yêu cầu ghi chú thẻ cảm ơn..."
    case "HOMESTAY":
      return "VD: Giờ check-in dự kiến, yêu cầu chuẩn bị phòng đón tiếp..."
    case "FNB":
      return "VD: Lời chúc mừng sinh nhật tiệc, khẩu vị ít đường / không đá..."
    case "CRAFT_GIFT":
      return "VD: Lời chúc gửi kèm tác phẩm thủ công, thông điệp người tặng..."
    case "SERVICES":
      return "VD: Yêu cầu đặc biệt về chuyên viên hoặc thời gian liệu trình..."
    case "RETAIL_GENERAL":
      return "VD: Lời nhắn gửi người nhận, ghi chú đóng gói quà tặng..."
    case "FLORAL":
    default:
      return "VD: Chúc mừng ngày 20/10 người phụ nữ tuyệt vời của anh..."
  }
}

/**
 * Ba loại ghi chú tách riêng để không lẫn: lời nhắn in lên thiệp/thẻ bài (người nhận đọc), ghi chú cho
 * cửa hàng / thợ gia công, ghi chú cho người giao hàng (+ link Google Maps nếu khách có).
 */
export function OrderNotesFields({
  idPrefix,
  value,
  inputClassName,
  industryKey,
  onChange,
}: {
  idPrefix: string
  value: OrderNotesValue
  inputClassName: string
  industryKey?: string | null | undefined
  onChange: (patch: Partial<OrderNotesValue>) => void
}) {
  const { t, locale } = useI18n()
  const isEn = locale === "en"
  const terms = getIndustryTerminology(industryKey)
  const id = (k: keyof OrderNotesValue) => `${idPrefix}-${k}`
  const cardLength = value.cardMessage.length
  const cardLabel = isEn
    ? "Greeting Card Message / Card Note"
    : terms.printablesTitle
    ? `${terms.printablesTitle} / Lời nhắn`
    : "Nội dung thiệp mừng / băng rôn"
  const cardPlaceholder = getCardPlaceholder(industryKey, isEn)
  const makerNoteLabel = isEn
    ? "Notes for Artisan Workshop"
    : terms.makerTitle
    ? `Ghi chú cho bộ phận gia công / ${terms.makerTitle.toLowerCase()}`
    : "Ghi chú cho xưởng / bộ phận gia công"

  return (
    <>
      <div>
        <label htmlFor={id("cardMessage")} className={LABEL}>
          {cardLabel}
        </label>
        <textarea
          rows={2}
          placeholder={cardPlaceholder}
          value={value.cardMessage}
          maxLength={ORDER_FIELD_MAX.cardMessage}
          id={id("cardMessage")}
          aria-describedby={`${id("cardMessage")}-count`}
          onChange={(e) => onChange({ cardMessage: e.target.value })}
          className={`${inputClassName} h-auto p-3 resize-none`}
        />
        <p
          id={`${id("cardMessage")}-count`}
          aria-live="polite"
          className={`mt-1 text-right text-caption ${cardLength >= ORDER_FIELD_MAX.cardMessage ? "text-warning font-bold" : "text-text-muted"}`}
        >
          {cardLength}/{ORDER_FIELD_MAX.cardMessage} {isEn ? "chars" : "ký tự"}
        </p>
      </div>

      <div>
        <label htmlFor={id("senderNote")} className={LABEL}>
          {makerNoteLabel}
        </label>
        <input
          type="text"
          placeholder={isEn ? "e.g., Special packaging, design notes or accessories" : "VD: Lưu ý quy cách, đóng gói hoặc chi tiết phụ kiện"}
          value={value.senderNote}
          maxLength={ORDER_FIELD_MAX.senderNote}
          id={id("senderNote")}
          onChange={(e) => onChange({ senderNote: e.target.value })}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor={id("deliveryNote")} className={LABEL}>
          {isEn ? "Instructions for Courier / Delivery" : "Ghi chú cho người giao hàng"}
        </label>
        <input
          type="text"
          placeholder={isEn ? "e.g., Call 15 mins prior, leave with reception if absent" : "VD: Gọi trước 15 phút, người nhận vắng thì gửi bảo vệ"}
          value={value.deliveryNote}
          maxLength={DELIVERY_NOTE_MAX}
          id={id("deliveryNote")}
          onChange={(e) => onChange({ deliveryNote: e.target.value })}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor={id("mapUrl")} className={LABEL}>
          {isEn ? "Google Maps Location Link (optional)" : "Link vị trí trên Google Maps (nếu có)"}
        </label>
        <input
          type="url"
          inputMode="url"
          placeholder={isEn ? "Open Google Maps → Share → Copy Link" : "Mở Google Maps → Chia sẻ → Sao chép đường liên kết"}
          value={value.mapUrl}
          maxLength={MAP_URL_MAX}
          id={id("mapUrl")}
          onChange={(e) => onChange({ mapUrl: e.target.value })}
          className={inputClassName}
        />
        <p className="mt-1 text-caption text-text-muted">
          {isEn
            ? "Helps courier locate address faster, especially for alleys or newly developed zones."
            : "Giúp người giao tìm đúng chỗ nhanh hơn, nhất là địa chỉ trong hẻm hoặc khu mới."}
        </p>
      </div>
    </>
  )
}
