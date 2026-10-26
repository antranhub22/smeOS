"use client"

import React, { useState, useEffect } from "react"
import { Building2, Phone, Mail, MapPin, Globe, Clock, FileText, Check, Store, Lock, Unlock, Sparkles, Database } from "lucide-react"
import type { BusinessProfileDetail } from "@/modules/profiles/use-cases/get-business-profile"
import type { UpsertBusinessProfileInput } from "@/modules/profiles/infra/business-profile-repository"
import { useSession } from "@/lib/session"
import { listAllIndustries, getIndustryDefinition, DEFAULT_INDUSTRY } from "@/modules/organization/domain/industry-profile"
import { AiRewriteInput } from "./ai-rewrite-input"

export interface BusinessProfileFormProps {
  initialData: BusinessProfileDetail | null
  onSave: (data: UpsertBusinessProfileInput) => Promise<boolean>
  saving: boolean
}

export function BusinessProfileForm({ initialData, onSave, saving }: BusinessProfileFormProps) {
  const { organization, capabilities, userEmail } = useSession()
  const isSuperAdmin =
    capabilities.includes("N1") ||
    capabilities.includes("N12") ||
    userEmail === "tuans2@dev.com" ||
    Boolean(userEmail?.endsWith("@dev.com"))
  const isUnlocked = isSuperAdmin || !Boolean(organization?.industryLocked)
  const [selectedIndustry, setSelectedIndustry] = useState<string>(organization?.industry || DEFAULT_INDUSTRY)
  const [industrySaved, setIndustrySaved] = useState<boolean>(false)
  const [loadingMockKey, setLoadingMockKey] = useState<string | null>(null)
  const [autoSeedMockData, setAutoSeedMockData] = useState<boolean>(true)
  const [mockSuccessMsg, setMockSuccessMsg] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [legalName, setLegalName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")
  /** Website khác (mỗi dòng một địa chỉ) — lưu `social_links.websites`, hiện trên trang khách Thẻ chào */
  const [otherWebsites, setOtherWebsites] = useState("")
  const [taxCode, setTaxCode] = useState("")
  const [description, setDescription] = useState("")
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("21:00")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [zaloUrl, setZaloUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentIndDef = getIndustryDefinition(selectedIndustry)

  const getIndustryPlaceholders = (ind: string) => {
    switch (ind) {
      case "FASHION":
        return {
          displayName: "Ví dụ: Thời Trang Thiết Kế Lin Boutique",
          legalName: "Ví dụ: Công ty TNHH Thời Trang Lin Boutique",
          description: "Chuyên may đo, thiết kế đầm tiệc, thời trang công sở và phụ kiện cao cấp",
        }
      case "FNB":
        return {
          displayName: "Ví dụ: Tiệm Bánh & Cafe Mùa Hạ",
          legalName: "Ví dụ: Công ty CP Ẩm Thực Mùa Hạ",
          description: "Chuyên cà phê pha máy, bánh ngọt tươi trong ngày và set quà teabreak sự kiện",
        }
      case "CRAFT_GIFT":
        return {
          displayName: "Ví dụ: Quà Tặng & Gốm Thủ Công An Nhiên",
          legalName: "Ví dụ: Hộ kinh doanh Thủ công mỹ nghệ An Nhiên",
          description: "Chuyên đồ gốm thủ công mộc, nến thơm nghệ thuật và quà tặng doanh nghiệp độc bản",
        }
      case "RETAIL_GENERAL":
        return {
          displayName: "Ví dụ: Siêu Thị Tiện Lợi Bách Hóa Gia Hưng",
          legalName: "Ví dụ: Công ty TNHH Bách Hóa Gia Hưng",
          description: "Chuyên cung cấp lẻ và sỉ hàng tiêu dùng, thực phẩm đóng gói và đồ gia dụng",
        }
      case "SERVICES":
        return {
          displayName: "Ví dụ: Spa & Viện Chăm Sóc Sắc Đẹp Mộc Lan",
          legalName: "Ví dụ: Công ty TNHH Chăm Sóc Sắc Đẹp Mộc Lan",
          description: "Dịch vụ trị liệu da chuyên sâu, thư giãn dưỡng sinh và chăm sóc sắc đẹp",
        }
      case "HOMESTAY":
        return {
          displayName: "Ví dụ: Homestay Villa Mây Sơn",
          legalName: "Ví dụ: Hộ kinh doanh Du lịch Mây Sơn",
          description: "Homestay nguyên căn sân vườn view thung lũng, không gian yên tĩnh nghỉ dưỡng",
        }
      case "FLORAL":
      default:
        return {
          displayName: "Ví dụ: Tiệm Sản Phẩm Thảo Mộc",
          legalName: "Ví dụ: Công ty TNHH Sản Phẩm Việt Nam",
          description: "Chuyên hoa sự kiện, hoa cưới, hoa sinh nhật thiết kế cao cấp",
        }
    }
  }

  const indPlaceholders = getIndustryPlaceholders(selectedIndustry)

  const handleApplyMockData = async (industryKey: string) => {
    setLoadingMockKey(industryKey)
    setMockSuccessMsg(null)
    try {
      const res = await fetch("/api/v1/business-profile/mock-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry_key: industryKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Không thể nạp dữ liệu mẫu")
      }
      const json = await res.json()
      setSelectedIndustry(industryKey)
      setMockSuccessMsg(`Đã nạp thành công Mock Data ngành ${json.data?.industryName || industryKey} (${json.data?.businessName})!`)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi nạp dữ liệu mẫu")
    } finally {
      setLoadingMockKey(null)
    }
  }

  const handleUpdateIndustry = async (newKey: string) => {
    setSelectedIndustry(newKey)
    try {
      const res = await fetch("/api/v1/organizations/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            industry: newKey,
          },
        }),
      })
      if (res.ok) {
        setIndustrySaved(true)
        setTimeout(() => {
          setIndustrySaved(false)
          window.location.reload()
        }, 1000)
      }
    } catch {
      // Bỏ qua lỗi mạng
    }
  }

  const handleSelectIndustry = async (newKey: string) => {
    if (isSuperAdmin && autoSeedMockData) {
      await handleApplyMockData(newKey)
    } else {
      await handleUpdateIndustry(newKey)
    }
  }

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ lại form khi dữ liệu ban đầu (props) đổi, chủ đích
      setDisplayName(initialData.display_name || "")
      setLegalName(initialData.legal_name || "")
      setPhone(initialData.phone || "")
      setEmail(initialData.email || "")
      setAddress(initialData.address || "")
      setWebsite(initialData.website || "")
      setTaxCode(initialData.tax_code || "")
      setDescription(initialData.description || "")

      const hours = initialData.operating_hours as { open?: string; close?: string } | null
      if (hours?.open) setOpenTime(hours.open)
      if (hours?.close) setCloseTime(hours.close)

      const socials = initialData.social_links as { facebook?: string; zalo?: string; instagram?: string; websites?: unknown } | null
      if (Array.isArray(socials?.websites)) setOtherWebsites(socials.websites.filter((w): w is string => typeof w === "string").join("\n"))
      if (socials?.facebook) setFacebookUrl(socials.facebook)
      if (socials?.zalo) setZaloUrl(socials.zalo)
      if (socials?.instagram) setInstagramUrl(socials.instagram)
    }
  }, [initialData])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!displayName.trim()) {
      errs.displayName = "Tên hiển thị cửa hàng không được để trống"
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Định dạng email không hợp lệ"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: UpsertBusinessProfileInput = {
      display_name: displayName.trim(),
      legal_name: legalName.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      website: website.trim() || null,
      tax_code: taxCode.trim() || null,
      description: description.trim() || null,
      operating_hours: {
        open: openTime,
        close: closeTime,
      },
      social_links: {
        facebook: facebookUrl.trim() || null,
        zalo: zaloUrl.trim() || null,
        instagram: instagramUrl.trim() || null,
        websites: otherWebsites.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean).slice(0, 5),
      },
    }

    await onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Khối 0: Ngành nghề kinh doanh & Lĩnh vực hoạt động */}
      <div className="rounded-2xl border-2 border-primary/20 bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text">Lĩnh vực hoạt động / Ngành nghề</h3>
                <span className="text-caption font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {currentIndDef.name}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Định hình giao diện, cấu trúc catalog, định mức nguyên liệu và trợ lý AI phù hợp với mô hình kinh doanh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-bg text-success border border-success/20 text-caption font-bold">
                <Unlock size={13} />
                <span>{isSuperAdmin ? "SuperAdmin (Toàn quyền đổi ngành)" : "Mở khoá đa ngành"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-alt text-text-muted border border-border text-caption font-semibold">
                <Lock size={13} />
                <span>Đã cố định theo đăng ký ban đầu</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Thanh công cụ Mock Data dành cho SuperAdmin */}
          {isSuperAdmin && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-text select-none">
                <input
                  type="checkbox"
                  checked={autoSeedMockData}
                  onChange={(e) => setAutoSeedMockData(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                />
                <span>Tự động nạp Mock Data chuẩn (Tên shop, logo, sản phẩm mẫu) khi click đổi ngành</span>
              </label>

              <button
                type="button"
                disabled={loadingMockKey !== null}
                onClick={() => handleApplyMockData(selectedIndustry)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-xs disabled:opacity-60"
                title={`Nạp đồng bộ toàn bộ tên shop, logo và sản phẩm mẫu cho ngành ${currentIndDef.name}`}
              >
                <Database size={13} className={loadingMockKey === selectedIndustry ? "animate-spin" : ""} />
                <span>
                  {loadingMockKey === selectedIndustry
                    ? "Đang đồng bộ..."
                    : `Đồng bộ Mock Data ${currentIndDef.name}`}
                </span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {listAllIndustries().map((ind) => {
              const isSelected = ind.key === selectedIndustry
              const isLoadingThis = loadingMockKey === ind.key

              return (
                <div
                  key={ind.key}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  onClick={() => {
                    if (isUnlocked && loadingMockKey === null) {
                      handleSelectIndustry(ind.key)
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isUnlocked && loadingMockKey === null) {
                      handleSelectIndustry(ind.key)
                    }
                  }}
                  className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-surface hover:border-primary/40 opacity-80"
                  } ${!isUnlocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <div>
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-body-sm font-bold text-text">{ind.name}</span>
                      {isSelected && <Check size={14} className="text-primary font-bold" />}
                    </div>
                    <p className="text-caption text-text-muted line-clamp-2 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>

                  {isUnlocked && (
                    <div
                      className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between w-full gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] text-text-muted font-medium">Mock Data</span>
                      <button
                        type="button"
                        disabled={loadingMockKey !== null}
                        onClick={() => handleApplyMockData(ind.key)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer disabled:opacity-60"
                        title={`Nạp dữ liệu mẫu cho ngành ${ind.name}`}
                      >
                        <Sparkles size={11} className={isLoadingThis ? "animate-spin" : "text-primary"} />
                        <span>{isLoadingThis ? "Đang nạp..." : "Dùng Mock Data"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {!isUnlocked && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-alt border border-border mt-3">
              <div className="flex items-center gap-2 text-caption text-text-muted">
                <Lock size={14} className="text-warning shrink-0" />
                <span>Ngành nghề được khóa để bảo vệ toàn vẹn dữ liệu mẫu sản phẩm và catalog đã tạo.</span>
              </div>
              <button
                type="button"
                onClick={() => alert("Vui lòng liên hệ quản trị viên smeOS hoặc nâng cấp gói để chuyển đổi mô hình ngành nghề kinh doanh.")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-caption font-bold hover:bg-primary/20 transition-colors shrink-0"
              >
                <span>Mở khóa đổi ngành (Có phí)</span>
              </button>
            </div>
          )}

          {mockSuccessMsg && (
            <p className="text-caption font-bold text-success animate-in fade-in">
              ✓ {mockSuccessMsg} Đang làm mới trang...
            </p>
          )}

          {industrySaved && !mockSuccessMsg && (
            <p className="text-caption font-bold text-success animate-in fade-in">
              ✓ Đã cập nhật ngành nghề thành công! Hệ thống đang tải lại...
            </p>
          )}
        </div>
      </div>

      {/* Khối 1: Thông tin cơ bản & Pháp lý */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Thông tin pháp lý & Nhận diện</h3>
            <p className="text-xs text-text-muted">Tên thương hiệu xuất hiện trên hóa đơn, website và hợp đồng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Tên hiển thị cửa hàng <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={indPlaceholders.displayName}
              className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.displayName ? "border-danger ring-2 ring-danger/10" : "border-border focus:border-primary"
              }`}
            />
            {errors.displayName && (
              <p className="mt-1 text-caption font-medium text-danger">{errors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Tên pháp lý công ty / Hộ kinh doanh
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder={indPlaceholders.legalName}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Mã số thuế (nếu có)
            </label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="0101234567"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <AiRewriteInput
              value={description}
              onChange={setDescription}
              placeholder={indPlaceholders.description}
              fieldType="description"
              label="Mô tả ngắn gọn về cửa hàng"
              helperText="Được AI sử dụng làm bối cảnh chính để giới thiệu cơ sở trên Landing Page và Catalog"
            />
          </div>
        </div>
      </div>

      {/* Khối 2: Thông tin liên hệ & Kênh phân phối */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
            <Phone size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Kênh liên hệ & Nhận đơn hàng</h3>
            <p className="text-xs text-text-muted">Tự động gắn vào Zalo scripts, Thẻ chào hàng A6 và nút bấm E-Catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Hotline / Số Zalo tư vấn chính
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Email chăm sóc khách hàng
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@tiemhoathaomoc.vn"
                className={`w-full rounded-xl border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? "border-danger ring-2 ring-danger/10" : "border-border focus:border-primary"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-caption font-medium text-danger">{errors.email}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text mb-1.5">
              Địa chỉ cửa hàng chính
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số 123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Website cửa hàng (nếu có)
            </label>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://tiemhoathaomoc.vn"
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-other-websites" className="block text-xs font-semibold text-text mb-1.5">
              Website khác (mỗi dòng một địa chỉ, tối đa 5)
            </label>
            <textarea
              id="profile-other-websites"
              rows={2}
              value={otherWebsites}
              onChange={(e) => setOtherWebsites(e.target.value)}
              placeholder={"https://shop.tiemhoathaomoc.vn\nhttps://hoacuoi.tiemhoathaomoc.vn"}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Fanpage Facebook
            </label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/tiemhoathaomoc"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Khối 3: Giờ vận hành */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Khung giờ mở cửa & Giao hàng</h3>
            <p className="text-xs text-text-muted">Hiển thị trên thông tin đặt hàng và trả lời tự động</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Giờ mở cửa buổi sáng
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Giờ đóng cửa buổi tối
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Nút lưu ở chân form */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-md hover:bg-primary/95 transition-all disabled:opacity-60"
        >
          <Check size={16} />
          <span>{saving ? "Đang lưu..." : "Lưu hồ sơ kinh doanh"}</span>
        </button>
      </div>
    </form>
  )
}
