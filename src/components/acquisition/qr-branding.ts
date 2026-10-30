"use client"

import { generateQRCodeDataUrl, generateQRCodeSvg } from "@/core/media/qr-engine"

/**
 * QR in ấn cho cửa hàng (công cụ 12/25): logo giữa mã + dòng mời phía dưới, vẽ trên canvas.
 * Có logo → mức sửa lỗi "H" để mã vẫn quét được khi bị che giữa.
 */

const SIZE = 1024
const CAPTION_H = 120

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Không tải được logo"))
    img.src = src
  })
}

export interface BrandedQrOptions {
  url: string
  color: string
  logoUrl?: string | null | undefined
  caption?: string | null | undefined
}

/** PNG 1024px (+ dải chữ mời nếu có). Logo lỗi tải → vẫn trả QR không logo. */
export async function renderBrandedQrPng({ url, color, logoUrl, caption }: BrandedQrOptions): Promise<string> {
  const qr = await generateQRCodeDataUrl(url, { width: SIZE, margin: 3, darkColor: color, errorCorrectionLevel: logoUrl ? "H" : "M" })
  const canvas = document.createElement("canvas")
  const text = caption?.trim()
  canvas.width = SIZE
  canvas.height = SIZE + (text ? CAPTION_H : 0)
  const g = canvas.getContext("2d")
  if (!g) return qr
  g.fillStyle = "#ffffff"
  g.fillRect(0, 0, canvas.width, canvas.height)
  g.drawImage(await loadImage(qr), 0, 0, SIZE, SIZE)

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl)
      const box = SIZE * 0.22
      const x = (SIZE - box) / 2
      g.fillStyle = "#ffffff"
      g.fillRect(x - 12, x - 12, box + 24, box + 24)
      const scale = Math.min(box / logo.width, box / logo.height)
      g.drawImage(logo, x + (box - logo.width * scale) / 2, x + (box - logo.height * scale) / 2, logo.width * scale, logo.height * scale)
    } catch {
      // Logo hỏng/chặn CORS: giữ QR trơn, vẫn quét được.
    }
  }
  if (text) {
    g.fillStyle = color
    g.font = "600 52px system-ui, sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText(text.slice(0, 40), SIZE / 2, SIZE + CAPTION_H / 2 - 10, SIZE - 80)
  }
  return canvas.toDataURL("image/png")
}

/** SVG vector cho nhà in (không logo — nhà in tự ghép). */
export async function renderQrSvgDataUrl(url: string, color: string): Promise<string> {
  const svg = await generateQRCodeSvg(url, { width: SIZE, margin: 3, darkColor: color })
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
