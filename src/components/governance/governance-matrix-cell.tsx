/**
 * GOVERNANCE MATRIX CELL
 * Hiển thị một ô toggle quy tắc kèm:
 * - Badge nguồn gốc thừa kế (Mother / Industry / Chain / Store)
 * - Biểu tượng Khóa cứng (Lock) & lý do
 * - Nút Reset về mặc định nếu đang có Local Override
 */
"use client"

import { useState } from "react"
import { Lock, RotateCcw, Loader2 } from "@/components/ui/icons"
import type { GovernanceMatrixItem, GovernanceViewerTier } from "./governance-matrix-types"
import { GOVERNANCE_TIER_LABELS } from "./governance-matrix-types"

interface GovernanceMatrixCellProps {
  item: GovernanceMatrixItem
  viewerTier: GovernanceViewerTier
  canManageHardLocks?: boolean | undefined
  onToggle: (enabled: boolean) => Promise<void>
  onResetOverride?: (() => Promise<void>) | undefined
  onToggleHardLock?: ((locked: boolean) => Promise<void>) | undefined
}

export function GovernanceMatrixCell({
  item,
  viewerTier,
  canManageHardLocks,
  onToggle,
  onResetOverride,
  onToggleHardLock,
}: GovernanceMatrixCellProps) {
  const [loading, setLoading] = useState(false)

  const isLockedByUpper = item.isLocked && !item.isOwnHardLock
  const isDisabled = isLockedByUpper || loading

  async function handleToggle() {
    if (isDisabled) return
    setLoading(true)
    try {
      await onToggle(!item.enabled)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!onResetOverride || loading) return
    setLoading(true)
    try {
      await onResetOverride()
    } finally {
      setLoading(false)
    }
  }

  async function handleLockToggle() {
    if (!onToggleHardLock || loading) return
    setLoading(true)
    try {
      await onToggleHardLock(!item.isOwnHardLock)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      {/* Nguồn gốc kế thừa Badge */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-caption font-medium border ${
          item.isLocked
            ? "bg-danger-bg text-danger border-border-danger/30"
            : item.hasLocalOverride
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-surface-alt text-text-muted border-border"
        }`}
      >
        {item.isLocked && item.hardLockedBy
          ? `🔒 ${GOVERNANCE_TIER_LABELS[item.hardLockedBy]}`
          : item.hasLocalOverride
          ? "Đã tùy biến"
          : "Mặc định"}
      </span>

      {/* Nút Reset về mặc định */}
      {item.hasLocalOverride && !item.isLocked && onResetOverride && (
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          title="Khôi phục về mặc định của Cấp trên"
          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      )}

      {/* Quản trị Hard-Lock cho tầng có quyền */}
      {canManageHardLocks && onToggleHardLock && (
        <button
          type="button"
          onClick={handleLockToggle}
          disabled={loading || isLockedByUpper}
          title={
            item.isOwnHardLock
              ? "Gỡ khóa cứng cho các đơn vị trực thuộc"
              : "Khóa cứng quy tắc này (Cấp dưới không thể đổi)"
          }
          className={`p-1.5 rounded-lg transition-colors ${
            item.isOwnHardLock
              ? "bg-danger/10 text-danger hover:bg-danger/20"
              : "text-text-muted hover:text-text hover:bg-surface-alt"
          }`}
        >
          <Lock size={14} className={item.isOwnHardLock ? "fill-danger" : ""} />
        </button>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        aria-label={`${item.enabled ? "Tắt" : "Bật"} ${item.title}`}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary ${
          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${item.enabled ? "bg-primary" : "bg-surface-alt border border-border"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            item.enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={10} className="animate-spin text-white" />
          </span>
        )}
      </button>

      {/* Khóa bởi cấp trên cảnh báo */}
      {isLockedByUpper && item.lockReason && (
        <span
          className="text-caption text-text-muted truncate max-w-[140px]"
          title={item.lockReason}
        >
          {item.lockReason}
        </span>
      )}
    </div>
  )
}
