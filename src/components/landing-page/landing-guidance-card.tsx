import React from "react"
import { Globe, Sparkles, CheckCircle2 } from "lucide-react"

export function LandingGuidanceCard() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary-muted/20 p-4 md:p-5 text-text">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
          <Globe className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-primary">
              Công cụ 08: Tạo Landing Page Cửa hàng hoặc Chuỗi
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Chuẩn SSOT v3
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Tạo hiện diện trực tuyến chuyên nghiệp với link chia sẻ riêng, tối ưu trải nghiệm di động một chạm cho khách hàng gọi hotline, nhắn tin Zalo hoặc đặt hàng trực tiếp.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Tự động nạp thông tin từ Hồ sơ tiệm
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Đa phong cách thiết kế theo ngành
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Tích hợp xuất mã QR (Công cụ 12)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
