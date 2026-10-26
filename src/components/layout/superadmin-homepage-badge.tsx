"use client"

/**
 * SuperadminHomepageBadge — Badge hiển thị homepage đang active khi dùng
 * superadmin hoặc dev role override.
 *
 * Trong môi trường dev (isDev=true): Cho phép click để mở dropdown switch nhanh
 * giữa 4 tầng kiến trúc (SaaS Mother, SaaS Đa Ngành, ChainOS, StoreOS)
 * và tự động chuyển về đúng Homepage của tầng đó.
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, ChevronDown, Check, FlaskConical } from "lucide-react"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { DEV_ROLE_PRESETS, type DevRoleOverride } from "@/lib/dev-role-override"

const HOMEPAGE_LABEL: Record<string, { label: string; color: string }> = {
  PLATFORM_JOURNEY_HOME: {
    label: "Platform Home",
    color: "bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50",
  },
  INDUSTRY_JOURNEY_HOME: {
    label: "Industry Home",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/90 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50",
  },
  NETWORK_JOURNEY_HOME: {
    label: "Network Home",
    color: "bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  },
  CONTROL_TOWER: {
    label: "Control Tower",
    color: "bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  },
  FLOWER_NETWORK_COMMAND_CENTER: {
    label: "Flower Network",
    color: "bg-pink-50 text-pink-700 border-pink-200/90 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/50",
  },
  STORE_JOURNEY_HOME: {
    label: "Store Home",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  STORE_GROWTH_CENTER: {
    label: "Growth Center",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  STORE_COMMAND_CENTER: {
    label: "Command Center",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  CONTROL_CENTER: {
    label: "Command Center",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  SALES_WORKSPACE: {
    label: "Sales Workspace",
    color: "bg-orange-50 text-orange-700 border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  },
  PRODUCT_WORKSPACE: {
    label: "Product Workspace",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/90 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50",
  },
  CREATIVE_WORKSPACE: {
    label: "Creative Workspace",
    color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/90 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800/50",
  },
  CRM_WORKSPACE: {
    label: "CRM Workspace",
    color: "bg-teal-50 text-teal-700 border-teal-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50",
  },
  CUSTOMER_SERVICE_WORKSPACE: {
    label: "CS Workspace",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200/90 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50",
  },
}

interface Props {
  /** isDev: true khi NODE_ENV !== "production" */
  isDev?: boolean
}

export function SuperadminHomepageBadge({ isDev = false }: Props) {
  const { roleKey, roleUx } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

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
      } finally {
        setLoading(null)
      }
    },
    []
  )

  // Chỉ hiển thị khi là vai quản trị cấp cao hoặc trong môi trường dev
  const isSuperContext =
    roleKey === "platform_admin" ||
    roleKey === "industry_admin" ||
    roleKey === "flower_network_admin" ||
    roleKey === "chain_admin" ||
    roleKey === "store_admin" ||
    isDev

  if (!isSuperContext || !roleUx) return null

  const homepageKey = roleUx.homepage
  if (!homepageKey || homepageKey === "NOT_BUILT") return null

  const config = HOMEPAGE_LABEL[homepageKey] || {
    label: homepageKey,
    color: "bg-surface-alt text-text-muted border-border",
  }

  const badgeContent = (
    <span
      title={`Homepage đang active: ${homepageKey}${isDev ? " (Click để đổi tầng/vai)" : ""}`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-bold tracking-tight leading-none whitespace-nowrap select-none transition-opacity",
        config.color,
        isDev && "cursor-pointer hover:opacity-80"
      )}
    >
      <Monitor size={8} aria-hidden />
      {config.label}
      {isDev && (
        <ChevronDown
          size={8}
          aria-hidden
          className={cn("transition-transform ml-0.5", open && "rotate-180")}
        />
      )}
    </span>
  )

  if (!isDev) return badgeContent

  return (
    <div ref={panelRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Homepage: ${config.label}. Click để đổi vai`}
        className="flex items-center"
      >
        {badgeContent}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Chọn tầng / vai trò"
          className="absolute left-0 top-full z-[9999] mt-1.5 w-64 overflow-hidden rounded-xl border border-primary/20 bg-surface shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-border bg-surface-alt px-3 py-2">
            <FlaskConical size={12} className="text-primary" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text">
              Chuyển Tầng & Vai Trò
            </span>
          </div>

          {/* Presets */}
          <ul className="divide-y divide-border">
            {DEV_ROLE_PRESETS.map((preset) => {
              const isActive = roleKey === preset.roleKey
              const isLoading = loading === preset.roleKey
              return (
                <li key={preset.roleKey} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => applyOverride(preset)}
                    disabled={isLoading}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-text hover:bg-surface-alt",
                      isLoading && "opacity-50"
                    )}
                  >
                    {isActive ? (
                      <Check size={12} className="flex-shrink-0 text-primary" aria-hidden />
                    ) : (
                      <span className="h-3 w-3 flex-shrink-0" aria-hidden />
                    )}
                    <span className="flex-1 truncate">{preset.label}</span>
                    {isLoading && (
                      <span className="text-[10px] text-primary animate-pulse">Đang nạp…</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Clear override */}
          <div className="border-t border-border p-2 bg-surface-alt/50">
            <button
              onClick={() => applyOverride(null)}
              disabled={loading === "clear"}
              className="w-full rounded-lg px-3 py-1.5 text-center text-caption font-semibold text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
            >
              {loading === "clear" ? "Đang xoá…" : "↩ Xoá override — dùng session thật"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
