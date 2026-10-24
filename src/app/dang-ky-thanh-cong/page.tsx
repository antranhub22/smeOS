import Link from "next/link"
import { CheckCircle2, Clock, Mail } from "lucide-react"

export const metadata = {
  title: "Đăng ký thành công — Chờ xét duyệt | smeOS",
  description: "Đơn đăng ký tài khoản của bạn đang được xem xét. Chúng tôi sẽ thông báo qua email khi được duyệt.",
}

/**
 * Trang xác nhận sau khi đăng ký — public, không cần auth.
 * Hiển thị thông báo chờ Super Admin duyệt.
 */
export default function DangKyThanhCongPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40 px-4 py-12">
      <div className="w-full max-w-[460px] space-y-6">
        {/* Card chính */}
        <div className="rounded-2xl border border-border bg-white shadow-lg p-8 text-center space-y-5">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 mx-auto">
            <CheckCircle2 className="text-emerald-500" size={32} strokeWidth={1.8} />
          </div>

          {/* Tiêu đề */}
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1.5">
              Đăng ký thành công!
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Đơn đăng ký của bạn đã được ghi nhận. Chúng tôi đang xem xét và sẽ liên hệ
              qua email trong vòng <strong className="text-gray-700">24–48 giờ</strong>.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Bước tiếp theo */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="mt-0.5 shrink-0">
                <Clock size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800">Chờ xét duyệt</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Nhóm vận hành sẽ kiểm tra thông tin và kích hoạt tài khoản của bạn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="mt-0.5 shrink-0">
                <Mail size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">Kiểm tra hộp thư</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  Khi được duyệt, chúng tôi sẽ thông báo đến email bạn đã đăng ký.
                  Sau đó bạn có thể đăng nhập bình thường.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Link đăng nhập */}
        <p className="text-center text-sm text-gray-500">
          Đã được duyệt?{" "}
          <Link
            href="/dang-nhap"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>

        {/* Branding */}
        <p className="text-center text-xs text-gray-400">
          smeOS Platform · Giai đoạn thử nghiệm (Beta)
        </p>
      </div>
    </main>
  )
}
