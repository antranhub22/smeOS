"use client"

// Menu tài khoản dùng chung cho Header và Sidebar Navigation.
// Cung cấp avatar viết tắt, thông tin người dùng, chuyển đổi vai trò và nút Đăng xuất.

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, LogOut, ShieldCheck, UserRound } from "@/components/ui/icons"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { ChangePasswordDialog } from "./change-password-dialog"

export interface UserMenuProps {
  initials: string
  direction?: "up" | "down"
  size?: "sm" | "md"
}

export function UserMenu({ initials, direction = "down", size = "md" }: UserMenuProps) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [dangXuat, setDangXuat] = useState(false)
  const [doiMatKhau, setDoiMatKhau] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { roleUx, userName, userEmail, orgName, can, platformCapabilities } = useSession()
  const { t } = useI18n()

  useEffect(() => {
    if (!mo) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMo(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mo])

  async function handleLogout() {
    setDangXuat(true)
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" })
    } catch {
      // Vẫn chuyển hướng dù logout API lỗi (token hết hạn phía server)
    } finally {
      router.push("/dang-nhap")
      router.refresh()
    }
  }

  // Lối tắt Console Vận hành: chỉ người vận hành nền tảng thật, không xét đuôi email (rà soát H11)
  const isSuperUser = (platformCapabilities ?? []).length > 0

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        role="button"
        tabIndex={0}
        onClick={() => setMo((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setMo((v) => !v)
          }
        }}
        aria-label="Menu tài khoản"
        aria-expanded={mo}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary font-bold text-white shadow-xs transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer",
          size === "sm" ? "h-9 w-9 text-caption" : "h-10 w-10 text-body-sm"
        )}
      >
        {initials}
      </div>

      {mo && (
        <>
          {/* Lớp phủ để bấm ra ngoài là đóng menu */}
          <div
            role="button"
            aria-label="Đóng menu"
            tabIndex={-1}
            onClick={() => setMo(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMo(false)
            }}
            className="fixed inset-0 z-40 bg-transparent cursor-default border-0"
          />

          {/* Menu popover */}
          <div
            className={cn(
              "absolute z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
              direction === "up" ? "bottom-full mb-2 left-0" : "top-full mt-2 right-0"
            )}
          >
            {/* Header thông tin người dùng */}
            <div className="border-b border-border bg-surface-alt px-3.5 py-2.5">
              <div className="truncate text-caption font-bold text-text">
                {userName || "Người dùng"}
              </div>
              <div className="truncate text-caption text-text-muted">
                {roleUx?.label ?? (orgName || "").replace(/\s*\(\s*dev\s*\)/gi, "").trim()}
              </div>
            </div>

            {/* Lối tắt vào Console Vận hành dành riêng cho Super Admin / Operator */}
            {isSuperUser && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMo(false)
                  router.push("/van-hanh" as never)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setMo(false)
                    router.push("/van-hanh" as never)
                  }
                }}
                className="flex w-full items-center gap-2 border-b border-border bg-primary/5 px-3.5 py-2.5 text-left text-body-sm font-semibold text-primary hover:bg-primary/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              >
                <ShieldCheck size={16} strokeWidth={2} className="text-primary shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-bold">Console Vận hành</span>
                  <span className="block truncate text-caption font-medium text-text-muted">
                    Quản trị SaaS nền tảng
                  </span>
                </span>
              </div>
            )}

            {/* Vai trải nghiệm hiện tại + danh mục 14 vai (đặc tả 03b §3) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setMo(false)
                router.push("/vai-tro" as never)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setMo(false)
                  router.push("/vai-tro" as never)
                }
              }}
              className="flex w-full items-center gap-2 border-b border-border px-3.5 py-2.5 text-left text-body-sm font-semibold text-text hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
            >
              <UserRound size={16} strokeWidth={1.8} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block">Vai trò trải nghiệm</span>
                {roleUx && (
                  <span className="block truncate text-caption font-medium text-text-muted">
                    {roleUx.label}
                  </span>
                )}
              </span>
            </div>

            {/* Mở UI Studio (Theme & Style Switcher) — chỉ cho dev hoặc platform operator (ADR-011 D-UI-01) */}
            {(process.env.NODE_ENV !== "production" || (platformCapabilities && platformCapabilities.length > 0)) && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMo(false)
                  window.dispatchEvent(new CustomEvent("open-ui-studio"))
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setMo(false)
                    window.dispatchEvent(new CustomEvent("open-ui-studio"))
                  }
                }}
                className="flex w-full items-center gap-2 border-b border-border px-3.5 py-2.5 text-left text-body-sm font-semibold text-text hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-fg text-caption font-bold">
                  🎨
                </span>
                <span className="min-w-0">
                  <span className="block">Giao diện (UI Studio)</span>
                  <span className="block truncate text-caption font-medium text-text-muted">
                    Đổi Theme, Font, Mật độ
                  </span>
                </span>
              </div>
            )}

            {can("A2") && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMo(false)
                  setDoiMatKhau(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setMo(false)
                    setDoiMatKhau(true)
                  }
                }}
                className="flex w-full items-center gap-2 border-b border-border px-3.5 py-2.5 text-left text-body-sm font-semibold text-text hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              >
                <KeyRound size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>Đổi mật khẩu</span>
              </div>
            )}

            {/* Nút đăng xuất */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!dangXuat) handleLogout()
              }}
              onKeyDown={(e) => {
                if (!dangXuat && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  handleLogout()
                }
              }}
              aria-disabled={dangXuat}
              className={cn(
                "flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-body-sm font-semibold text-danger hover:bg-danger-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer",
                dangXuat && "opacity-50 cursor-not-allowed"
              )}
            >
              <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>{dangXuat ? "Đang đăng xuất…" : t("layout.userMenu.logout")}</span>
            </div>
          </div>
        </>
      )}
      <ChangePasswordDialog open={doiMatKhau} onOpenChange={setDoiMatKhau} />
    </div>
  )
}
