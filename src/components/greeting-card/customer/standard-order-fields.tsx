"use client"

import React from "react"
import { ORDER_FIELD_MAX } from "@/modules/greeting-card/domain/greeting-card-rules"
import type { ShippingConfig } from "@/modules/greeting-card/domain/brochure-pricing"
import type { AddressParts } from "@/modules/greeting-card/domain/delivery-address"
import { ViDateInput } from "./vi-date-input"
import { DeliveryTimePicker } from "./delivery-time-picker"
import { AddressFields } from "./address-fields"
import { OrderNotesFields } from "./order-notes-fields"

import { AvailabilityIndicator } from "./availability-indicator"
import type { HomestayAvailabilityState } from "./homestay-order-fields"

import type { OrderNotesValue } from "./order-notes-fields"

interface StandardOrderFieldsProps {
  idPrefix: string
  inputClassName: string
  industryKey?: string | null | undefined
  recipientName: string
  recipientPhone: string
  deliveryDate: string
  deliveryTimeSlot: string
  minDate: string
  maxDate: string
  shipping: ShippingConfig
  fullSlots?: readonly string[] | undefined
  addressParts: AddressParts
  cardMessage?: string | undefined
  senderNote?: string | undefined
  deliveryNote?: string | undefined
  mapUrl?: string | undefined
  availability?: HomestayAvailabilityState | undefined
  onRecipientNameChange: (val: string) => void
  onRecipientPhoneChange: (val: string) => void
  onDeliveryDateChange: (val: string) => void
  onDeliveryTimeSlotChange: (val: string) => void
  onAddressPartsChange: (val: AddressParts) => void
  onNotesChange: (patch: Partial<OrderNotesValue>) => void
}

export function StandardOrderFields({
  idPrefix,
  inputClassName,
  industryKey,
  recipientName,
  recipientPhone,
  deliveryDate,
  deliveryTimeSlot,
  minDate,
  maxDate,
  shipping,
  fullSlots,
  addressParts,
  cardMessage,
  senderNote,
  deliveryNote,
  mapUrl,
  availability,
  onRecipientNameChange,
  onRecipientPhoneChange,
  onDeliveryDateChange,
  onDeliveryTimeSlotChange,
  onAddressPartsChange,
  onNotesChange,
}: StandardOrderFieldsProps) {
  const isFloral = !industryKey || industryKey === "FLORAL"
  const recipientLabel = isFloral ? "người nhận hoa" : "người nhận hàng"
  const dateLabel = isFloral ? "Ngày giao hoa" : "Ngày nhận hàng"

  return (
    <div className="flex flex-col gap-4">
      {/* Người nhận */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-recipientName`} className="block text-body-sm font-bold text-foreground mb-1">
            Họ tên {recipientLabel} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: Trần Thị B"
            value={recipientName}
            maxLength={ORDER_FIELD_MAX.name}
            id={`${idPrefix}-recipientName`}
            autoComplete="off"
            onChange={(e) => onRecipientNameChange(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-recipientPhone`} className="block text-body-sm font-bold text-foreground mb-1">
            Số điện thoại người nhận <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="VD: 0912345678"
            value={recipientPhone}
            maxLength={15}
            id={`${idPrefix}-recipientPhone`}
            autoComplete="off"
            inputMode="tel"
            onChange={(e) => onRecipientPhoneChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Ngày & Giờ giao */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-deliveryDate`} className="block text-body-sm font-bold text-foreground mb-1">
            {dateLabel} <span className="text-danger">*</span>
          </label>
          <ViDateInput
            id={`${idPrefix}-deliveryDate`}
            required
            min={minDate}
            max={maxDate}
            value={deliveryDate}
            onChange={onDeliveryDateChange}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-deliveryTimeSlot`} className="block text-body-sm font-bold text-foreground mb-1">
            Khung giờ mong muốn
          </label>
          <DeliveryTimePicker
            id={`${idPrefix}-deliveryTimeSlot`}
            date={deliveryDate}
            value={deliveryTimeSlot}
            shipping={shipping}
            fullSlots={fullSlots ?? []}
            inputClassName={inputClassName}
            onChange={onDeliveryTimeSlotChange}
          />
        </div>
      </div>

      {availability && (
        <AvailabilityIndicator
          available={availability.available}
          mode={availability.mode}
          message={availability.message}
          nextAvailableDate={availability.nextAvailableDate}
          remainingQuantity={availability.remainingQuantity}
          loading={availability.loading}
          onSelectDate={onDeliveryDateChange}
        />
      )}

      <AddressFields idPrefix={idPrefix} value={addressParts} inputClassName={inputClassName} onChange={onAddressPartsChange} />

      <OrderNotesFields
        idPrefix={idPrefix}
        value={{
          cardMessage: cardMessage ?? "",
          senderNote: senderNote ?? "",
          deliveryNote: deliveryNote ?? "",
          mapUrl: mapUrl ?? "",
        }}
        inputClassName={inputClassName}
        industryKey={industryKey}
        onChange={onNotesChange}
      />
    </div>
  )
}
