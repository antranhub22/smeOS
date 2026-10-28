"use client"

/**
 * DevRoleOverrideBanner — Floating switcher chỉ hiện khi NODE_ENV=development.
 *
 * Cho phép developer click để switch giữa các vai/tầng kiến trúc mà
 * không cần re-login. Gọi POST/DELETE /api/dev/role-override rồi
 * router.refresh() để server đọc lại cookie và re-render session.
 *
 * Render ở góc dưới-phải, z-index cao, không ảnh hưởng layout.
 */

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, FlaskConical, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEV_ROLE_PRESETS, type DevRoleOverride } from "@/lib/dev-role-override"

interface Props {
  /** Vai đang active trong session hiện tại (từ server). */
  activeRoleKey: string | null | undefined
  /** Truyền từ Server Component: process.env.NODE_ENV !== "production" */
  isDev: boolean
}

export function DevRoleOverrideBanner({ activeRoleKey, isDev }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Guard: không render gì ở production
  if (!isDev) return null

  const applyOverride = useCallback(
    async (override: DevRoleOverride | null) => {
      const key = override?.roleKey ?? "clear"
      setLoading(key)
      try {
        if (override === null) {
          await fetch("/api/dev/role-override", { method: "DELETE" })
        } else {
          await fetch("/api/dev/role-override", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(override),
          })
        }
        if (override?.roleKey === "platform_admin") {
          window.location.href = "/van-hanh"
        } else {
          window.location.href = "/"
        }
        setOpen(false)
      } catch (err) {
        console.error("Lỗi cập nhật vai dev:", err)
      } finally {
        setLoading(null)
      }
    },
    [router]
  )

  return (
    <div
      className="fixed bottom-20 right-3 z-[9999] flex flex-col items-end gap-1.5 md:bottom-4"
      aria-label="Dev Role Override"
    >
      {/* Dropdown panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chọn vai dev"
          className="flex w-64 flex-col overflow-hidden rounded-xl border border-sand-300 bg-sand-50 shadow-xl dark:border-sand-700 dark:bg-sand-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand-200 px-3 py-2 dark:border-sand-800">
            <span className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-widest text-sand-700 dark:text-sand-300">
              <FlaskConical size={12} aria-hidden />
              Dev Role Override
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-900"
              aria-label="Đóng"
            >
              <X size={13} />
            </button>
          </div>

          {/* Presets */}
          <ul className="divide-y divide-sand-100 dark:divide-sand-900">
            {DEV_ROLE_PRESETS.map((preset) => {
              const isActive = activeRoleKey === preset.roleKey
              const isLoading = loading === preset.roleKey
              return (
                <li key={preset.roleKey}>
                  <button
                    type="button"
                    onClick={() => applyOverride(preset)}
                    disabled={isLoading}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-meta transition-colors",
                      isActive
                        ? "bg-sand-200 font-bold text-sand-900 dark:bg-sand-800 dark:text-sand-100"
                        : "text-sand-800 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-sand-900",
                      isLoading && "opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-2 w-2 flex-shrink-0 rounded-full",
                        isActive ? "bg-sand-600" : "bg-sand-300"
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{preset.label}</span>
                    {isActive && (
                      <span className="rounded bg-sand-600 px-1 py-0.5 text-caption font-bold text-white">
                        ACTIVE
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Clear override */}
          {activeRoleKey && (
            <div className="border-t border-sand-200 p-2 dark:border-sand-800">
              <button
                type="button"
                onClick={() => applyOverride(null)}
                disabled={loading === "clear"}
                className="w-full rounded-lg px-3 py-1.5 text-center text-caption font-semibold text-sand-700 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-900"
              >
                {loading === "clear" ? "Đang xoá…" : "✕ Xoá override — dùng session thật"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-sand-400 bg-sand-100 px-3 py-1.5 text-caption font-bold text-sand-800 shadow-md transition-all hover:bg-sand-200 dark:border-sand-600 dark:bg-sand-900 dark:text-sand-200 dark:hover:bg-sand-800",
          open && "bg-sand-200 dark:bg-sand-800"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <FlaskConical size={13} aria-hidden />
        DEV
        <ChevronDown
          size={11}
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
    </div>
  )
}
