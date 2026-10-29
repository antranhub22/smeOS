import React from "react"
import { Globe, CheckCircle2 } from "lucide-react"

export function LandingGuidanceCard() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary-muted/20 p-4 md:p-5 text-text">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
          <Globe className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-primary">
              Trang giới thiệu cửa hàng hoặc chuỗi, có link chia sẻ riêng
            </h2>
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
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Xuất mã QR để in hoặc gửi khách
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
