"use client"

import React, { useState } from "react"
import {
  Users,
  Plus,
  Search,
  Building2,
  Store,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  X,
  Link2,
  Sparkles,
} from "lucide-react"
import type { ChainPartnershipEntity } from "@/modules/chain-partnership/domain/partnership-entities"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PartnerCredential } from "@/components/organization/partner-credential-dialog"

interface ChainPartnerModalProps {
  showModal: boolean
  onClose: () => void
  onSuccess: (credential?: PartnerCredential) => void
}

export function ChainPartnerCreateModal({
  showModal,
  onClose,
  onSuccess,
}: ChainPartnerModalProps) {
  const [activeTab, setActiveTab] = useState<"NEW" | "EXISTING">("NEW")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Form fields: Tạo mới
  const [partnerStoreName, setPartnerStoreName] = useState("")
  const [partnerCode, setPartnerCode] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [address, setAddress] = useState("")
  const [province, setProvince] = useState("Hà Nội")

  // Form fields: Mời cửa hàng có sẵn
  const [existingIdentifier, setExistingIdentifier] = useState("")
  const [existingPartnerCode, setExistingPartnerCode] = useState("")

  if (!showModal) return null

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSubmitting(true)

    try {
      let credential: PartnerCredential | undefined
      if (activeTab === "NEW") {
        const res = await fetch("/api/v1/coordinator/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerStoreName,
            partnerCode,
            contactName,
            contactPhone,
            contactEmail,
            address,
            province,
            partnershipType: "SUBCONTRACTOR",
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrorMsg(json.message || "Không thể cấp tài khoản đối tác")
          return
        }
        // Mật khẩu ban đầu — máy chủ chỉ trả về một lần (audit AUD-009)
        if (json.temporaryPassword) {
          credential = { storeName: partnerStoreName, email: contactEmail, temporaryPassword: json.temporaryPassword }
        }
      } else {
        const res = await fetch("/api/v1/coordinator/partners/link-existing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: existingIdentifier,
            partnerCode: existingPartnerCode,
            partnershipType: "SUBCONTRACTOR",
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrorMsg(json.message || "Không thể liên kết cửa hàng này")
          return
        }
      }

      onClose()
      // Reset form
      setPartnerStoreName("")
      setPartnerCode("")
      setContactName("")
      setContactPhone("")
      setContactEmail("")
      setAddress("")
      setExistingIdentifier("")
      setExistingPartnerCode("")
      onSuccess(credential)
    } catch {
      setErrorMsg("Đã xảy ra lỗi kết nối máy chủ")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-text">Thêm Cửa hàng Đối tác vào Chuỗi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-text-muted hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs chuyển đổi giữa Tạo mới vs Đã có tài khoản */}
        <div className="flex border-b border-border mt-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("NEW")
              setErrorMsg("")
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "NEW"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Cấp tài khoản mới
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("EXISTING")
              setErrorMsg("")
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "EXISTING"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Mời tiệm đã có tài khoản
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-danger-subtle text-danger rounded-xl text-xs flex items-center gap-2 border border-danger/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreatePartner} className="mt-4 space-y-3">
          {activeTab === "NEW" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Tên cửa hàng / Chi nhánh đối tác *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ví dụ: Cửa Hàng Nhỏ - Chi nhánh Cầu Giấy"
                  value={partnerStoreName}
                  onChange={(e) => setPartnerStoreName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Mã đối tác (Mã định danh) *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="VD: DT-CG-01"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Khu vực (Tỉnh / Thành phố)
                  </label>
                  <Input
                    type="text"
                    placeholder="Hà Nội, TP.HCM..."
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Người đại diện / Quản lý *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Họ và tên chủ cửa hàng đối tác"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Email đăng nhập *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="partner@shop.vn"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Địa chỉ tiệm
                </label>
                <Input
                  type="text"
                  placeholder="Số nhà, ngõ, đường phố..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-warning-subtle rounded-xl text-caption text-warning-text border border-warning/20 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span>
                  Dành cho cửa hàng đã có tài khoản trên hệ thống smeOS. Dữ liệu sản phẩm và cài đặt của tiệm sẽ được giữ nguyên hoàn toàn.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Email đại diện hoặc Mã / Slug cửa hàng *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Nhập email tài khoản hoặc slug tiệm (VD: chutiem@shop.vn)"
                  value={existingIdentifier}
                  onChange={(e) => setExistingIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Mã đối tác gán trong Chuỗi *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="VD: DT-QN-05"
                  value={existingPartnerCode}
                  onChange={(e) => setExistingPartnerCode(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="p-3 bg-surface-muted rounded-xl text-caption text-text-muted flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <span>
              Sau khi liên kết, hệ thống sẽ tự động mở kênh Chat nội bộ giữa Chuỗi và Cửa hàng này.
            </span>
          </div>

          <div className="pt-3 flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting
                ? "Đang xử lý..."
                : activeTab === "NEW"
                ? "Xác nhận & Cấp tài khoản mới"
                : "Xác nhận & Mời vào chuỗi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
