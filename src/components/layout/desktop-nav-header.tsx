"use client"

/**
 * DesktopNavHeader — Header sidebar phân biệt tầng kiến trúc
 * Mỗi tầng (Mother / SaaS Ngành / ChainOS / StoreOS) có màu accent riêng
 * và dải gradient nhẹ để người dùng nhận biết ngay mình đang ở tầng nào.
 */

import { Sparkles, PanelLeftClose, PanelLeftOpen, X } from "lucide-react"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { ArchitectureNametag } from "./architecture-nametag"

// ────────────────────────────────────────────────────────────────
// Tier theme — màu accent cho từng tầng
// ────────────────────────────────────────────────────────────────
type TierKey = "mother" | "industry" | "chain" | "store"

function resolveTier(organizationType?: string | null, roleKey?: string | null): TierKey {
  if (organizationType === "PLATFORM" || roleKey === "platform_admin") return "mother"
  if (organizationType === "INDUSTRY" || roleKey === "industry_admin") return "industry"
  if (
    organizationType === "CHAIN" ||
    organizationType === "FLOWER_NETWORK" ||
    roleKey === "flower_network_admin"
  )
    return "chain"
  return "store"
}

const TIER_STYLES: Record<TierKey, { iconBg: string; strip: string; ring: string }> = {
  mother: {
    iconBg: "bg-[#6B21A8]",
    strip: "bg-gradient-to-r from-[#6B21A8]/15 via-[#6B21A8]/5 to-transparent",
    ring: "shadow-[0_0_0_1px_rgba(107,33,168,0.25)]",
  },
  industry: {
    iconBg: "bg-[#92400E]",
    strip: "bg-gradient-to-r from-[#C89B3C]/15 via-[#C89B3C]/5 to-transparent",
    ring: "shadow-[0_0_0_1px_rgba(200,155,60,0.3)]",
  },
  chain: {
    iconBg: "bg-[#1D4ED8]",
    strip: "bg-gradient-to-r from-[#1D4ED8]/15 via-[#1D4ED8]/5 to-transparent",
    ring: "shadow-[0_0_0_1px_rgba(29,78,216,0.25)]",
  },
  store: {
    iconBg: "bg-primary",
    strip: "bg-gradient-to-r from-primary/12 via-primary/4 to-transparent",
    ring: "shadow-[0_0_0_1px_rgba(122,46,66,0.2)]",
  },
}

// ────────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────────
interface DesktopNavHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  drawer?: boolean
  onClose?: (() => void) | undefined
  isDev?: boolean
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
export function DesktopNavHeader({
  collapsed,
  onToggleCollapse,
  drawer = false,
  onClose,
  isDev = false,
}: DesktopNavHeaderProps) {
  const { orgName, organizationType, roleKey } = useSession()

  const tier = resolveTier(organizationType, roleKey)
  const styles = TIER_STYLES[tier]
  const displayName = (orgName || "Doanh nghiệp").replace(/\s*\(\s*dev\s*\)/gi, "").trim()

  return (
    <div
      className={cn(
        "relative flex h-14 flex-shrink-0 items-center gap-2.5 overflow-hidden border-b border-border px-3",
        "transition-all duration-200"
      )}
    >
      {/* Tier accent gradient strip */}
      <div
        className={cn("absolute inset-0 pointer-events-none", styles.strip)}
        aria-hidden="true"
      />

      {/* Logo icon */}
      <div
        className={cn(
          "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white",
          "transition-[width,border-radius] duration-200",
          styles.iconBg,
          styles.ring,
          collapsed && "rounded-lg"
        )}
      >
        <Sparkles size={16} strokeWidth={2.2} aria-hidden />
      </div>

      {/* Brand text — ẩn khi collapsed */}
      {!collapsed && (
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="text-body-sm font-extrabold text-primary leading-tight tracking-tight">
            smeOS
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="truncate text-caption text-text-muted font-medium leading-tight"
              title={displayName}
            >
              {displayName}
            </span>
            <ArchitectureNametag isDev={isDev} />
          </div>
        </div>
      )}

      {/* Collapse toggle (desktop only) / Close button (drawer) */}
      {drawer && onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng menu"
          className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
        >
          <X size={17} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          title={collapsed ? "Mở rộng (⌘B)" : "Thu gọn (⌘B)"}
          className={cn(
            "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-muted",
            "hover:bg-surface-alt hover:text-text transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} aria-hidden />
          ) : (
            <PanelLeftClose size={16} aria-hidden />
          )}
        </button>
      )}
    </div>
  )
}
