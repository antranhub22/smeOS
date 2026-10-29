"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/**
 * Dựng ấn phẩm ở bề rộng thiết kế cố định rồi thu nhỏ cho vừa khung xem.
 * Bố cục bên trong không phụ thuộc bề rộng cột (trước đây khung hẹp làm cắt tiêu đề/nút),
 * và ảnh xuất chụp đúng phần tử ở bề rộng thiết kế.
 */
export function ScaledFrame({ designWidth, ratio, children }: { designWidth: number; ratio: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = outer.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / designWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [designWidth])

  const designHeight = designWidth / ratio
  return (
    <div ref={outer} className="w-full" style={{ height: designHeight * scale }}>
      <div style={{ width: designWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  )
}

/** Bề rộng thiết kế (px) và bề rộng ảnh xuất (px) theo định dạng — xuất đúng kích thước ghi trên nhãn. */
export const POSTER_DESIGN_WIDTH: Record<string, number> = { "16:9": 560 }
export const POSTER_EXPORT_WIDTH: Record<string, number> = { "1:1": 1080, "4:5": 1080, "9:16": 1080, "16:9": 1920, A4: 1240 }
export const designWidthOf = (format: string) => POSTER_DESIGN_WIDTH[format] ?? 340
