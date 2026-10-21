"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  Settings,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Store,
  Save,
} from "lucide-react"
import { useSession } from "@/lib/session"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { DispatchReminderPolicyCard } from "@/components/coordinator/dispatch-reminder-policy-card"
import { LoadMockDataButton } from "@/components/profiles/load-mock-data-button"
import { SettingsSubsystemGrid } from "@/components/organization/settings-subsystem-grid"
import { ModelChangeCard } from "@/components/organization/model-change-card"
import { useI18n } from "@/lib/i18n"

export default function CaiDatTiemPage() {
  const { orgName, can, organizationType } = useSession()
  const { dict } = useI18n()
  const canEdit = can("F2") || can("H4") // Quyền chỉnh sửa hồ sơ / điều hành

  const {
    business,
    loading,
    saving,
    error,
    successMessage,
    saveBusiness,
  } = useTenantProfile()

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
      display_name: displayName.trim() || orgName || "Cửa Hàng Hoa",
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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* 1. Hướng dẫn chuẩn hóa K1 */}
      <FeatureGuidanceCard
        badgeLabel={dict.settings.header.guidanceBadge}
        badgeIcon={Settings}
        title={dict.settings.header.guidanceTitle}
        titleIcon={Store}
        description="Chỉnh sửa tên cửa hàng, hotline, địa chỉ và giờ mở cửa. Những thông tin này tự động đồng bộ sang thẻ chào khách và tin nhắn Zalo."
        tips={[
          "⚡ Tên cửa hàng, hotline và địa chỉ đồng bộ sang Thẻ chào A6 và tin nhắn Zalo",
          "🔒 Thiết lập AI và kết nối mạng xã hội chỉ dành cho tài khoản Điều hành",
          "🌐 Liên kết tài khoản mạng xã hội để đăng bài tự động đa kênh",
        ]}
      />

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

      {/* 2. Lưới liên kết sâu đến các phân hệ thiết lập */}
      <SettingsSubsystemGrid />

      {/* 3. Form chỉnh sửa nhanh thông số cơ bản tại chỗ */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-text flex items-center gap-2">
              <Store size={18} className="text-primary" /> Thông tin cơ bản của cửa hàng
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Các trường thông tin dưới đây áp dụng tức thì cho hóa đơn, phiếu cắm hoa và kịch bản tư vấn.
            </p>
          </div>
          {canEdit && organizationType === "EXPERIENCE" && (
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
              {/* Tên cửa hàng */}
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

              {/* Lĩnh vực hoạt động (Khóa & Phí mở khóa) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-text-muted" /> Lĩnh vực hoạt động
                  </span>
                  <span className="inline-flex items-center gap-1 text-caption font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                    🔒 Đang khóa
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="Hoa & Cây cảnh (Đã thiết lập ban đầu)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-alt text-text-muted opacity-80 cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-caption">
                  <span className="text-text-muted">Chuyển đổi sang Thời trang, F&B hoặc Bán lẻ cần điều chỉnh dữ liệu.</span>
                  <button
                    type="button"
                    onClick={() => alert("Yêu cầu chuyển đổi ngành nghề: Vui lòng thanh toán phí chuyển đổi hệ thống (500.000 VNĐ) để mở khóa chuyển ngành.")}
                    className="font-bold text-primary hover:underline"
                  >
                    Mở khóa chuyển ngành (Có phí)
                  </button>
                </div>
              </div>

              {/* Hotline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Phone size={13} className="text-text-muted" /> Hotline / Zalo đặt hoa
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

              {/* Địa chỉ */}
              <div className="space-y-1.5">
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

              {/* Giờ mở cửa */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Clock size={13} className="text-text-muted" /> Giờ mở cửa
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => {
                    setOpeningHours(e.target.value)
                    setFormDirty(true)
                  }}
                  disabled={!canEdit || saving}
                  placeholder="Ví dụ: 07:30 - 21:30 (Mở cửa tất cả các ngày)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
              </div>
            </div>

            {/* Nút lưu (K2: 1 primary action duy nhất) */}
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

      {/* 4. Mô hình vận hành doanh nghiệp (1 Cửa hàng vs Chuỗi) */}
      <ModelChangeCard />

      {/* 5. Nhắc Nghiệp Vụ Điều Phối (M0..M5) */}
      <DispatchReminderPolicyCard canEdit={can("R12")} />
    </div>
  )
}
