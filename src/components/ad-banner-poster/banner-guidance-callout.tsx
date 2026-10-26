"use client"

import React, { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp, Layers, Sliders, Download } from "lucide-react"

export function BannerGuidanceCallout() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">
              Quy trình 3 bước tạo bộ ấn phẩm quảng cáo đa kênh
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Sinh trọn gói 5 kích thước chuẩn sàn (1:1, 4:5, 9:16, 16:9, A4) từ một nội dung duy nhất.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus:outline-none"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Thu gọn" : "Xem chi tiết"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in-50 duration-200">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              1
            </div>
            <div className="text-xs">
              <span className="font-semibold text-text flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-primary" /> Chọn dịp & Ý tưởng
              </span>
              <p className="text-text-muted mt-0.5">
                Chọn dịp hoặc bấm nút AI để tự động gợi ý tiêu đề, ưu đãi hấp dẫn và câu kêu gọi hành động.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              2
            </div>
            <div className="text-xs">
              <span className="font-semibold text-text flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" /> Bố cục thời gian thực
              </span>
              <p className="text-text-muted mt-0.5">
                Đổi phong cách thiết kế, tải ảnh sản phẩm; mọi thay đổi đồng bộ tức thì trên cả 5 kích thước.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface border border-border">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              3
            </div>
            <div className="text-xs">
              <span className="font-semibold text-text flex items-center gap-1">
                <Download className="h-3.5 w-3.5 text-primary" /> Xuất bản & Đăng bán
              </span>
              <p className="text-text-muted mt-0.5">
                Tải ảnh PNG/JPEG độ nét cao, tải trọn bộ một chạm hoặc lưu làm mẫu phát hành cho chuỗi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
