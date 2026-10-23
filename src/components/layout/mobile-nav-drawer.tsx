"use client"

// Thanh trên cùng + ngăn kéo điều hướng (burger menu) cho điện thoại.
// Dùng lại đúng sidebar của màn hình lớn để cửa hàng và chuỗi thấy cùng một menu.
// Trang có thanh tiêu đề riêng gắn <MobileMenuButton /> → thanh chung tự ẩn.

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useSession } from "@/lib/session"
import { DesktopNav } from "./desktop-nav"
import { MobileNavContext } from "./mobile-nav-context"

export function MobileNavDrawer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { orgName } = useSession()
  // Lưu trang lúc mở; đổi trang → ngăn kéo tự đóng
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const [ownHeaders, setOwnHeaders] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  const registerOwnHeader = useCallback(() => {
    setOwnHeaders((n) => n + 1)
    return () => setOwnHeaders((n) => n - 1)
  }, [])

  const api = useMemo(
    () => ({ openMenu: () => setOpenedAt(pathname), open, registerOwnHeader }),
    [pathname, open, registerOwnHeader]
  )

  // Khóa cuộn nền + phím Esc để đóng
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // Đưa tiêu điểm vào menu; đóng lại thì trả về nút burger đã bấm
    const burger = document.activeElement as HTMLElement | null
    drawerRef.current?.querySelector<HTMLElement>("button[aria-label=\"Đóng menu\"]")?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenedAt(null)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      burger?.focus()
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const close = () => setOpenedAt(null)

  return (
    <MobileNavContext.Provider value={api}>
      {ownHeaders === 0 && (
        <header className="sticky top-0 z-30 flex h-12 flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-2 md:hidden">
          <button
            type="button"
            onClick={api.openMenu}
            aria-label="Mở menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Menu size={22} />
          </button>
          <span className="truncate text-body-sm font-bold text-text">
            {(orgName || "smeOS").replace(/\s*\(\s*dev\s*\)/gi, "").trim()}
          </span>
        </header>
      )}

      {children}

      {open && (
        <div ref={drawerRef} className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
          <div className="flex animate-in slide-in-from-left duration-200">
            <DesktopNav drawer onNavigate={close} onClose={close} />
          </div>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={close}
            className="flex-1 bg-black/40 animate-in fade-in duration-200"
          />
        </div>
      )}
    </MobileNavContext.Provider>
  )
}
