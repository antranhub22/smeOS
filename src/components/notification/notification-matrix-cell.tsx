/**
 * NOTIFICATION MATRIX CELL — Ô toggle đơn (event × channel)
 *
 * Hiện trạng thái bật/tắt, hard lock indicator,
 * và cho phép toggle nếu không bị lock bởi tầng trên.
 */
"use client"

import { useState } from "react"
import { Lock, Unlock, Loader2 } from "lucide-react"
import type { MatrixCellState } from "./notification-matrix-types"
import { TIER_LABELS } from "./notification-matrix-types"

interface MatrixCellProps {
  cell: MatrixCellState
  canManageHardLocks: boolean
  onToggle: (enabled: boolean) => Promise<void>
  onToggleHardLock?: ((enabled: boolean) => Promise<void>) | undefined
  onRemoveHardLock?: (() => Promise<void>) | undefined
}

export function NotificationMatrixCell({
  cell,
  canManageHardLocks,
  onToggle,
  onToggleHardLock,
  onRemoveHardLock,
}: MatrixCellProps) {
  const [toggling, setToggling] = useState(false)
  const [showLockMenu, setShowLockMenu] = useState(false)

  const isLockedByUpper = cell.hardLockedBy !== null && !cell.isOwnHardLock
  const isOwnLocked = cell.isOwnHardLock
  const isDisabled = isLockedByUpper || toggling

  async function handleToggle() {
    if (isDisabled) return
    setToggling(true)
    try {
      await onToggle(!cell.enabled)
    } finally {
      setToggling(false)
    }
  }

  async function handleToggleHardLock() {
    if (!onToggleHardLock) return
    setToggling(true)
    try {
      await onToggleHardLock(cell.enabled)
      setShowLockMenu(false)
    } finally {
      setToggling(false)
    }
  }

  async function handleRemoveHardLock() {
    if (!onRemoveHardLock) return
    setToggling(true)
    try {
      await onRemoveHardLock()
      setShowLockMenu(false)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center gap-1">
      {/* Toggle Switch */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        aria-label={`${cell.enabled ? "Tắt" : "Bật"} thông báo`}
        className={`
          relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
          transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-primary
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${cell.enabled ? "bg-primary" : "bg-surface-alt border border-border"}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${cell.enabled ? "translate-x-4" : "translate-x-0.5"}
          `}
        />
        {toggling && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={10} className="animate-spin text-white" />
          </span>
        )}
      </button>

      {/* Hard Lock Indicator */}
      {isLockedByUpper && cell.hardLockedBy && (
        <div
          className="flex items-center"
          title={`🔒 Khóa cứng bởi ${TIER_LABELS[cell.hardLockedBy]}${cell.hardLockReason ? `: ${cell.hardLockReason}` : ""}`}
        >
          <Lock size={11} className="text-warning" />
        </div>
      )}

      {/* Own Hard Lock Controls */}
      {canManageHardLocks && !isLockedByUpper && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLockMenu(!showLockMenu)}
            className={`
              p-0.5 rounded hover:bg-surface-alt transition-colors
              ${isOwnLocked ? "text-warning" : "text-text-muted hover:text-text"}
            `}
            title={isOwnLocked ? "Đã khóa cứng — bấm để quản lý" : "Đặt khóa cứng"}
          >
            {isOwnLocked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>

          {/* Lock Menu Dropdown */}
          {showLockMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLockMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-border bg-surface shadow-lg p-1">
                {isOwnLocked ? (
                  <button
                    type="button"
                    onClick={handleRemoveHardLock}
                    disabled={toggling}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-caption text-text hover:bg-surface-alt transition-colors"
                  >
                    <Unlock size={12} />
                    <span>Gỡ khóa cứng</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleHardLock}
                      disabled={toggling}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-caption text-text hover:bg-surface-alt transition-colors"
                    >
                      <Lock size={12} />
                      <span>Khóa cứng (giữ {cell.enabled ? "BẬT" : "TẮT"})</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
