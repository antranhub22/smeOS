"use client"

/**
 * ArchitectureNametag — Badge pill hiển thị tầng kiến trúc hiện tại.
 *
 * Ở môi trường development (isDev=true): badge là nút có thể click,
 * mở dropdown cho phép switch vai/tầng nhanh mà không cần re-login.
 * Ở production: badge chỉ đọc, không có dropdown.
 */

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { FlaskConical, Check, ChevronDown } from "lucide-react"
import { DEV_ROLE_PRESETS, type DevRoleOverride } from "@/lib/dev-role-override"

const INDUSTRY_SHORT_NAME: Record<string, string> = {
  FLORAL: "Sản phẩm",
  FASHION: "Thời trang",
  FNB: "F&B",
  CRAFT_GIFT: "Quà tặng",
  HOMESTAY: "Homestay",
  RETAIL_GENERAL: "Bán lẻ",
  SERVICES: "Dịch vụ",
}

interface Props {
  /** Truyền từ Server Component: process.env.NODE_ENV !== "production" */
  isDev?: boolean
}

export function ArchitectureNametag({ isDev = false }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { organizationType, roleKey, organization } = useSession()
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

  const nametag = useMemo(() => {
    // 1. SaaS Mother
    const isPlatform =
      pathname?.startsWith("/van-hanh") ||
      organizationType === "PLATFORM" ||
      roleKey === "platform_admin"

    if (isPlatform) {
      return {
        label: "SaaS Mother",
        title: "Hệ điều hành Nền tảng Mẹ",
        badgeClass:
          "bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50",
      }
    }

    const industryKey = (organization?.industry || "FLORAL").toUpperCase()
    const industryShort = INDUSTRY_SHORT_NAME[industryKey] || "Sản phẩm"

    // 2. SaaS Ngành (Tầng 2)
    const isIndustry =
      organizationType === "INDUSTRY" ||
      roleKey === "industry_admin"

    if (isIndustry) {
      return {
        label: `SaaS Ngành • ${industryShort}`,
        title: `Hệ điều hành Chuẩn hóa & Mạng lưới Ngành`,
        badgeClass:
          "bg-teal-50 text-teal-700 border-teal-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50",
      }
    }

    // 3. ChainOS (Tầng 3)
    const isChain =
      organizationType === "FLOWER_NETWORK" ||
      organizationType === "CHAIN" ||
      roleKey === "flower_network_admin" ||
      roleKey === "chain_admin"

    if (isChain) {
      return {
        label: `ChainOS • ${industryShort}`,
        title: `Hệ điều hành Mạng lưới Chuỗi`,
        badgeClass:
          "bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
      }
    }

    // 4. StoreOS (Tầng 4)
    return {
      label: `StoreOS • ${industryShort}`,
      title: `Hệ điều hành Cửa hàng Cơ sở`,
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
    }
  }, [pathname, organizationType, roleKey, organization?.industry])

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

  const badge = (
    <span
      title={nametag.title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-tight leading-none shadow-2xs whitespace-nowrap select-none transition-colors",
        nametag.badgeClass,
        isDev && "cursor-pointer hover:opacity-80"
      )}
    >
      {isDev && <FlaskConical size={9} aria-hidden />}
      {nametag.label}
      {isDev && (
        <ChevronDown
          size={9}
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        />
      )}
    </span>
  )

  if (!isDev) return badge

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Tầng kiến trúc: ${nametag.label}. Click để switch vai dev`}
        className="flex items-center"
      >
        {badge}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Lớp phủ bấm ra ngoài để đóng menu */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9990] bg-transparent cursor-default"
          />

          <div
            role="listbox"
            aria-label="Chọn vai dev"
            className="absolute left-0 top-full z-[9999] mt-2 w-64 overflow-hidden rounded-xl border border-amber-300 bg-amber-50 shadow-2xl dark:border-amber-700 dark:bg-amber-950"
          >
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-amber-200 px-3 py-2 dark:border-amber-800">
            <FlaskConical size={11} className="text-amber-600 dark:text-amber-400" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Dev Role Override
            </span>
          </div>

          {/* Presets */}
          <ul className="divide-y divide-amber-100 dark:divide-amber-900">
            {DEV_ROLE_PRESETS.map((preset) => {
              const isActive = roleKey === preset.roleKey
              const isLoading = loading === preset.roleKey
              return (
                <li key={preset.roleKey} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => applyOverride(preset)}
                    disabled={isLoading}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors",
                      isActive
                        ? "bg-amber-200 font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                        : "text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900",
                      isLoading && "opacity-50"
                    )}
                  >
                    {isActive ? (
                      <Check size={11} className="flex-shrink-0 text-amber-700" aria-hidden />
                    ) : (
                      <span className="h-[11px] w-[11px] flex-shrink-0" aria-hidden />
                    )}
                    <span className="flex-1">{preset.label}</span>
                    {isLoading && (
                      <span className="text-[10px] text-amber-500">Loading…</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Clear override */}
          <div className="border-t border-amber-200 p-2 dark:border-amber-800">
            <button
              onClick={() => applyOverride(null)}
              disabled={loading === "clear"}
              className="w-full rounded-lg px-3 py-1.5 text-center text-[11px] text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              {loading === "clear" ? "Đang xoá…" : "↩ Xoá override — dùng session thật"}
            </button>
          </div>
        </div>
      </>
    )}
    </div>
  )
}
