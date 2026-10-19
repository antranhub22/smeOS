"use client"

import React, { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatGraceCountdown,
  getGraceSecondsRemaining,
  type SubcontractDispatchStatus,
} from "@/modules/greeting-card/domain/subcontract-order"

export interface SubcontractCardProduct {
  name: string
  imageUrl?: string | null
  bomItems?: Array<{ name: string; quantity: number; unit: string; role?: string }>
}

export interface SubcontractClaimCardProps {
  orderCode: string
  branchId: string
  branchName: string
  product: SubcontractCardProduct
  deliveryAddress: string
  deliveryTime: string
  cardMessage?: string | null | undefined
  specialNotes?: string | null | undefined
  subcontractPriceVnd: number
  dispatchStatus: SubcontractDispatchStatus
  claimedByBranchId?: string | null | undefined
  claimedBranchName?: string | null | undefined
  graceExpiresAt?: string | null | undefined
  onClaim: () => Promise<void>
  onCancelClaim: () => Promise<void>
  onCommitEarly?: (() => Promise<void>) | undefined
}

export function SubcontractClaimCard({
  orderCode,
  branchId,
  branchName,
  product,
  deliveryAddress,
  deliveryTime,
  cardMessage,
  specialNotes,
  subcontractPriceVnd,
  dispatchStatus,
  claimedByBranchId,
  claimedBranchName,
  graceExpiresAt,
  onClaim,
  onCancelClaim,
  onCommitEarly,
}: SubcontractClaimCardProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [graceSeconds, setGraceSeconds] = useState(() =>
    getGraceSecondsRemaining(graceExpiresAt ?? null)
  )

  const isMyClaim = claimedByBranchId === branchId
  const isClaimedByOther =
    (dispatchStatus === "CLAIMED_GRACE" || dispatchStatus === "COMMITTED") && !isMyClaim

  useEffect(() => {
    if (dispatchStatus !== "CLAIMED_GRACE" || !graceExpiresAt) return

    const timer = setInterval(() => {
      const remaining = getGraceSecondsRemaining(graceExpiresAt)
      setGraceSeconds(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [dispatchStatus, graceExpiresAt])

  async function handleClaim() {
    setLoading(true)
    setErrorMsg(null)
    try {
      await onClaim()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tiếp nhận đơn")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!window.confirm("Bạn có chắc chắn muốn hủy nhận đơn này để nhường cho chi nhánh khác?")) {
      return
    }
    setLoading(true)
    setErrorMsg(null)
    try {
      await onCancelClaim()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi hủy đơn")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-surface rounded-2xl border border-border shadow-md overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
        <div>
          <span className="text-caption font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <Sparkles size={13} /> Thẻ Gia Công Đơn Hàng Chuỗi
          </span>
          <h2 className="text-title font-extrabold text-foreground">
            Đơn hàng #{orderCode}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-caption text-text-muted block">Thù lao gia công</span>
          <span className="text-title font-black text-primary">
            {subcontractPriceVnd.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Trạng thái đơn bị chi nhánh khác nhận */}
        {isClaimedByOther && (
          <div className="p-4 rounded-xl bg-surface-muted border border-border text-center flex flex-col items-center gap-2">
            <CheckCircle2 size={32} className="text-text-muted" />
            <h4 className="text-body font-bold text-foreground">
              Đơn hàng đã được tiếp nhận
            </h4>
            <p className="text-caption text-text-muted max-w-xs">
              Đơn hàng này đã được {claimedBranchName ? `Chi nhánh ${claimedBranchName}` : "chi nhánh khác"} tiếp nhận gia công. Rất cảm ơn bạn đã quan tâm!
            </p>
          </div>
        )}

        {/* Trạng thái chi nhánh hiện tại đang trong Grace Period */}
        {dispatchStatus === "CLAIMED_GRACE" && isMyClaim && (
          <div className="p-4 rounded-xl bg-warning-bg border border-warning/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-bold text-warning flex items-center gap-1.5">
                <Clock size={16} /> Thời gian kiểm tra kho hoa & nguyên liệu:
              </span>
              <span className="font-mono text-title font-black text-warning">
                {formatGraceCountdown(graceSeconds)}
              </span>
            </div>
            <p className="text-caption text-text-muted">
              Vui lòng đối chiếu với kho thực tế. Nếu không đủ hoa/phụ liệu, bạn có quyền bấm hủy trong thời gian này để nhường cho chi nhánh khác.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                disabled={loading || graceSeconds <= 0}
                onClick={handleCancel}
                className="flex-1 text-danger hover:bg-danger-bg text-caption font-bold h-10 border-danger/40"
              >
                <XCircle size={15} className="mr-1" /> Hủy nhận (Kho thiếu hoa)
              </Button>
              {onCommitEarly && (
                <Button
                  variant="secondary"
                  disabled={loading}
                  onClick={onCommitEarly}
                  className="flex-1 text-caption font-bold h-10"
                >
                  <ShieldCheck size={15} className="mr-1" /> Xác nhận đủ & Làm ngay
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết sản phẩm & Định mức nguyên vật liệu */}
        <div className="bg-surface-muted rounded-xl p-3.5 border border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-caption text-text-muted block">Mẫu sản phẩm</span>
              <h3 className="text-body font-bold text-foreground truncate">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Danh mục nguyên liệu BOM */}
          {product.bomItems && product.bomItems.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-caption font-bold text-foreground flex items-center gap-1 mb-1.5">
                <Layers size={13} className="text-primary" /> Định lượng nguyên vật liệu cần có:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-caption">
                {product.bomItems.map((item, idx) => (
                  <div key={idx} className="bg-surface p-1.5 rounded border border-border flex justify-between">
                    <span className="text-foreground truncate">{item.name}</span>
                    <span className="font-bold text-primary whitespace-nowrap ml-1">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Địa chỉ & Thời gian giao */}
        <div className="flex flex-col gap-2 text-body-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-caption text-text-muted block">Địa chỉ giao hàng:</span>
              <span className="text-foreground font-semibold">{deliveryAddress}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-caption text-text-muted block">Thời gian cần giao:</span>
              <span className="text-foreground font-semibold">{deliveryTime}</span>
            </div>
          </div>

          {cardMessage && (
            <div className="p-2.5 rounded-lg bg-surface-muted border border-border text-caption">
              <span className="font-bold text-foreground block mb-0.5">Lời chúc thiệp:</span>
              <span className="italic text-text-muted">&ldquo;{cardMessage}&rdquo;</span>
            </div>
          )}

          {specialNotes && (
            <div className="p-2.5 rounded-lg bg-warning-bg/50 border border-warning/20 text-caption">
              <span className="font-bold text-warning block mb-0.5">Ghi chú đặc biệt:</span>
              <span className="text-foreground">{specialNotes}</span>
            </div>
          )}
        </div>

        {/* Tác vụ Tiếp nhận khi đơn OPEN */}
        {dispatchStatus === "OPEN" && (
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button
              variant="primary"
              disabled={loading}
              onClick={handleClaim}
              className="w-full h-12 text-body font-extrabold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <span>{loading ? "Đang xử lý..." : "TIẾP NHẬN ĐƠN NÀY"}</span>
              <ArrowRight size={18} />
            </Button>
            <p className="text-caption text-text-muted text-center">
              Sau khi bấm nhận, bạn sẽ có thời gian kiểm tra kho hoa trước khi đơn chốt vào sản xuất chính thức.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
