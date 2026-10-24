"use client"

import React from "react"
import { StorePaymentMethodsEditor } from "@/components/profiles/store-payment-methods-editor"

/**
 * Thiết lập cơ chế nhận thanh toán & tài khoản nhận tiền của TIỆM.
 * Đồng bộ lưu ở `organizations.settings.brochure_payment`.
 */
export function BrochurePaymentSettings() {
  return <StorePaymentMethodsEditor />
}
