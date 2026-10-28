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
import { PartnerToolMatrixModal } from "@/components/organization/partner-tool-matrix-modal"
import { PartnerCredentialDialog, type PartnerCredential } from "@/components/organization/partner-credential-dialog"
import { useChainPartners } from "@/components/organization/use-chain-partners"

export default function ChainPartnersPage() {
  const { partners, setPartners, loading, refresh: fetchPartners } = useChainPartners()
  const [selectedToolPartner, setSelectedToolPartner] = useState<ChainPartnershipEntity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"NEW" | "EXISTING">("NEW")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  // Mật khẩu ban đầu của đối tác mới — máy chủ chỉ trả về một lần (audit AUD-009)
  const [credential, setCredential] = useState<PartnerCredential | null>(null)

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

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg("")

    try {
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
        if (json.temporaryPassword) {
          setCredential({ storeName: partnerStoreName, email: contactEmail, temporaryPassword: json.temporaryPassword })
        }
      } else {
        // Liên kết cửa hàng đã có tài khoản
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

      setShowModal(false)
      // Reset form
      setPartnerStoreName("")
      setPartnerCode("")
      setContactName("")
      setContactPhone("")
      setContactEmail("")
      setAddress("")
      setExistingIdentifier("")
      setExistingPartnerCode("")
      fetchPartners()
    } catch {
      setErrorMsg("Đã xảy ra lỗi kết nối máy chủ")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = partners.filter(
    (p) =>
      (p.partnerOrgName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.contactName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-text">Cửa hàng & Đối tác trực thuộc Chuỗi</h1>
            <span className="text-xs bg-primary-muted text-primary-dark font-semibold px-2.5 py-0.5 rounded-full border border-primary-border">
              Mô hình Phân Tầng
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Quản lý mạng lưới chi nhánh, xưởng gia công vệ tinh và liên kết trò chuyện trực tiếp trên nền tảng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm / Liên kết đối tác
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo tên cửa hàng, mã đối tác, người liên hệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>
        <div className="text-xs text-text-muted font-medium">
          Tổng số: <span className="font-bold text-text">{partners.length}</span> đối tác
        </div>
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-text-muted">Đang tải danh bạ đối tác chuỗi...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8 space-y-3">
          <Store className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-text">Chưa có cửa hàng/đối tác nào</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Bấm &quot;Thêm / Liên kết đối tác&quot; để cấp tài khoản hoặc kết nối cửa hàng đã có sẵn trên hệ thống.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-surface rounded-2xl border border-border p-5 shadow-xs hover:border-primary-border hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-muted text-primary flex items-center justify-center font-bold text-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text leading-tight">
                      {p.partnerOrgName || "Cửa hàng đối tác"}
                    </h3>
                    <span className="text-caption text-text-muted font-mono mt-0.5 inline-block">
                      Mã: {p.partnerCode}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "ACTIVE"
                      ? "bg-success-bg text-success border border-success-border"
                      : "bg-surface-alt text-text"
                  }`}
                >
                  {p.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-text border-t border-b border-border py-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-text-muted" />
                  <span>Đại diện: {p.contactName || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  <span>{p.contactPhone || "Chưa có SĐT"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="truncate">{p.contactEmail || "Chưa có Email"}</span>
                </div>
                {p.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span className="truncate">{p.address} ({p.province})</span>
                  </div>
                )}
                {p.partnerOrgSlug && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/80 mt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" />
                      <span className="text-caption text-text-muted">Mã kết nối:</span>
                      <span className="font-mono font-bold text-text text-caption">
                        {p.partnerOrgSlug.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedToolPartner(p)}
                  className="flex-1 py-2 bg-surface-alt hover:bg-border/80 text-text rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Phân quyền công cụ</span>
                </button>
                <Link
                  href={"/tin-nhan" as any}
                  className="p-2 bg-primary-muted hover:bg-primary-muted text-primary-dark rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                  title="Nhắn tin nội bộ"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dieu-phoi"
                  className="px-3 py-2 border border-border hover:bg-surface-alt text-text rounded-xl text-xs font-medium transition-colors"
                >
                  Bắn đơn
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <PartnerCredentialDialog credential={credential} onClose={() => setCredential(null)} />

      {/* Modal Phân quyền Công cụ Chi nhánh */}
      {selectedToolPartner && (
        <PartnerToolMatrixModal
          partnerId={selectedToolPartner.id}
          partnerName={selectedToolPartner.partnerOrgName || "Cửa hàng đối tác"}
          partnerCode={selectedToolPartner.partnerCode}
          initialUnlockedTools={selectedToolPartner.unlockedTools}
          onClose={() => setSelectedToolPartner(null)}
          onSuccess={(updatedTools) => {
            setPartners((prev) =>
              prev.map((item) =>
                item.id === selectedToolPartner.id
                  ? { ...item, unlockedTools: updatedTools }
                  : item
              )
            )
          }}
        />
      )}

      {/* Modal Thêm Đối tác */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-text">Thêm Cửa hàng Đối tác vào Chuỗi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Đóng"
                className="text-text-muted hover:text-text"
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
              <div className="mt-3 p-3 bg-danger-bg text-danger-text rounded-xl text-xs flex items-center gap-2 border border-danger-border">
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
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Cửa Hàng Nhỏ - Chi nhánh Cầu Giấy"
                      value={partnerStoreName}
                      onChange={(e) => setPartnerStoreName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Mã đối tác (Mã định danh) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: DT-CG-01"
                        value={partnerCode}
                        onChange={(e) => setPartnerCode(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Khu vực (Tỉnh / Thành phố)
                      </label>
                      <input
                        type="text"
                        placeholder="Hà Nội, TP.HCM..."
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Người đại diện / Quản lý *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên chủ cửa hàng đối tác"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Email đăng nhập *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="partner@shop.vn"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Địa chỉ tiệm
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, ngõ, đường phố..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-warning-bg rounded-xl text-caption text-warning-text border border-warning-border/60 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <span>
                      Dành cho cửa hàng đã có tài khoản trên hệ thống smeOS. Dữ liệu sản phẩm và cài đặt của tiệm sẽ được giữ nguyên hoàn toàn.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Email đại diện hoặc Mã / Slug cửa hàng *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập email tài khoản hoặc slug tiệm (VD: chutiem@shop.vn)"
                      value={existingIdentifier}
                      onChange={(e) => setExistingIdentifier(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Mã đối tác gán trong Chuỗi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: DT-QN-05"
                      value={existingPartnerCode}
                      onChange={(e) => setExistingPartnerCode(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              <div className="p-3 bg-surface-alt rounded-xl text-caption text-text-muted flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>
                  Sau khi liên kết, hệ thống sẽ tự động mở kênh Chat nội bộ giữa Chuỗi và Cửa hàng này.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? "Đang xử lý..."
                    : activeTab === "NEW"
                    ? "Xác nhận & Cấp tài khoản mới"
                    : "Xác nhận & Mời vào chuỗi"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-border text-text rounded-xl text-xs font-medium hover:bg-surface-alt"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
