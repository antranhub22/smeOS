"use client"

import React, { useState } from "react"
import { Flower2 } from "lucide-react"
import { resolveFlowerImage } from "./flower-image-fallback"

interface SmartFlowerImageProps {
  src: string | null | undefined
  alt: string
  aspectRatio?: "square" | "4/3" | "16/9" | "4/5" | "16/10"
  fallbackIndex?: number
  className?: string
  priority?: boolean
}

export function SmartFlowerImage({
  src,
  alt,
  aspectRatio = "4/3",
  fallbackIndex = 0,
  className = "",
}: SmartFlowerImageProps) {
  const [errorSrc, setErrorSrc] = useState<string | null>(null)
  const isBroken = errorSrc === src
  const currentSrc = isBroken
    ? resolveFlowerImage(null, fallbackIndex)
    : resolveFlowerImage(src, fallbackIndex)

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "16/9"
      ? "aspect-16/9"
      : aspectRatio === "4/5"
      ? "aspect-4/5"
      : aspectRatio === "16/10"
      ? "aspect-16/10"
      : "aspect-4/3"

  const handleImgError = () => {
    setErrorSrc(src || "")
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-surface-alt/80 flex items-center justify-center ${aspectClass} ${className}`}
    >
      {/* Background ambient blur — lấy màu hoa tạo nền dịu mắt chống trống khung */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-125 pointer-events-none transition-opacity duration-700"
        style={{ backgroundImage: `url(${currentSrc})` }}
      />

      {/* Main Flower Image — Tràn viền sắc nét, hiển thị trọn vẹn và liền mạch với khung thẻ */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onError={handleImgError}
        className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
      />
    </div>
  )
}
