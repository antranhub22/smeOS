"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSwitchToInstantTrial: () => void
}

export function LoginForm({ onSwitchToSignup, onSwitchToInstantTrial }: LoginFormProps) {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loi, setLoi] = useState<string | null>(null)
  const [dangGui, setDangGui] = useState(false)
  const [hienThongBaoQuenMatKhau, setHienThongBaoQuenMatKhau] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoi(null)
    setDangGui(true)
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoi(data?.error?.message ?? "Đăng nhập thất bại — vui lòng kiểm tra lại tài khoản hoặc mật khẩu")
        return
      }
      router.push("/")
      router.refresh()
    } catch {
      setLoi("Không kết nối được máy chủ — vui lòng kiểm tra kết nối mạng")
    } finally {
      setDangGui(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {loi && (
        <div className="rounded-xl border-[1.5px] border-danger/30 bg-danger/10 px-3.5 py-2.5 text-body-sm font-medium text-danger">
          {loi}
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
            placeholder="Nhập mật khẩu"
            required
            autoComplete="current-password"
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

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setHienThongBaoQuenMatKhau((v) => !v)}
            className="text-body-sm font-semibold text-primary hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        {hienThongBaoQuenMatKhau && (
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-alt px-2.5 py-2">
            <Info size={13} strokeWidth={1.8} className="mt-0.5 flex-shrink-0 text-text-muted" />
            <div className="flex-1 text-caption leading-snug text-text-muted">
              Bản hiện tại chưa hỗ trợ tự khôi phục mật khẩu — liên hệ quản trị hệ thống để được hỗ trợ.
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="mt-1.5 w-full" disabled={dangGui}>
        {dangGui ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>

      <div className="my-1 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border" />
        <div className="text-xs text-text-muted">hoặc</div>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center text-body-sm text-text-muted">
        <div>
          Muốn thử trước?{" "}
          <button
            type="button"
            onClick={onSwitchToInstantTrial}
            className="font-bold text-primary hover:underline"
          >
            ⚡ Trải nghiệm ngay (Không cần mật khẩu)
          </button>
        </div>
        <div>
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-accent-text hover:underline"
          >
            Đăng ký tài khoản mới
          </button>
        </div>
      </div>
    </form>
  )
}
