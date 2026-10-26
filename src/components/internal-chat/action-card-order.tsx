"use client"

import React, { useState } from "react"
import type { ActionCardOrderPayload } from "@/modules/internal-chat/domain/chat-entities"
import { CheckCircle2, XCircle, Clock, MapPin, DollarSign, Package } from "lucide-react"

interface ActionCardOrderProps {
  messageId: string
  payload: ActionCardOrderPayload
  isSender: boolean
  onActionComplete?: () => void
}

export function ActionCardOrder({
  messageId,
  payload,
  isSender,
  onActionComplete,
}: ActionCardOrderProps) {
  const [loading, setLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleAction = async (action: "ACCEPT_ORDER" | "REJECT_ORDER") => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/internal-chat/messages/${messageId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectedReason: action === "REJECT_ORDER" ? rejectReason : undefined,
        }),
      })
      if (res.ok) {
        onActionComplete?.()
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false)
      setRejecting(false)
    }
  }

  const isPending = payload.status === "PENDING_ACCEPT"
  const isAccepted = payload.status === "ACCEPTED" || payload.status === "IN_PROGRESS" || payload.status === "COMPLETED"
  const isRejected = payload.status === "REJECTED"

  return (
    <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm max-w-sm text-neutral-800">
      <div className="flex items-center justify-between border-b border-rose-50 pb-2 mb-3">
        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Package className="w-3.5 h-3.5" /> Lệnh gia công #{payload.orderCode}
        </span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            isPending
              ? "bg-amber-100 text-amber-700"
              : isAccepted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {isPending ? "Chờ phản hồi" : isAccepted ? "Đã nhận đơn" : "Đã từ chối"}
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        {payload.thumbnailUrl ? (
          <img
            src={payload.thumbnailUrl}
            alt={payload.orderCode}
            className="w-16 h-16 object-cover rounded-lg border border-neutral-100 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-xs shrink-0">
            Không ảnh
          </div>
        )}
        <div className="text-xs space-y-1 overflow-hidden">
          {payload.deliveryTime && (
            <div className="flex items-center gap-1.5 text-neutral-600 truncate">
              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Giao: {new Date(payload.deliveryTime).toLocaleString("vi-VN")}</span>
            </div>
          )}
          {payload.deliveryAddress && (
            <div className="flex items-center gap-1.5 text-neutral-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{payload.deliveryAddress}</span>
            </div>
          )}
          {payload.priceVnd !== undefined && (
            <div className="flex items-center gap-1.5 font-semibold text-rose-700">
              <DollarSign className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{payload.priceVnd.toLocaleString("vi-VN")} đ</span>
            </div>
          )}
        </div>
      </div>

      {isPending && !isSender && (
        <div className="pt-2 border-t border-neutral-100">
          {!rejecting ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAction("ACCEPT_ORDER")}
                disabled={loading}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Nhận đơn
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg text-xs font-medium transition-colors"
              >
                Từ chối
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Lý do từ chối (bận việc, quá tải...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAction("REJECT_ORDER")}
                  disabled={loading}
                  className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                >
                  Xác nhận từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-2 py-1 text-xs text-neutral-500 hover:underline"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="pt-2 border-t border-neutral-100 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đã tiếp nhận đơn hàng, đối tác đang xử lý
        </div>
      )}

      {isRejected && (
        <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
          <span>Đơn đã từ chối: {payload.rejectedReason || "Không nhận việc"}</span>
        </div>
      )}
    </div>
  )
}
