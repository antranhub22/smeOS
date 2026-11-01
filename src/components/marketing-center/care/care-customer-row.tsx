"use client"

import React, { useState } from "react"
import { Copy, Check, Phone, MessageSquare, CheckCircle } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildCareCardShareText, type CareCardContent } from "@/modules/care-cards/domain/care-card"

interface CareCustomerRowProps {
  customer: {
    id: string
    code: string
    name: string
    phone: string
    metrics?: {
      tier: string
    }
    tier?: string
  }
  cardContent: CareCardContent
  storeName: string
  isSent: boolean
  onMarkSent: (customerId: string, channel: "ZALO" | "PHONE" | "SMS", outcome: string) => Promise<void>
}

export function CareCustomerRow({
  customer,
  cardContent,
  storeName,
  isSent,
  onMarkSent,
}: CareCustomerRowProps) {
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)

  const effectiveTier = customer.metrics?.tier || customer.tier || "NEW"

  const handleCopyPersonalized = async () => {
    const personalizedContent: CareCardContent = {
      ...cardContent,
      recipientName: customer.name,
    }
    const text = buildCareCardShareText(personalizedContent, storeName)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleSend = async (channel: "ZALO" | "PHONE" | "SMS") => {
    setSending(true)
    try {
      await onMarkSent(customer.id, channel, `Đã gửi thủ công qua ${channel}`)
    } finally {
      setSending(false)
    }
  }

  const cleanPhone = customer.phone.replace(/\D/g, "")

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isSent ? "bg-surface-alt/40 border-border/60 opacity-80" : "bg-surface border-border hover:border-primary/40 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-body-sm shrink-0">
          {customer.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text text-body-sm truncate">{customer.name}</span>
            <Badge tone="neutral">
              {effectiveTier}
            </Badge>
            {isSent && (
              <span className="inline-flex items-center gap-1 text-caption text-primary font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Đã gửi
              </span>
            )}
          </div>
          <p className="text-caption text-text-muted font-mono">{customer.phone} · {customer.code}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyPersonalized}
          className="flex items-center gap-1 text-caption h-8 px-2.5"
          title="Sao chép lời nhắn kèm tên khách"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Đã chép" : "Chép tin"}</span>
        </Button>

        {cleanPhone && (
          <a
            href={`https://zalo.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-caption h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-text transition-colors font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>Mở Zalo</span>
          </a>
        )}

        {cleanPhone && (
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-1 text-caption h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-text transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>Gọi</span>
          </a>
        )}

        {!isSent && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={sending}
            onClick={() => handleSend("ZALO")}
            className="h-8 px-3 text-caption font-semibold"
          >
            {sending ? "Đang lưu..." : "Đánh dấu đã gửi"}
          </Button>
        )}
      </div>
    </div>
  )
}
