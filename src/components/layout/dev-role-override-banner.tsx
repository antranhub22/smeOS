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
import { ChevronDown } from "@/components/ui/icon-set/chevron-down"
import { FlaskConical } from "@/components/ui/icon-set/flask-conical"
import { X } from "@/components/ui/icon-set/x"
import { Button } from "@/components/ui/button"
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

  // Guard: không render gì ở production (đặt sau mọi hook — rules-of-hooks)
  if (!isDev) return null

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
          className="flex w-64 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-widest text-text">
              <FlaskConical size={12} aria-hidden />
              Dev Role Override
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded p-0.5 text-text-muted hover:bg-surface-alt"
              aria-label="Đóng"
            >
              <X size={13} />
            </Button>
          </div>

          {/* Presets */}
          <ul className="divide-y divide-border">
            {DEV_ROLE_PRESETS.map((preset) => {
              const isActive = activeRoleKey === preset.roleKey
              const isLoading = loading === preset.roleKey
              return (
                <li key={preset.roleKey}>
                  <Button variant="ghost"
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      if (!isLoading) applyOverride(preset)
                    }}
                    aria-disabled={isLoading}
                    className={cn("h-auto", "justify-start", 
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-meta transition-colors cursor-pointer",
                      isActive
                        ? "bg-surface-alt font-bold text-text hover:bg-surface-alt"
                        : "text-text hover:bg-surface-alt",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-2 w-2 flex-shrink-0 rounded-full",
                        isActive ? "bg-primary" : "bg-border"
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{preset.label}</span>
                    {isActive && (
                      <span className="rounded bg-primary px-1 py-0.5 text-caption font-bold text-white">
                        ACTIVE
                      </span>
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>

          {/* Clear override */}
          {activeRoleKey && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyOverride(null)}
                disabled={loading === "clear"}
                className="w-full rounded-lg px-3 py-1.5 text-center text-caption font-semibold text-text hover:bg-surface-alt"
              >
                {loading === "clear" ? "Đang xoá…" : "✕ Xoá override — dùng session thật"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <Button variant="outline"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("h-auto", 
          "flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-caption font-bold text-text shadow-md transition-all hover:bg-surface cursor-pointer",
          open && "bg-surface hover:bg-surface"
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
      </Button>
    </div>
  )
}
