"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/i18n/formatters"
import type { PublicChatLimits } from "@/modules/chat-assistant/domain/public-chat-policy"
import {
  PUBLIC_CHAT_LIMIT_TIERS,
  canRequestLimits,
  type PendingPublicChatLimitRequest,
} from "@/modules/chat-assistant/domain/public-chat-limit-request"

interface LimitStatus {
  current: PublicChatLimits
  pending: PendingPublicChatLimitRequest | null
}

/** Hạn mức tin nhắn của khung chat AI trên trang công khai; nâng mức cần Admin nền tảng duyệt. */
export function PublicChatLimitRequest() {
  const [status, setStatus] = useState<LimitStatus | null>(null)
  const [tierIndex, setTierIndex] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch("/api/v1/chat/public-limits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LimitStatus | null) => setStatus(data))
      .catch(() => setStatus(null))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu từ API khi mount; setState nằm trong hàm tải (nợ #149)
    load()
  }, [load])

  if (!status) return null
  const { current, pending } = status
  const options = PUBLIC_CHAT_LIMIT_TIERS.map((t, i) => ({ ...t, i })).filter((t) =>
    canRequestLimits(current, t.perVisitor, t.perIp),
  )

  async function submit() {
    if (tierIndex === null) return
    const tier = PUBLIC_CHAT_LIMIT_TIERS[tierIndex]
    if (!tier) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/chat/public-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perVisitor: tier.perVisitor, perIp: tier.perIp, note: note || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error?.message || "Chưa gửi được yêu cầu, vui lòng thử lại")
      } else {
        setTierIndex(null)
        setNote("")
        load()
      }
    } catch {
      setError("Lỗi kết nối máy chủ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <p className="text-xs font-semibold text-foreground">Giới hạn tin nhắn chống spam</p>
      <p className="text-caption text-text-muted">
        Mỗi khách tối đa {current.perVisitor} tin, mỗi địa chỉ mạng tối đa {current.perIp} tin trong 10 phút.
      </p>

      {pending ? (
        <p className="text-caption text-text-muted">
          Đang chờ duyệt nâng lên {pending.per_visitor} tin/khách · {pending.per_ip} tin/địa chỉ mạng (gửi lúc{" "}
          {formatDateTime(pending.requested_at)}).
        </p>
      ) : options.length === 0 ? (
        <p className="text-caption text-text-muted">Tiệm đang ở mức cao nhất.</p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-caption text-text-muted">Cần nhiều hơn? Chọn mức và gửi yêu cầu để được duyệt:</legend>
          {options.map((t) => (
            <label key={t.i} className="flex items-center gap-2 text-caption text-foreground">
              <input
                type="radio"
                name="public-chat-limit-tier"
                className="accent-primary"
                checked={tierIndex === t.i}
                onChange={() => setTierIndex(t.i)}
              />
              {t.perVisitor} tin/khách · {t.perIp} tin/địa chỉ mạng
            </label>
          ))}
          <label className="block text-caption text-text-muted">
            Lý do (không bắt buộc)
            <input
              type="text"
              value={note}
              maxLength={500}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground"
            />
          </label>
          <Button size="sm" className="h-8 text-xs" disabled={tierIndex === null || busy} onClick={submit}>
            {busy ? "Đang gửi…" : "Gửi yêu cầu nâng hạn mức"}
          </Button>
        </fieldset>
      )}
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  )
}
