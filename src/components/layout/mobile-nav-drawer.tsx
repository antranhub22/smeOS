"use client"

// Thanh trên cùng + ngăn kéo điều hướng (burger menu) cho điện thoại.
// Dùng lại đúng sidebar của màn hình lớn để cửa hàng và chuỗi thấy cùng một menu.

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useSession } from "@/lib/session"
import { DesktopNav } from "./desktop-nav"

export function MobileNavDrawer() {
  const pathname = usePathname()
  const { orgName } = useSession()
  // Lưu trang lúc mở; đổi trang → ngăn kéo tự đóng
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null)

  // Khóa cuộn nền + phím Esc để đóng
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
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

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
          <DesktopNav drawer onNavigate={() => setOpen(false)} onClose={() => setOpen(false)} />
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}
    </>
  )
}
