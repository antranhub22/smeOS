"use client"

import { useI18n } from "@/lib/i18n"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Palette,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Gift,
  FileText,
} from "lucide-react"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { ModelChangeCard } from "@/components/organization/model-change-card"
import { calculateReadinessScore } from "@/modules/field-platform/domain/readiness-score-engine"
import { StorePaymentMethodsEditor } from "@/components/profiles/store-payment-methods-editor"
import { PaymentPolicySection } from "@/components/profiles/payment-policy-section"
import { DepositLevelsSection } from "@/components/profiles/deposit-levels-section"
import { PriceBudgetsSection } from "@/components/profiles/price-budgets-section"
import { StorePoliciesEditor } from "@/components/profiles/store-policies-editor"
import { BrandProfileForm } from "@/components/profiles/brand-profile-form"
import { BusinessProfileForm } from "@/components/profiles/business-profile-form"
import { OccasionsSettingsForm } from "@/components/organization/occasions-settings-form"
import { BrochureFlowSettingsTab } from "@/components/organization/brochure-flow-settings-tab"
import { AiChannelsSettingsTab } from "@/components/organization/ai-channels-settings-tab"
import { SettingsTabsNav, type SettingsTab } from "@/components/organization/settings-tabs-nav"
import { BROCHURE_PAYMENT_SETTINGS_KEY } from "@/modules/greeting-card/domain/brochure-commerce-rules"
import {
  parseStorePolicies,
  STORE_POLICIES_SETTINGS_KEY,
  type StorePoliciesConfig,
} from "@/modules/greeting-card/domain/store-policy"
import { useApi, apiSend } from "@/components/greeting-card/greeting-api"

import { ChainCollectionProfileManager } from "@/components/organization/chain-collection-profile-manager"

const VALID_TABS: SettingsTab[] = [
  "INFO",
  "BRANDING",
  "PAYMENT",
  "DEPOSIT",
  "PROMOTIONS",
  "COMMITMENTS",
  "AGREEMENTS",
  "BROCHURE_FLOW",
  "AI_CHANNELS",
  "COLLECTION_PROFILE",
]

function CaiDatTiemContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as SettingsTab | null

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) return tabParam
    return "INFO"
  })

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const {
    business,
    brand,
    loading,
    saving,
    error,
    successMessage,
    saveBusiness,
    saveBrand,
  } = useTenantProfile()

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

  // Calculate live Readiness Score based on current inputs
  const configuredBank = Boolean(
    (org.data?.settings?.[BROCHURE_PAYMENT_SETTINGS_KEY] as Record<string, unknown> | undefined)?.account_no
  )
  const hasStoreName = Boolean(business?.display_name?.trim())
  const hasPhone = Boolean(business?.phone?.trim())
  const hasAddress = Boolean(business?.address?.trim())
  const hasTaxOrLegal = Boolean(business?.legal_name?.trim() || business?.tax_code?.trim())

  const readiness = calculateReadinessScore({
    targetStage: "G1",
    fields: [
      { fieldKey: "core.org.store_name", isPopulated: hasStoreName, isValid: true, isFresh: true },
      { fieldKey: "core.org.hotline_phone", isPopulated: hasPhone, isValid: true, isFresh: true },
      { fieldKey: "core.org.store_address", isPopulated: hasAddress, isValid: true, isFresh: true },
      { fieldKey: "core.finance.bank_account_number", isPopulated: configuredBank, isValid: true, isFresh: true },
    ],
    consistencyChecks: [
      { checkId: "CHK_TAX_LEGAL", description: "Đã có thông tin pháp lý hoặc mã số thuế", passed: hasTaxOrLegal },
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
            <h1 className="text-lg font-extrabold text-text">Hồ Sơ & Cài Đặt Cửa Hàng</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={11} /> Trung Tâm Cấu Hình Tập Trung
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Một nơi duy nhất để thiết lập toàn bộ thông số: pháp lý, thương hiệu, thanh toán, ưu đãi, quy trình và tự động hóa.
          </p>
        </div>

        {/* Readiness Score Progress Pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface-alt border border-border shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">Độ sẵn sàng (G1)</span>
            <span className="text-body-sm font-black text-text">{readiness.totalScore} / 100 điểm</span>
          </div>
          <div className="w-16 h-2 bg-surface rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full transition-all duration-500 ${readiness.totalScore >= 90 ? "bg-success" : "bg-primary"}`}
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

      {/* 2. Thanh Tabs All-In-One */}
      <SettingsTabsNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        policyCounts={{
          promotions: policies?.promotions.length ?? 0,
          commitments: policies?.commitments.length ?? 0,
          agreements: policies?.agreements.length ?? 0,
        }}
      />

      {/* 3. Nội dung chi tiết từng mục */}

      {/* MỤC 1: THÔNG TIN TIỆM & PHÁP LÝ */}
      {activeTab === "INFO" && (
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="p-6 rounded-2xl border border-border bg-surface">
              <SkeletonBlock lines={5} label="Đang tải thông tin cửa hàng..." />
            </div>
          ) : (
            <BusinessProfileForm
              initialData={business}
              onSave={saveBusiness}
              saving={saving}
            />
          )}

          <ModelChangeCard />
        </div>
      )}

      {/* MỤC 2: NHẬN DIỆN THƯƠNG HIỆU */}
      {activeTab === "BRANDING" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <Palette size={18} className="text-primary" /> Nhận Diện Thương Hiệu & Logo
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Cài đặt màu sắc chủ đạo, logo thương hiệu, slogan và phong cách hiển thị.
            </p>
            <BrandProfileForm initialData={brand} onSave={saveBrand} saving={saving} />
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-primary" /> Sự Kiện & Dịp Kích Cầu
            </h2>
            <OccasionsSettingsForm />
          </div>
        </div>
      )}

      {/* MỤC 3: CƠ CHẾ NHẬN THANH TOÁN & ĐỐI SOÁT */}
      {activeTab === "PAYMENT" && (
        <div className="flex flex-col gap-6">
          <StorePaymentMethodsEditor />
        </div>
      )}

      {/* MỤC 4: ĐẶT CỌC, THANH TOÁN & DẢI GIÁ */}
      {activeTab === "DEPOSIT" && (
        <div className="flex flex-col gap-6">
          <PaymentPolicySection />
          <DepositLevelsSection />
          <PriceBudgetsSection />
        </div>
      )}

      {/* MỤC 5: ƯU ĐÃI & KHUYẾN MÃI */}
      {activeTab === "PROMOTIONS" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <Gift size={18} className="text-primary" /> Danh Mục Ưu Đãi (Voucher & Quà Tặng)
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Khách hàng được chọn 01 ưu đãi khi mở liên kết Thẻ Chào hoặc Đặt hàng trực tiếp.
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

      {/* MỤC 6: CAM KẾT CHẤT LƯỢNG */}
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

      {/* MỤC 7: THỎA THUẬN ĐẶT HÀNG */}
      {activeTab === "AGREEMENTS" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
              <FileText size={18} className="text-primary" /> Thỏa Thuận & Quy Định Khi Đặt Hàng
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Các điều khoản cần khách hàng đọc và đồng ý trước khi chốt đơn (thay thế nguyên liệu theo mùa, phụ thu...).
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

      {/* MỤC 8: CƠ CHẾ THẺ CHÀO & QUY TRÌNH DUYỆT ĐƠN */}
      {activeTab === "BROCHURE_FLOW" && <BrochureFlowSettingsTab />}

      {/* MỤC 9: TRỢ LÝ AI & KÊNH MẠNG XÃ HỘI */}
      {activeTab === "AI_CHANNELS" && <AiChannelsSettingsTab />}

      {/* MỤC 10: DANH MỤC THU THẬP CHUỖI (§9.5.8) */}
      {activeTab === "COLLECTION_PROFILE" && <ChainCollectionProfileManager />}
    </div>
  )
}

export default function CaiDatTiemPage() {
  const { t } = useI18n()
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-5xl mx-auto w-full">
          <SkeletonBlock lines={4} label="Đang tải Hồ sơ & Cài đặt..." />
        </div>
      }
    >
      <CaiDatTiemContent />
    </Suspense>
  )
}
