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
  Cpu,
  Share2,
  Bell,
  Sparkles,
  QrCode,
  ShieldCheck,
  Gift,
  FileText,
  DollarSign,
} from "lucide-react"
import { useSession } from "@/lib/session"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { LoadMockDataButton } from "@/components/profiles/load-mock-data-button"
import { DispatchReminderPolicyCard } from "@/components/coordinator/dispatch-reminder-policy-card"
import { ModelChangeCard } from "@/components/organization/model-change-card"
import { calculateReadinessScore } from "@/modules/field-platform/domain/readiness-score-engine"
import { BrochurePaymentSettings } from "@/components/greeting-card/admin/brochure-payment-settings"
import { PaymentPolicySection } from "@/components/profiles/payment-policy-section"
import { DepositLevelsSection } from "@/components/profiles/deposit-levels-section"
import { PriceBudgetsSection } from "@/components/profiles/price-budgets-section"
import { StorePoliciesEditor } from "@/components/profiles/store-policies-editor"
import {
  parseStorePolicies,
  STORE_POLICIES_SETTINGS_KEY,
  type StorePoliciesConfig,
} from "@/modules/greeting-card/domain/store-policy"
import { useApi, apiSend } from "@/components/greeting-card/greeting-api"
import Link from "next/link"
import type { Route } from "next"

