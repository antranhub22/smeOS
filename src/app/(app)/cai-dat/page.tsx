"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  Store,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Save,
  CreditCard,
  ShieldCheck,
  Cpu,
  Share2,
  Bell,
  Sparkles,
} from "lucide-react"
import { useSession } from "@/lib/session"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { LoadMockDataButton } from "@/components/profiles/load-mock-data-button"
import { DispatchReminderPolicyCard } from "@/components/coordinator/dispatch-reminder-policy-card"
import { ModelChangeCard } from "@/components/organization/model-change-card"
import { calculateReadinessScore } from "@/modules/field-platform/domain/readiness-score-engine"
import Link from "next/link"
import type { Route } from "next"

type SettingsTab = "GENERAL" | "PAYMENT_POLICY" | "AI_INTEGRATION" | "COORDINATION"

export default function CaiDatTiemPage() {
  const { orgName, can } = useSession()
  const canEdit = can("F2") || can("H4")

  const {
    business,
    loading,
    saving,
    error,
    successMessage,
    saveBusiness,
  } = useTenantProfile()

  const [activeTab, setActiveTab] = useState<SettingsTab>("GENERAL")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [openingHours, setOpeningHours] = useState("07:30 - 21:30")
  const [formDirty, setFormDirty] = useState(false)

  useEffect(() => {
    if (business) {
      setDisplayName(business.display_name || "")
      setPhone(business.phone || "")
      setAddress(business.address || "")
      const hours = business.operating_hours as { regular?: string } | null
      if (hours?.regular) {
        setOpeningHours(hours.regular)
      }
    }
  }, [business])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!business) return

    const ok = await saveBusiness({
      legal_name: business.legal_name,
      display_name: displayName.trim() || orgName || "Cửa Hàng",
      phone: phone.trim() || null,
      email: business.email,
      address: address.trim() || null,
      website: business.website,
      social_links: business.social_links,
      tax_code: business.tax_code,
      description: business.description,
      operating_hours: { regular: openingHours.trim() },
    })

    if (ok) {
      setFormDirty(false)
    }
  }

  // Calculate live Readiness Score based on current inputs
  const readiness = calculateReadinessScore({
    targetStage: "G1",
    fields: [
      { fieldKey: "core.org.store_name", isPopulated: Boolean(displayName.trim()), isValid: true, isFresh: true },
      { fieldKey: "core.org.hotline_phone", isPopulated: Boolean(phone.trim()), isValid: true, isFresh: true },
      { fieldKey: "core.org.store_address", isPopulated: Boolean(address.trim()), isValid: true, isFresh: true },
      { fieldKey: "core.finance.bank_account_number", isPopulated: Boolean(business?.phone), isValid: true, isFresh: true },
    ],
    consistencyChecks: [
      { checkId: "CHK_HOURS", description: "Giờ hoạt động đã định cấu hình", passed: Boolean(openingHours.trim()) },
    ],
    approvalItems: [
      { itemId: "R1_POLICY", isApproved: true },
    ],
  })

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* 1. Header & Readiness Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-border bg-surface shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-text">Cài Đặt Cửa Hàng</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={11} /> Inputs SSOT v2.1
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Quản lý thông số nền tảng, thanh toán, chính sách dịch vụ và kết nối hệ thống.
          </p>
        </div>

        {/* Readiness Score Progress Pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-background border border-border shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Độ sẵn sàng (G1)</span>
            <span className="text-xs font-black text-text">{readiness.totalScore} / 100 điểm</span>
          </div>
          <div className="w-16 h-2 bg-surface-alt rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full transition-all duration-500 ${readiness.totalScore >= 90 ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${readiness.totalScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Thông báo trạng thái */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs bg-warning-bg text-warning border border-warning/30 rounded-xl">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-xs bg-success-bg text-primary border border-success-border rounded-xl">
          <CheckCircle2 size={15} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Thanh điều hướng ngang (Segmented Tabs) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("GENERAL")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "GENERAL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Store size={15} />
          <span>Thông Tin Cửa Hàng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYMENT_POLICY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "PAYMENT_POLICY"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <CreditCard size={15} />
          <span>Thanh Toán & Chính Sách</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AI_INTEGRATION")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "AI_INTEGRATION"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Cpu size={15} />
          <span>Trợ Lý AI & Kênh Kết Nối</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COORDINATION")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "COORDINATION"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Bell size={15} />
          <span>Vận Hành & Điều Phối</span>
        </button>
      </div>

      {/* 3. Nội dung chi tiết theo từng Tab */}

      {/* TAB 1: THÔNG TIN CƠ BẢN */}
      {activeTab === "GENERAL" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-text flex items-center gap-2">
                  <Store size={18} className="text-primary" /> Thông số cơ bản (L1 Master)
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Tự động đồng bộ lên hóa đơn, ấn phẩm A6 in ấn và tin nhắn gửi khách hàng.
                </p>
              </div>
              {canEdit && (
                <div className="shrink-0">
                  <LoadMockDataButton />
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-4">
                <SkeletonBlock lines={4} label="Đang tải thông tin cửa hàng..." />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tên cơ sở */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Store size={13} className="text-text-muted" /> Tên cơ sở kinh doanh
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value)
                        setFormDirty(true)
                      }}
                      disabled={!canEdit || saving}
                      placeholder="Ví dụ: Tiệm Nắng Sài Gòn"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
                      required
                    />
                  </div>

                  {/* Lĩnh vực hoạt động */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-text-muted" /> Ngành nghề kinh doanh
                      </span>
                      <span className="inline-flex items-center gap-1 text-caption font-semibold text-text-muted bg-surface-alt px-2 py-0.5 rounded-full border border-border">
                        Đa ngành SSOT
                      </span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Hệ thống tự thích ứng theo ngành đã chọn"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-alt text-text-muted opacity-80 cursor-not-allowed"
                    />
                  </div>

                  {/* Hotline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Phone size={13} className="text-text-muted" /> Hotline / Zalo đặt hàng
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setFormDirty(true)
                      }}
                      disabled={!canEdit || saving}
                      placeholder="Ví dụ: 0908 123 456"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  {/* Giờ mở cửa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Clock size={13} className="text-text-muted" /> Giờ hoạt động
                    </label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => {
                        setOpeningHours(e.target.value)
                        setFormDirty(true)
                      }}
                      disabled={!canEdit || saving}
                      placeholder="Ví dụ: 07:30 - 21:30"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <MapPin size={13} className="text-text-muted" /> Địa chỉ cửa hàng
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value)
                        setFormDirty(true)
                      }}
                      disabled={!canEdit || saving}
                      placeholder="Ví dụ: 124 Nguyễn Đình Chiểu, P. Đa Kao, Q.1, TP.HCM"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={saving || !formDirty}
                      className="text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <Save size={13} />
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Mô hình chuỗi / cửa hàng */}
          <ModelChangeCard />
        </div>
      )}

      {/* TAB 2: THANH TOÁN & CHÍNH SÁCH */}
      {activeTab === "PAYMENT_POLICY" && (
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-primary" /> Hồ Sơ & Chính Sách Bán Hàng
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Cài đặt tài khoản nhận tiền, tỷ lệ cọc, mã ưu đãi và quy định hoàn hủy theo chuẩn kế thừa.
            </p>
            <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-text">Hồ sơ thanh toán, mã voucher & cam kết</div>
                <div className="text-caption text-text-muted">Quản lý sâu tại phân hệ Hồ sơ cửa hàng</div>
              </div>
              <Link
                href={"/ho-so" as Route}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Mở Hồ Sơ & Chính Sách
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRỢ LÝ AI & KÊNH KẾT NỐI */}
      {activeTab === "AI_INTEGRATION" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Cpu size={18} />
              </div>
              <h3 className="text-sm font-bold text-text">Thiết Lập Trợ Lý AI</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Quản lý các đề xuất của AI (Proposal Mode), bảo vệ thông tin PII và cài đặt giới hạn chi phí.
              </p>
            </div>
            <Link
              href={"/cai-dat-ai" as Route}
              className="mt-4 px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-text text-center hover:bg-surface-alt transition-colors"
            >
              Mở Cấu Hình AI
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Share2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-text">Kết Nối Mạng Xã Hội</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Đồng bộ tự động sản phẩm và bài đăng lên Facebook, Instagram, TikTok và Zalo OA.
              </p>
            </div>
            <Link
              href={"/ket-noi" as Route}
              className="mt-4 px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-text text-center hover:bg-surface-alt transition-colors"
            >
              Kết Nối Kênh
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: VẬN HÀNH & ĐIỀU PHỐI */}
      {activeTab === "COORDINATION" && (
        <div className="flex flex-col gap-6">
          <DispatchReminderPolicyCard canEdit={can("R12")} />
        </div>
      )}
    </div>
  )
}
