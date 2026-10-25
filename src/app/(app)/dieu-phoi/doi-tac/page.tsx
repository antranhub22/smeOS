"use client"

import React, { useEffect, useState } from "react"
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

export default function ChainPartnersPage() {
  const [partners, setPartners] = useState<ChainPartnershipEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
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

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/v1/coordinator/partners")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setPartners(json.data)
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-800">Cửa hàng & Đối tác trực thuộc Chuỗi</h1>
            <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full border border-rose-100">
              Mô hình Phân Tầng
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Quản lý mạng lưới chi nhánh, xưởng gia công vệ tinh và liên kết trò chuyện trực tiếp trên nền tảng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm / Liên kết đối tác
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tên cửa hàng, mã đối tác, người liên hệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
          />
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Tổng số: <span className="font-bold text-neutral-800">{partners.length}</span> đối tác
        </div>
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-neutral-400">Đang tải danh bạ đối tác chuỗi...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
          <Store className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-700">Chưa có cửa hàng/đối tác nào</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Bấm &quot;Thêm / Liên kết đối tác&quot; để cấp tài khoản hoặc kết nối cửa hàng đã có sẵn trên hệ thống.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:border-rose-200 hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 leading-tight">
                      {p.partnerOrgName || "Cửa hàng đối tác"}
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-mono mt-0.5 inline-block">
                      Mã: {p.partnerCode}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {p.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-neutral-600 border-t border-b border-neutral-100 py-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Đại diện: {p.contactName || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{p.contactPhone || "Chưa có SĐT"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="truncate">{p.contactEmail || "Chưa có Email"}</span>
                </div>
                {p.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate">{p.address} ({p.province})</span>
                  </div>
                )}
                {p.partnerOrgSlug && (
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100/80 mt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[11px] text-neutral-500">Mã kết nối:</span>
                      <span className="font-mono font-bold text-neutral-700 text-[11px]">
                        {p.partnerOrgSlug.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={"/tin-nhan" as any}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Nhắn tin nội bộ
                </Link>
                <Link
                  href="/dieu-phoi"
                  className="px-3 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Bắn đơn
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm Đối tác */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-neutral-800">Thêm Cửa hàng Đối tác vào Chuỗi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs chuyển đổi giữa Tạo mới vs Đã có tài khoản */}
            <div className="flex border-b border-neutral-200 mt-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("NEW")
                  setErrorMsg("")
                }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "NEW"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
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
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" /> Mời tiệm đã có tài khoản
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="mt-4 space-y-3">
              {activeTab === "NEW" ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Tên cửa hàng / Chi nhánh đối tác *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tiệm Hoa Nhỏ - Chi nhánh Cầu Giấy"
                      value={partnerStoreName}
                      onChange={(e) => setPartnerStoreName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Mã đối tác (Mã định danh) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: DT-CG-01"
                        value={partnerCode}
                        onChange={(e) => setPartnerCode(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Khu vực (Tỉnh / Thành phố)
                      </label>
                      <input
                        type="text"
                        placeholder="Hà Nội, TP.HCM..."
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Người đại diện / Quản lý *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên chủ cửa hàng đối tác"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Email đăng nhập *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="partner@shop.vn"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Địa chỉ tiệm
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, ngõ, đường phố..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200/60 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Dành cho cửa hàng đã có tài khoản trên hệ thống smeOS. Dữ liệu sản phẩm và cài đặt của tiệm sẽ được giữ nguyên hoàn toàn.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Email đại diện hoặc Mã / Slug cửa hàng *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập email tài khoản hoặc slug tiệm (VD: chutiem@shop.vn)"
                      value={existingIdentifier}
                      onChange={(e) => setExistingIdentifier(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Mã đối tác gán trong Chuỗi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: DT-QN-05"
                      value={existingPartnerCode}
                      onChange={(e) => setExistingPartnerCode(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </>
              )}

              <div className="p-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Sau khi liên kết, hệ thống sẽ tự động mở kênh Chat nội bộ giữa Chuỗi và Cửa hàng này.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
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
                  className="px-4 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl text-xs font-medium hover:bg-neutral-50"
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
