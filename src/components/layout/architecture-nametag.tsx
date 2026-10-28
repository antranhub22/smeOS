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
          "bg-orchid-50 text-orchid-700 border-orchid-200/90 dark:bg-orchid-950/40 dark:text-orchid-300 dark:border-orchid-800/50",
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
          "bg-lagoon-50 text-lagoon-700 border-lagoon-200/90 dark:bg-lagoon-950/40 dark:text-lagoon-300 dark:border-lagoon-800/50",
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
          "bg-azure-50 text-azure-700 border-azure-200/90 dark:bg-azure-950/40 dark:text-azure-300 dark:border-azure-800/50",
      }
    }

    // 4. StoreOS (Tầng 4)
    return {
      label: `StoreOS • ${industryShort}`,
      title: `Hệ điều hành Cửa hàng Cơ sở`,
      badgeClass:
        "bg-mint-50 text-mint-700 border-mint-200/90 dark:bg-mint-950/40 dark:text-mint-300 dark:border-mint-800/50",
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
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-caption font-semibold tracking-tight leading-none shadow-2xs whitespace-nowrap select-none transition-colors",
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
            className="absolute left-0 top-full z-[9999] mt-2 w-64 overflow-hidden rounded-xl border border-sand-300 bg-sand-50 shadow-2xl dark:border-sand-700 dark:bg-sand-950"
          >
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-sand-200 px-3 py-2 dark:border-sand-800">
            <FlaskConical size={11} className="text-sand-600 dark:text-sand-400" aria-hidden />
            <span className="text-caption font-bold uppercase tracking-widest text-sand-700 dark:text-sand-300">
              Dev Role Override
            </span>
          </div>

          {/* Presets */}
          <ul className="divide-y divide-sand-100 dark:divide-sand-900">
            {DEV_ROLE_PRESETS.length === 0 ? (
              <li className="px-3 py-2 text-caption text-text-muted">Chưa có vai dev mẫu</li>
            ) : (
              DEV_ROLE_PRESETS.map((preset) => {
                const isActive = roleKey === preset.roleKey
                const isLoading = loading === preset.roleKey
                return (
                  <li key={preset.roleKey} role="option" aria-selected={isActive}>
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
                      {isActive ? (
                        <Check size={11} className="flex-shrink-0 text-sand-700" aria-hidden />
                      ) : (
                        <span className="h-[11px] w-[11px] flex-shrink-0" aria-hidden />
                      )}
                      <span className="flex-1">{preset.label}</span>
                      {isLoading && (
                        <span className="text-caption text-sand-500">Đang lưu…</span>
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          {/* Clear override */}
          <div className="border-t border-sand-200 p-2 dark:border-sand-800">
            <button
              type="button"
              onClick={() => applyOverride(null)}
              disabled={loading === "clear"}
              className="w-full rounded-lg px-3 py-1.5 text-center text-caption text-sand-700 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-900"
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
