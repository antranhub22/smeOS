"use client"

// Trang đăng nhập — gọi API đăng nhập thật (POST /api/v1/auth/login).
// Thành công: server cấp cookie phiên + cookie floraos_sso, rồi điều hướng
// sang Dashboard ("/"). Thất bại: hiện đúng thông báo lỗi server trả về.
//
// "Dùng thử miễn phí" trước đây là liên kết chết — nay chuyển hẳn form sang
// chế độ đăng ký, gọi thẳng POST /api/v1/auth/signup (đã có sẵn, tạo tổ
// chức EXPERIENCE + credit dùng thử). "Quên mật khẩu?" chưa có luồng khôi
// phục thật ở bản này (P12, xem TECHNICAL_DEBT.md) — bấm vào hiện thông báo
// rõ ràng thay vì im lặng không làm gì.

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Info, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listAllIndustries, getIndustryDefinition, DEFAULT_INDUSTRY } from "@/modules/organization/domain/industry-profile"

type CheDo = "dang-nhap" | "dang-ky"

export default function DangNhapPage() {
  const router = useRouter()
  const [cheDo, setCheDo] = useState<CheDo>("dang-nhap")
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [ten, setTen] = useState("")
  const [tenToChuc, setTenToChuc] = useState("")
  const [industryKey, setIndustryKey] = useState<string>(DEFAULT_INDUSTRY)
  const [loi, setLoi] = useState<string | null>(null)
  const [dangGui, setDangGui] = useState(false)
  const [hienThongBaoQuenMatKhau, setHienThongBaoQuenMatKhau] = useState(false)

  const allIndustries = listAllIndustries()
  const selectedIndDef = getIndustryDefinition(industryKey)

  const getIndustryPlaceholder = (ind: string) => {
    switch (ind) {
      case "FASHION":
        return "Ví dụ: Thời Trang Thiết Kế Lin Boutique"
      case "FNB":
        return "Ví dụ: Tiệm Bánh & Cà Phê Mùa Hạ"
      case "CRAFT_GIFT":
        return "Ví dụ: Gốm Mộc & Quà Tặng An Nhiên"
      case "RETAIL_GENERAL":
        return "Ví dụ: Siêu Thị Tiện Lợi Gia Hưng"
      case "SERVICES":
        return "Ví dụ: Spa & Viện Chăm Sóc Sắc Đẹp Mộc Lan"
      case "FLORAL":
      default:
        return "Ví dụ: Tiệm Hoa Tươi Thảo Mộc"
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoi(null)
    setDangGui(true)
    try {
      const dangKy = cheDo === "dang-ky"
      const res = await fetch(`/api/v1/auth/${dangKy ? "signup" : "login"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          dangKy
            ? { email, password, name: ten || null, organization_name: tenToChuc, industry_key: industryKey }
            : { email, password }
        ),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoi(data?.error?.message ?? (dangKy ? "Đăng ký thất bại — thử lại sau" : "Đăng nhập thất bại — thử lại sau"))
        return
      }
      router.push("/")
      router.refresh()
    } catch {
      setLoi("Không kết nối được máy chủ — kiểm tra lại server có đang chạy không")
    } finally {
      setDangGui(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-bg px-[20px] sm:px-[30px] py-9">
      <svg width="260" height="260" viewBox="0 0 260 260" className="pointer-events-none absolute -right-24 -top-24 opacity-50">
        <circle cx="130" cy="130" r="130" fill="var(--color-flora-leaf)" />
      </svg>

      <div className={`mx-auto flex w-full ${cheDo === "dang-ky" ? "max-w-xl" : "max-w-sm"} flex-col gap-8 transition-all duration-300`}>
        <div className="flex flex-col items-center gap-3">
          <svg width="52" height="52" viewBox="0 0 100 100">
            <path d="M50,50 C48.5,45 41.5,38 50,32 C58.5,38 51.5,45 50,50 Z" fill="var(--color-flora-petal)" transform="rotate(258 50 50)" />
            <path d="M50,50 C47,40 33,26 50,14 C67,26 53,40 50,50 Z" fill="var(--color-flora-green)" />
            <path d="M50,50 C47,40 33,26 50,14 C67,26 53,40 50,50 Z" fill="var(--color-flora-sage)" transform="rotate(140 50 50)" />
            <circle cx="50" cy="50" r="3" fill="var(--color-flora-green)" />
          </svg>
          <div className="text-display-xl font-extrabold tracking-tight text-primary">smeOS</div>
          <div className="text-center text-body text-text-muted">
            {cheDo === "dang-ky"
              ? "Đăng ký thiết lập không gian vận hành cho doanh nghiệp của bạn"
              : "Hệ điều hành vận hành & quản trị Doanh nghiệp Vừa và Nhỏ"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <ThongBaoThietBiKhac />
          </Suspense>
          {loi && (
            <div className="rounded-xl border-[1.5px] border-danger/30 bg-danger/10 px-3.5 py-2.5 text-body-sm font-medium text-danger">
              {loi}
            </div>
          )}

          {cheDo === "dang-ky" && (
            <div className="rounded-2xl border-2 border-primary/20 bg-surface p-4 sm:p-5 shadow-xs space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-body-sm font-bold text-text">
                    1. Chọn lĩnh vực hoạt động của bạn <span className="text-danger">*</span>
                  </div>
                  <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedIndDef.name}
                  </span>
                </div>
                <div className="text-caption text-text-muted mb-3">
                  Giao diện, danh mục sản phẩm, mẫu in ấn và trợ lý AI sẽ tự động kích hoạt theo đúng ngành này khi bạn đăng nhập
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {allIndustries.map((ind) => {
                    const isSelected = ind.key === industryKey
                    return (
                      <button
                        key={ind.key}
                        type="button"
                        onClick={() => setIndustryKey(ind.key)}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                            : "border-border bg-surface-alt/60 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-body-sm font-bold text-text">{ind.name}</span>
                          {isSelected && <Check size={14} className="text-primary font-bold" />}
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                          {ind.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <div className="text-body-sm font-bold text-text">
                  2. Thông tin cơ sở kinh doanh
                </div>

                <div>
                  <div className="mb-1.5 text-body-sm font-semibold">
                    Tên cơ sở / thương hiệu <span className="text-danger">*</span>
                  </div>
                  <input
                    type="text"
                    value={tenToChuc}
                    onChange={(e) => setTenToChuc(e.target.value)}
                    placeholder={getIndustryPlaceholder(industryKey)}
                    required
                    className="h-[46px] w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <div className="mb-1.5 text-body-sm font-semibold">Họ tên người điều hành (tuỳ chọn)</div>
                  <input
                    type="text"
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="h-[46px] w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="mb-1.5 text-body-sm font-semibold">
              Email đăng nhập <span className="text-danger">*</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@cuahang.vn"
              required
              autoComplete="username"
              className="h-[46px] w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <div className="mb-1.5 text-body-sm font-semibold">
              Mật khẩu <span className="text-danger">*</span>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                required
                autoComplete={cheDo === "dang-ky" ? "new-password" : "current-password"}
                className="h-[46px] w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 pr-11 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-1.5 top-1.5 flex h-[34px] w-[34px] items-center justify-center text-text-muted"
              >
                {showPw ? <EyeOff size={19} strokeWidth={1.8} /> : <Eye size={19} strokeWidth={1.8} />}
              </button>
            </div>
            {cheDo === "dang-nhap" && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHienThongBaoQuenMatKhau((v) => !v)}
                  className="text-body-sm font-semibold text-primary"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}
            {hienThongBaoQuenMatKhau && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-alt px-2.5 py-2">
                <Info size={13} strokeWidth={1.8} className="mt-0.5 flex-shrink-0 text-text-muted" />
                <div className="flex-1 text-caption leading-snug text-text-muted">
                  Bản hiện tại chưa hỗ trợ tự khôi phục mật khẩu — liên hệ quản trị hệ thống để được đặt lại.
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="mt-1.5 w-full" disabled={dangGui}>
            {dangGui
              ? cheDo === "dang-ky"
                ? "Đang khởi tạo không gian kinh doanh…"
                : "Đang đăng nhập…"
              : cheDo === "dang-ky"
                ? `Đăng ký & Vào ngay không gian ${selectedIndDef.name}`
                : "Đăng nhập"}
          </Button>

          <div className="my-1 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-border" />
            <div className="text-xs text-text-muted">hoặc</div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="text-center text-body text-text-muted">
            {cheDo === "dang-nhap" ? (
              <>
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCheDo("dang-ky")
                    setLoi(null)
                  }}
                  className="font-bold text-accent"
                >
                  Dùng thử miễn phí
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCheDo("dang-nhap")
                    setLoi(null)
                  }}
                  className="font-bold text-accent"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <div className="pb-1 pt-9 text-center text-caption text-text-muted/70">
        © smeOS — Hệ điều hành vận hành & quản trị Doanh nghiệp Vừa và Nhỏ
      </div>
    </div>
  )
}

/** Bị đẩy về đây vì tài khoản vừa đăng nhập ở thiết bị khác (một tài khoản chỉ một phiên). */
function ThongBaoThietBiKhac() {
  const params = useSearchParams()
  if (params.get("ly-do") !== "thiet-bi-khac") return null
  return (
    <div role="alert" className="rounded-xl border-[1.5px] border-warning/30 bg-warning/10 px-3.5 py-2.5 text-body-sm font-medium text-warning">
      Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác nên phiên ở đây đã kết thúc. Nếu
      đó không phải bạn, hãy đăng nhập lại và đổi mật khẩu.
    </div>
  )
}
