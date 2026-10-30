"use client"

import React from "react"
import { Sliders, Layers, Download } from "lucide-react"
import { InfoTip } from "@/components/ui/info-tip"

const STEPS = [
  {
    icon: Sliders,
    title: "Chọn dịp & ý tưởng",
    detail: "Chọn dịp hoặc bấm nút AI để gợi ý tiêu đề, ưu đãi và câu kêu gọi hành động.",
  },
  {
    icon: Layers,
    title: "Chỉnh bố cục",
    detail: "Đổi phong cách, tải ảnh sản phẩm; mọi thay đổi đồng bộ ngay trên cả 5 kích thước (1:1, 4:5, 9:16, 16:9, A4).",
  },
  {
    icon: Download,
    title: "Tải về & đăng bán",
    detail: "Tải ảnh PNG/JPEG độ nét cao, tải trọn bộ một chạm hoặc lưu làm mẫu cho chuỗi.",
  },
] as const

/** 3 bước tạo ấn phẩm — icon lớn, nhãn ngắn, giải thích trong "?" (thử phong cách thoáng). */
export function BannerGuidanceCallout() {
  return (
    <section aria-label="Các bước tạo ấn phẩm" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        return (
          <div
            key={step.title}
            className="relative flex items-center gap-4 p-5 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60"
          >
            <div className="flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-primary-muted text-primary">
              <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-caption font-semibold text-text-muted">Bước {i + 1}</span>
              <h2 className="text-title-sm font-bold text-text">{step.title}</h2>
            </div>
            <InfoTip label={step.title}>{step.detail}</InfoTip>
          </div>
        )
      })}
    </section>
  )
}
