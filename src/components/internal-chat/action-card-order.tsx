"use client"

import React, { useState } from "react"
import type { ActionCardOrderPayload } from "@/modules/internal-chat/domain/chat-entities"
import { CheckCircle2, XCircle, Clock, MapPin, DollarSign, Package } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    <Card className="p-4 max-w-sm text-text" variant="default">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
        <span className="text-caption font-semibold text-primary bg-primary-subtle px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
          <Package className="w-3.5 h-3.5" /> Lệnh gia công #{payload.orderCode}
        </span>
        <span
          className={`text-caption font-medium px-2 py-0.5 rounded-full ${
            isPending
              ? "bg-warning-subtle text-warning-text border border-warning/20"
              : isAccepted
              ? "bg-success-subtle text-success border border-success/20"
              : "bg-surface-muted text-text-muted"
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
            className="w-16 h-16 object-cover rounded-lg border border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-surface-muted rounded-lg flex items-center justify-center text-text-muted text-caption shrink-0">
            Không ảnh
          </div>
        )}
        <div className="text-caption space-y-1 overflow-hidden">
          {payload.deliveryTime && (
            <div className="flex items-center gap-1.5 text-text-muted truncate">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Giao: {new Date(payload.deliveryTime).toLocaleString("vi-VN")}</span>
            </div>
          )}
          {payload.deliveryAddress && (
            <div className="flex items-center gap-1.5 text-text-muted truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{payload.deliveryAddress}</span>
            </div>
          )}
          {payload.priceVnd !== undefined && (
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>{payload.priceVnd.toLocaleString("vi-VN")} đ</span>
            </div>
          )}
        </div>
      </div>

      {isPending && !isSender && (
        <div className="pt-2 border-t border-border">
          {!rejecting ? (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => handleAction("ACCEPT_ORDER")}
                disabled={loading}
                size="sm"
                className="flex-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Nhận đơn
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejecting(true)}
                disabled={loading}
              >
                Từ chối
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Lý do từ chối (bận việc, quá tải...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                inputSize="sm"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleAction("REJECT_ORDER")}
                  disabled={loading}
                  className="flex-1"
                >
                  Xác nhận từ chối
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejecting(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="pt-2 border-t border-border text-caption text-success flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đã tiếp nhận đơn hàng, đối tác đang xử lý
        </div>
      )}

      {isRejected && (
        <div className="pt-2 border-t border-border text-caption text-text-muted flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Đơn đã từ chối: {payload.rejectedReason || "Không nhận việc"}</span>
        </div>
      )}
    </Card>
  )
}
