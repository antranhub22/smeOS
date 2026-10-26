"use client"

// Cho phép trang có thanh tiêu đề riêng gắn nút burger vào thanh đó,
// thay vì hiện thêm thanh burger chung của layout (tránh hai thanh chồng nhau).

import { createContext, useContext, useEffect } from "react"
import { Menu } from "lucide-react"

type MobileNavApi = {
  openMenu: () => void
  open: boolean
  registerOwnHeader: () => () => void
}

export const MobileNavContext = createContext<MobileNavApi | null>(null)

/** Nút ☰ đặt trong thanh tiêu đề riêng của trang (chỉ hiện trên điện thoại). */
export function MobileMenuButton() {
  const api = useContext(MobileNavContext)
  const register = api?.registerOwnHeader
  useEffect(() => register?.(), [register])
  if (!api) return null
  return (
    <button
      type="button"
      onClick={api.openMenu}
      aria-label="Mở menu"
      aria-expanded={api.open}
      className="-ml-2 mr-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-text hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
    >
      <Menu size={22} />
    </button>
  )
}