// Flat, clear categories for settings
type SettingsTab =
  | "INFO"          // Thông tin tiệm
  | "PAYMENT"       // Tài khoản & VietQR
  | "PROMOTIONS"    // Ưu đãi & Giảm giá
  | "COMMITMENTS"   // Cam kết chất lượng
  | "AGREEMENTS"    // Thỏa thuận đặt hàng
  | "DEPOSIT"       // Mức đặt cọc & Giá
  | "AI_CHANNELS"   // AI & Mạng xã hội
  | "OPERATIONS"    // Vận hành điều phối

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

  const [activeTab, setActiveTab] = useState<SettingsTab>("INFO")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [openingHours, setOpeningHours] = useState("07:30 - 21:30")
  const [formDirty, setFormDirty] = useState(false)

  // API load policies
  const org = useApi<{ settings?: Record<string, unknown> | null }>("/api/v1/organizations/current")
  const [savingPolicies, setSavingPolicies] = useState(false)
  const industryKey = typeof org.data?.settings?.industry === "string" ? org.data.settings.industry : null
  const policies = org.data ? parseStorePolicies(org.data.settings, industryKey) : null

  async function handleSavePolicies(updatedPolicies: StorePoliciesConfig): Promise<boolean> {
    setSavingPolicies(true)
    try {
      await apiSend(
        "/api/v1/organizations/current",
        "PATCH",
        {
          settings: {
            [STORE_POLICIES_SETTINGS_KEY]: updatedPolicies,
          },
        },
        "Không lưu được chính sách & cam kết"
      )
      await org.mutate()
      return true
    } catch {
      return false
    } finally {
      setSavingPolicies(false)
    }
  }

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
            Trung tâm quản lý phẳng: chọn trực tiếp mục bạn muốn thiết lập bên dưới.
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

      {/* 2. Thanh Tabs phẳng tách rời hoàn toàn từng mục riêng biệt */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("INFO")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "INFO"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Store size={15} />
          <span>1. Thông Tin Tiệm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYMENT")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "PAYMENT"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <QrCode size={15} />
          <span>2. Tài Khoản & VietQR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROMOTIONS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "PROMOTIONS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Gift size={15} />
          <span>3. Ưu Đãi ({policies?.promotions.length ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMMITMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "COMMITMENTS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <ShieldCheck size={15} />
          <span>4. Cam Kết ({policies?.commitments.length ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AGREEMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "AGREEMENTS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <FileText size={15} />
          <span>5. Thỏa Thuận ({policies?.agreements.length ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DEPOSIT")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "DEPOSIT"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <DollarSign size={15} />
          <span>6. Đặt Cọc & Giá</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AI_CHANNELS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "AI_CHANNELS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Cpu size={15} />
          <span>7. Trợ Lý AI & Mạng Xã Hội</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("OPERATIONS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "OPERATIONS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-text-muted hover:text-text hover:bg-background"
          }`}
        >
          <Bell size={15} />
          <span>8. Vận Hành</span>
        </button>
      </div>

      {/* 3. Nội dung chi tiết hiển thị phẳng theo mục đang chọn */}

      {/* MỤC 1: THÔNG TIN TIỆM */}
      {activeTab === "INFO" && (
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

                  {/* Ngành nghề */}
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
                      {saving ? "Đang lưu..." : "Lưu thông tin"}
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>

          <ModelChangeCard />
        </div>
      )}

      {/* MỤC 2: TÀI KHOẢN NGÂN HÀNG & VIETQR */}
      {activeTab === "PAYMENT" && (
        <div className="flex flex-col gap-6">
          <BrochurePaymentSettings />
        </div>
      )}

      {/* MỤC 3: ƯU ĐÃI & GIẢM GIÁ */}
      {activeTab === "PROMOTIONS" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <Gift size={18} className="text-primary" /> Danh Mục Ưu Đãi & Khuyến Mãi (Khách chọn khi đặt hàng)
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Cửa hàng có thể thiết lập giảm % đơn hàng, miễn phí vận chuyển hoặc quà tặng kèm.
            </p>

            {policies ? (
              <StorePoliciesEditor
                initialPolicies={policies}
                onSave={handleSavePolicies}
                saving={savingPolicies || org.isLoading}
                initialSection="promo"
                hideSubTabs={true}
              />
            ) : (
              <p className="text-xs text-text-muted py-4">Đang tải danh mục ưu đãi...</p>
            )}
          </div>
        </div>
      )}

      {/* MỤC 4: CAM KẾT CHẤT LƯỢNG */}
      {activeTab === "COMMITMENTS" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-primary" /> Cam Kết Chất Lượng Của Cửa Hàng
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Hiển thị minh bạch với khách hàng: gửi ảnh trước khi giao, cam kết độ tươi mới, đổi trả miễn phí.
            </p>

            {policies ? (
              <StorePoliciesEditor
                initialPolicies={policies}
                onSave={handleSavePolicies}
                saving={savingPolicies || org.isLoading}
                initialSection="commit"
                hideSubTabs={true}
              />
            ) : (
              <p className="text-xs text-text-muted py-4">Đang tải danh mục cam kết...</p>
            )}
          </div>
        </div>
      )}

      {/* MỤC 5: THỎA THUẬN ĐẶT HÀNG */}
      {activeTab === "AGREEMENTS" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <FileText size={18} className="text-primary" /> Thỏa Thuận & Quy Định Khi Đặt Hàng
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Các điều khoản cần khách hàng đọc và đồng ý trước khi chốt đơn (thay thế hoa theo mùa, phụ thu giờ cao điểm...).
            </p>

            {policies ? (
              <StorePoliciesEditor
                initialPolicies={policies}
                onSave={handleSavePolicies}
                saving={savingPolicies || org.isLoading}
                initialSection="agree"
                hideSubTabs={true}
              />
            ) : (
              <p className="text-xs text-text-muted py-4">Đang tải danh mục thỏa thuận...</p>
            )}
          </div>
        </div>
      )}

      {/* MỤC 6: ĐẶT CỌC & GIÁ */}
      {activeTab === "DEPOSIT" && (
        <div className="flex flex-col gap-6">
          <PaymentPolicySection />
          <DepositLevelsSection />
          <PriceBudgetsSection />
        </div>
      )}

      {/* MỤC 7: TRỢ LÝ AI & KÊNH MẠNG XÃ HỘI */}
      {activeTab === "AI_CHANNELS" && (
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

      {/* MỤC 8: VẬN HÀNH & ĐIỀU PHỐI */}
      {activeTab === "OPERATIONS" && (
        <div className="flex flex-col gap-6">
          <DispatchReminderPolicyCard canEdit={can("R12")} />
        </div>
      )}
    </div>
  )
}
