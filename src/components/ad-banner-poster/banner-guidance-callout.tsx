"use client"

import React from "react"
import { Sliders, Layers, Download } from "lucide-react"
import { InfoTip } from "@/components/ui/info-tip"

const STEPS = [
  {
    icon: Sliders,
    title: "Chọn ý tưởng",
    detail: "Chọn dịp hoặc bấm nút AI để gợi ý tiêu đề, ưu đãi và câu kêu gọi hành động.",
  },
  {
    icon: Layers,
    title: "Chỉnh bố cục",
    detail: "Đổi phong cách, tải ảnh sản phẩm; mọi thay đổi đồng bộ ngay trên cả 5 kích thước (1:1, 4:5, 9:16, 16:9, A4).",
  },
  {
    icon: Download,
    title: "Tải về",
    detail: "Tải ảnh PNG/JPEG độ nét cao, tải trọn bộ một chạm hoặc lưu làm mẫu cho chuỗi.",
  },
] as const

/** 3 bước tạo ấn phẩm — icon lớn, nhãn ngắn, giải thích trong "?" (thử phong cách thoáng). */
export function BannerGuidanceCallout() {
  return (
    <section aria-label="Các bước tạo ấn phẩm" className="grid grid-cols-3 gap-3 sm:gap-6">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        return (
          <div
            key={step.title}
            className="relative flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 p-3 pt-6 sm:p-5 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-primary-muted text-primary">
              <Icon className="w-5 h-5 sm:w-7 sm:h-7" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-caption font-semibold text-text-muted">Bước {i + 1}</span>
              <h2 className="text-body-sm sm:text-title-sm font-bold leading-snug text-text">{step.title}</h2>
            </div>
            <InfoTip label={step.title} className="absolute top-1 right-1 m-0 sm:static sm:-m-1.5">{step.detail}</InfoTip>
          </div>
        )
      })}
    </section>
  )
}
