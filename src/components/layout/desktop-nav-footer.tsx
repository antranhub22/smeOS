"use client"

/**
 * DesktopNavFooter — Footer thanh điều hướng bên trái
 * Bao gồm: Nút Copilot (⌘K) + Thẻ người dùng + Đăng xuất
 *
 * Hỗ trợ collapsed mode: chỉ hiển thị icon.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, LogOut } from "@/components/ui/icons"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { UserMenu } from "./user-menu"

interface DesktopNavFooterProps {
  collapsed?: boolean
}

export function DesktopNavFooter({ collapsed = false }: DesktopNavFooterProps) {
  const router = useRouter()
  const { userName, userInitials, orgName, roleUx } = useSession()
  const { t } = useI18n()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleQuickLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" })
    } catch {
      // Vẫn chuyển hướng dù lỗi mạng hoặc phiên đã hết hạn
    } finally {
      router.push("/dang-nhap")
      router.refresh()
    }
  }

  const displayRole = roleUx?.label ?? (orgName || "").replace(/\s*\(\s*dev\s*\)/gi, "").trim()

  // ─── Collapsed: icon-only stack ───────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 border-t border-border px-1.5 py-3">
        {/* Copilot icon */}
        <button
          type="button"
          title="smeOS Copilot (⌘K)"
          aria-label="Mở smeOS Copilot"
          onClick={() =>
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
          }
          className={cn(
            "group flex h-9 w-9 items-center justify-center rounded-xl",
            "bg-primary text-white shadow-sm",
            "hover:bg-primary-dark transition-colors duration-150"
          )}
        >
          <Bot size={16} aria-hidden />
        </button>

        {/* Avatar + logout */}
        <div className="relative">
          <UserMenu initials={userInitials || "U"} direction="up" size="sm" />
        </div>
      </div>
    )
  }

  // ─── Expanded: full footer ─────────────────────────────────────
  return (
    <div className="flex flex-col gap-2 border-t border-border p-3">
      {/* Copilot shortcut button */}
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
        }
        className={cn(
          "group flex w-full items-center justify-between rounded-xl border border-border",
          "bg-surface-alt p-2.5 text-left transition-all duration-150",
          "hover:border-primary/30 hover:bg-primary-muted hover:shadow-xs"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white",
              "shadow-xs group-hover:shadow-sm transition-shadow duration-150"
            )}
          >
            <Bot size={14} aria-hidden />
          </span>
          <div>
            <div className="text-caption font-bold text-text leading-tight">smeOS Copilot</div>
            <div className="text-caption text-text-muted font-medium leading-tight">Trợ lý AI 24/7</div>
          </div>
        </div>
        <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-caption font-mono text-text-muted">
          ⌘K
        </kbd>
      </button>

      {/* User card */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-surface-alt/60 p-2",
          "transition-colors duration-150 hover:border-border"
        )}
      >
        <UserMenu initials={userInitials || "U"} direction="up" size="sm" />

        <div className="min-w-0 flex-1">
          <div
            className="truncate text-caption font-bold text-text leading-tight"
            title={userName}
          >
            {userName || "Người dùng"}
          </div>
          <div
            className="truncate text-caption text-text-muted leading-tight"
            title={displayRole}
          >
            {displayRole}
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickLogout}
          disabled={loggingOut}
          title={t("layout.userMenu.logout")}
          aria-label={t("layout.userMenu.logout")}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            "text-text-muted hover:bg-danger-bg hover:text-danger",
            "transition-colors duration-150 disabled:opacity-50"
          )}
        >
          <LogOut size={15} aria-hidden />
        </button>
      </div>
    </div>
  )
}
