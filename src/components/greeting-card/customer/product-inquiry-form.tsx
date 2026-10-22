"use client"

import React, { useState } from "react"
import { defaultInquiryMessage, INQUIRY_MESSAGE_MAX } from "@/modules/crm/domain/product-inquiry"
import { readApiError } from "@/components/greeting-card/api-error"

interface Props {
  catalogId: string
  product: { id: string; name: string }
  variantName?: string | null | undefined
}

const FIELD = "w-full rounded-lg border border-border bg-background px-3 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"

/** Form nhắn tin cho cửa hàng → yêu cầu tư vấn trong mục Hội thoại / Khách hàng của tiệm. */
export function ProductInquiryForm({ catalogId, product, variantName }: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState(() => defaultInquiryMessage(product.name, variantName))
  const [website, setWebsite] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <p role="status" className="rounded-xl bg-success-bg px-3 py-3 text-body-sm text-success">
        Cửa hàng đã nhận tin nhắn của bạn và sẽ liên hệ lại qua số {phone} sớm nhất.
      </p>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrors({})
    try {
      const res = await fetch(`/api/v1/public/greeting-catalog/${catalogId}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, customerName: name, customerPhone: phone, message, website, ...(variantName ? { variantName } : {}) }),
      })
      if (res.ok) return setSent(true)
      // Lỗi theo trường (400) hiện dưới từng ô; lỗi khác (gửi dồn, mẫu không còn) hiện chung
      const body = (await res.clone().json().catch(() => null)) as { error?: { details?: Record<string, string> } } | null
      const details = body?.error?.details
      setErrors(details && Object.keys(details).length > 0 ? details : { form: await readApiError(res, "Chưa gửi được, vui lòng thử lại.") })
    } catch {
      setErrors({ form: "Mạng không ổn định, vui lòng thử lại." })
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-border p-3" noValidate>
      <label className="flex flex-col gap-1">
        <span className="text-caption font-bold text-foreground">Tên của bạn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${FIELD} h-10`} />
        {errors.customerName && <span className="text-caption text-danger">{errors.customerName}</span>}
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-caption font-bold text-foreground">Số điện thoại</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className={`${FIELD} h-10`} />
        {errors.customerPhone && <span className="text-caption text-danger">{errors.customerPhone}</span>}
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-caption font-bold text-foreground">Bạn cần tư vấn gì?</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={INQUIRY_MESSAGE_MAX} rows={3} className={`${FIELD} py-2`} />
        {errors.message && <span className="text-caption text-danger">{errors.message}</span>}
      </label>
      {/* Ô bẫy: người thật không thấy, máy tự điền */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" />
      {errors.form && <span className="text-caption text-danger">{errors.form}</span>}
      <button type="submit" disabled={sending} className="h-11 rounded-xl bg-primary font-bold text-white disabled:opacity-50">
        {sending ? "Đang gửi…" : "Gửi tin nhắn"}
      </button>
    </form>
  )
}
