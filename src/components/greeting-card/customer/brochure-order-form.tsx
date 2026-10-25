"use client"

import React, { useId, useState } from "react"
import { ArrowLeft, Send, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { ORDER_FIELD_MAX, MAX_DELIVERY_LEAD_DAYS } from "@/modules/greeting-card/domain/greeting-card-rules"
import type { ProductSnapshot, CustomerOrderSubmitInput } from "@/modules/greeting-card/domain/greeting-card-types"
import type { ShippingConfig } from "@/modules/greeting-card/domain/brochure-pricing"
import { BrochureOrderOptions } from "./brochure-order-options"
import { useBrochureQuote } from "./use-brochure-quote"
import { OrderReview } from "./order-review"
import { useOrderDraft } from "./use-order-draft"
import { useSavedState } from "./use-saved-state"
import { HoneypotField } from "./honeypot-field"
import { earliestDeliveryDate } from "@/modules/greeting-card/domain/delivery-schedule"
import { PromotionPicker } from "./promotion-picker"
import { customerChoosesPromotion } from "@/modules/greeting-card/domain/order-policies"
import { SelectedProductHeader } from "./selected-product-header"
import type { PublicAppliedPolicies } from "@/modules/greeting-card/domain/store-policy"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { HomestayOrderFields, calculateNights } from "./homestay-order-fields"
import { StandardOrderFields } from "./standard-order-fields"
import { useBrochureOrderSubmit } from "./use-brochure-order-submit"
import { useProductAvailability } from "./use-product-availability"

interface BrochureOrderFormProps {
  productSnapshot: ProductSnapshot
  variants: Array<{ id: string; name: string; priceVnd: number }>
  shipping: ShippingConfig
  appliedPolicies?: PublicAppliedPolicies | null | undefined
  quoteUrl: string
  quoteExtraBody?: Record<string, string> | undefined
  industryKey?: string | null | undefined
  onBack: () => void
  onSubmit: (input: CustomerOrderSubmitInput) => Promise<void>
}

const INPUT =
  "w-full min-w-0 h-11 px-3 rounded-lg border border-border bg-background text-title font-normal text-foreground placeholder:text-body placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20"

export function BrochureOrderForm({
  productSnapshot,
  variants,
  shipping,
  appliedPolicies,
  quoteUrl,
  quoteExtraBody = {},
  industryKey,
  onBack,
  onSubmit,
}: BrochureOrderFormProps) {
  const { locale } = useI18n()
  const isEn = locale === "en"
  const terms = getIndustryTerminology(industryKey)
  const isHomestay = industryKey === "HOMESTAY"
  const uid = useId()
  const {
    customerName, customerPhone, customerEmail, recipientName, recipientPhone, deliveryDate, deliveryTimeSlot, addressParts,
    cardMessage, senderNote, deliveryNote, mapUrl,
    setCustomerName, setCustomerPhone, setCustomerEmail, setRecipientName, setRecipientPhone, setDeliveryDate, setDeliveryTimeSlot, setAddressParts,
    setNotes, clearDraft,
  } = useOrderDraft()

  const [checkOutDate, setCheckOutDate] = useState(() => {
    if (!deliveryDate) return ""
    return new Date(new Date(`${deliveryDate}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10)
  })
  const [isSelfBooking, setIsSelfBooking] = useState(true)
  const [adultsCount, setAdultsCount] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)
  const [transitMethod, setTransitMethod] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")

  const [selectedPromotionId, setSelectedPromotionId] = useState<string>(
    appliedPolicies && !customerChoosesPromotion(appliedPolicies) ? appliedPolicies.promotions[0]?.id ?? "" : ""
  )
  const quoteBody = {
    ...quoteExtraBody,
    ...(selectedPromotionId ? { selectedPromotionId } : {}),
    ...(deliveryDate ? { deliveryDate } : {}),
  }
  const pricing = useBrochureQuote(quoteUrl, quoteBody, customerPhone, { id: productSnapshot.id, variantIds: variants.map((v) => v.id) })
  const availabilityUrl = quoteUrl ? quoteUrl.replace(/\/quote$/, "/check-availability") : null
  const availability = useProductAvailability(availabilityUrl, {
    productId: productSnapshot.id,
    industryKey,
    checkInDate: isHomestay ? deliveryDate : undefined,
    checkOutDate: isHomestay ? checkOutDate : undefined,
    deliveryDate: !isHomestay ? deliveryDate : undefined,
    deliveryTimeSlot,
    variantId: pricing.selection.variantId,
    quantity: pricing.selection.quantity,
  })
  const minDate = earliestDeliveryDate(shipping)
  const maxDate = new Date(Date.parse(`${minDate}T00:00:00Z`) + MAX_DELIVERY_LEAD_DAYS * 86_400_000).toISOString().slice(0, 10)
  const [review, setReview, clearReview] = useSavedState<CustomerOrderSubmitInput | null>(`order-review:${productSnapshot.id}`, null)
  const [website, setWebsite] = useState("")

  const { errorMessage, loading, setErrorMessage, handleSubmit, handleConfirm } = useBrochureOrderSubmit({
    isHomestay,
    industryKey,
    customerName,
    customerPhone,
    customerEmail,
    recipientName,
    recipientPhone,
    deliveryDate,
    deliveryTimeSlot,
    addressParts,
    cardMessage,
    senderNote,
    deliveryNote,
    mapUrl,
    website,
    checkOutDate,
    isSelfBooking,
    adultsCount,
    childrenCount,
    transitMethod,
    specialRequests,
    selectedPromotionId,
    appliedPolicies,
    shipping,
    pricingSelection: pricing.selection,
    pricingErrors: pricing.errors,
    onSetReview: setReview,
    onSubmit,
    onClearDraft: clearDraft,
    onClearReview: clearReview,
  })

  // Khi có lỗi, nếu người dùng bắt đầu sửa bất kỳ trường nào thì tự động xóa thông báo lỗi để không bị vướng mắt
  const onInputChange = <T,>(setter: (val: T) => void) => (val: T) => {
    if (errorMessage) setErrorMessage(null)
    setter(val)
  }

  if (review) {
    return (
      <div className="w-full max-w-lg mx-auto bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <OrderReview
          product={productSnapshot}
          variantName={variants.find((v) => v.id === review.variantId)?.name ?? null}
          input={review}
          quote={pricing.quote}
          appliedPolicies={appliedPolicies}
          industryKey={industryKey}
          submitting={loading}
          error={errorMessage}
          onEdit={() => setReview(null)}
          onConfirm={(agreed) => void handleConfirm(review, agreed)}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-text-muted hover:text-foreground text-caption"
        >
          <ArrowLeft size={16} />
          <span>{isEn ? "Change design" : `Đổi ${terms.sampleProduct.toLowerCase()}`}</span>
        </Button>
        <span className="text-caption font-bold uppercase tracking-wider text-primary">
          {isEn ? "Order Details" : `Điền đơn đặt ${terms.sampleProduct.toLowerCase()}`}
        </span>
      </div>

      <SelectedProductHeader product={productSnapshot} />

      {errorMessage && (
        <div
          id="order-form-error-banner"
          role="alert"
          className="mb-5 p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm flex items-start gap-2 animate-in fade-in duration-200"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-danger/70 hover:text-danger text-caption underline cursor-pointer shrink-0"
            aria-label="Đóng thông báo lỗi"
          >
            Đóng
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <HoneypotField value={website} onChange={setWebsite} />

        <BrochureOrderOptions
          variants={variants}
          basePrice={productSnapshot.price}
          shipping={shipping}
          selection={pricing.selection}
          onChange={pricing.update}
          quote={pricing.quote}
          errors={pricing.errors}
          loading={pricing.loading}
          industryKey={industryKey}
        />

        {appliedPolicies && (
          <PromotionPicker policies={appliedPolicies} value={selectedPromotionId} onChange={setSelectedPromotionId} />
        )}

        {/* Khối Người đặt (chung cho mọi ngành) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor={`${uid}-customerName`} className="block text-body-sm font-bold text-foreground mb-1">
              {isEn ? "Your Full Name" : "Họ tên của bạn"} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? "e.g., Alex Johnson" : "VD: Nguyễn Văn A"}
              value={customerName}
              maxLength={ORDER_FIELD_MAX.name}
              id={`${uid}-customerName`}
              autoComplete="name"
              onChange={(e) => onInputChange(setCustomerName)(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-customerPhone`} className="block text-body-sm font-bold text-foreground mb-1">
              {isEn ? "Your Phone Number" : "Số điện thoại của bạn"} <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder={isEn ? "e.g., 0901234567" : "VD: 0901234567"}
              value={customerPhone}
              maxLength={18}
              id={`${uid}-customerPhone`}
              autoComplete="tel"
              inputMode="tel"
              onChange={(e) => onInputChange(setCustomerPhone)(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-customerEmail`} className="block text-body-sm font-bold text-foreground mb-1">
              Email <span className="text-caption font-normal text-text-muted">{isEn ? "(optional)" : "(tùy chọn)"}</span>
            </label>
            <input
              type="email"
              placeholder={isEn ? "e.g., email@example.com" : "VD: email@example.com"}
              value={customerEmail}
              maxLength={100}
              id={`${uid}-customerEmail`}
              autoComplete="email"
              onChange={(e) => onInputChange(setCustomerEmail)(e.target.value)}
              className={INPUT}
            />
          </div>
        </div>

        {/* Chuyển đổi linh hoạt giữa giao diện Homestay và giao diện Giao hàng Tiêu chuẩn */}
        {isHomestay ? (
          <HomestayOrderFields
            idPrefix={uid}
            inputClassName={INPUT}
            checkInDate={deliveryDate}
            checkOutDate={checkOutDate}
            minDate={minDate}
            maxDate={maxDate}
            checkInTimeSlot={deliveryTimeSlot}
            customerName={customerName}
            customerPhone={customerPhone}
            recipientName={recipientName}
            recipientPhone={recipientPhone}
            isSelfBooking={isSelfBooking}
            adultsCount={adultsCount}
            childrenCount={childrenCount}
            transitMethod={transitMethod}
            specialRequests={specialRequests}
            homestayAddress={undefined}
            homestayName={terms.sampleProduct}
            onCheckInChange={(d) => {
              setDeliveryDate(d)
              const n = calculateNights(d, checkOutDate)
              pricing.update({ quantity: n })
            }}
            onCheckOutChange={(d) => {
              setCheckOutDate(d)
              const n = calculateNights(deliveryDate, d)
              pricing.update({ quantity: n })
            }}
            onTimeSlotChange={setDeliveryTimeSlot}
            onRecipientNameChange={setRecipientName}
            onRecipientPhoneChange={setRecipientPhone}
            onSelfBookingToggle={setIsSelfBooking}
            onAdultsChange={setAdultsCount}
            onChildrenChange={setChildrenCount}
            onTransitChange={setTransitMethod}
            onSpecialRequestsChange={setSpecialRequests}
            availability={availability}
          />
        ) : (
          <StandardOrderFields
            idPrefix={uid}
            inputClassName={INPUT}
            industryKey={industryKey}
            recipientName={recipientName}
            recipientPhone={recipientPhone}
            deliveryDate={deliveryDate}
            deliveryTimeSlot={deliveryTimeSlot}
            minDate={minDate}
            maxDate={maxDate}
            shipping={shipping}
            fullSlots={pricing.fullSlots}
            addressParts={addressParts}
            cardMessage={cardMessage}
            senderNote={senderNote}
            deliveryNote={deliveryNote}
            mapUrl={mapUrl}
            availability={availability}
            onRecipientNameChange={onInputChange(setRecipientName)}
            onRecipientPhoneChange={onInputChange(setRecipientPhone)}
            onDeliveryDateChange={onInputChange(setDeliveryDate)}
            onDeliveryTimeSlotChange={onInputChange(setDeliveryTimeSlot)}
            onAddressPartsChange={onInputChange(setAddressParts)}
            onNotesChange={onInputChange(setNotes)}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || availability.available === false}
          className="mt-2 w-full h-12 bg-primary hover:bg-primary-dark text-white font-extrabold text-body flex items-center justify-center gap-2 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} aria-hidden="true" />
          <span>
            {loading
              ? (isEn ? "Submitting order..." : "Đang gửi đơn...")
              : availability.available === false
              ? (availability.message || (isEn ? "Currently unavailable" : "Tạm không khả dụng"))
              : isHomestay
              ? (isEn ? "Review Booking Details" : "Xem lại thông tin đặt phòng")
              : (isEn ? "Review Order" : "Xem lại đơn")}
          </span>
        </Button>
      </form>
    </div>
  )
}
