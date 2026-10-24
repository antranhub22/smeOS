"use client"

import React, { useState } from "react"

export interface EnhanceComparisonProps {
  originalUrl: string
  enhancedUrl: string
}

export function EnhanceComparison({ originalUrl, enhancedUrl }: EnhanceComparisonProps) {
  const [sliderPos, setSliderPos] = useState(50)

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-md select-none group bg-slate-900">
      {/* Enhanced Image (Background/Base) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={enhancedUrl}
        alt="Ảnh hoàn chỉnh đã tăng cường"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Original Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalUrl}
          alt="Ảnh gốc trước khi tăng cường"
          className="absolute inset-0 w-full h-full object-contain max-w-none"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Dividing Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center text-[10px] font-bold border border-slate-300">
          ↔
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none">
        Ảnh gốc
      </div>
      <div className="absolute top-3 right-3 bg-amber-600/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none">
        Ảnh Studio ✨
      </div>

      {/* Transparent Range Input for Interaction */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        aria-label="Thanh trượt so sánh ảnh trước và sau khi xử lý"
      />
    </div>
  )
}
