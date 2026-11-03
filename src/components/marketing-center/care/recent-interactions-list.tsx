"use client"

import React, { useState, useEffect } from "react"
import { History, MessageSquare, Phone, Mail, Clock } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/i18n/formatters"

interface CustomerInteractionItem {
  id: string
  customerId: string
  channel: string
  direction: string
  summary: string
  outcome: string | null
  occurredAt: string
  createdAt: string
}

export function RecentInteractionsList() {
  const [interactions, setInteractions] = useState<CustomerInteractionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/customer-interactions?limit=15")
        if (res.ok) {
          const data = await res.json()
          setInteractions(data.data || [])
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-caption text-text-muted">Đang nạp nhật ký...</div>
  }

  if (interactions.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted rounded-xl bg-surface-alt/40 border border-dashed border-border text-caption">
        Chưa có lượt tương tác chăm sóc nào được ghi nhận.
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {interactions.map((item) => (
        <div
          key={item.id}
          className="p-3.5 rounded-xl border border-border bg-surface flex items-start justify-between gap-3 text-body-sm"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-surface-alt text-primary shrink-0 mt-0.5">
              {item.channel === "ZALO" ? (
                <MessageSquare className="w-4 h-4" />
              ) : item.channel === "PHONE" ? (
                <Phone className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text truncate">{item.summary}</p>
              {item.outcome && (
                <p className="text-caption text-text-muted mt-0.5">{item.outcome}</p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-caption text-text-muted flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {formatDateTime(item.occurredAt || item.createdAt)}
            </span>
            <Badge tone="neutral" className="mt-1">
              {item.channel}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
