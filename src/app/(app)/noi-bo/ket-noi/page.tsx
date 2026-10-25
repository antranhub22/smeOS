"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Building2,
  Store,
  Users,
  Copy,
  CheckCircle2,
  Link2,
  ShieldCheck,
  QrCode,
  MessageSquare,
  ChevronRight,
  Layers,
  Hash,
  BadgeCheck,
} from "lucide-react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgIdentity {
  id: string
  shortId: string
  slug: string
  name: string
  displayName: string
  type: string
  phone: string | null
  email: string | null
  address: string | null
  createdAt: string
  connectCode: string
}

interface ChainRelation {
  partnershipId: string
  partnerCode: string
  partnershipType: string
  chainOrgId?: string
  chainName?: string
  chainSlug?: string
  chainConnectCode?: string
  partnerOrgId?: string
  partnerName?: string
  partnerSlug?: string
}

interface Member {
  membershipId: string
  memberId: string
  userId: string
  name: string
  email: string
}

interface IdentityData {
  organization: OrgIdentity
  chainRelations: {
    asPartnerOf: ChainRelation[]
    asChainOf: ChainRelation[]
  }
  members: Member[]
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [value])

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Sao chép ${label ?? value}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[11px] font-medium transition-all"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span className="text-emerald-700">Đã sao chép!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Sao chép</span>
        </>
      )}
    </button>
  )
}

// ─── Badge loại tổ chức ───────────────────────────────────────────────────────

function OrgTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CHAIN: { label: "Chuỗi", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    STORE: { label: "Cửa hàng", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    PLATFORM: { label: "SaaS Platform", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    SINGLE: { label: "Tiệm độc lập", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  }
  const { label, cls } = map[type] ?? { label: type, cls: "bg-neutral-50 text-neutral-600 border-neutral-200" }
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KetNoiPage() {
  const [data, setData] = useState<IdentityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"identity" | "chain" | "members">("identity")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    setErrorMsg(null)
    fetch("/api/v1/noi-bo/identity", {
      credentials: "same-origin",
      headers: { "Accept": "application/json" },
    })
      .then(async (r) => {
        const res = await r.json().catch(() => null)
        if (!r.ok || !res?.success) {
          throw new Error(res?.error?.message ?? res?.error ?? `Lỗi HTTP ${r.status}`)
        }
        setData(res.data)
      })
      .catch((err: any) => {
        setErrorMsg(err.message ?? "Không thể kết nối máy chủ")
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
        Đang tải thông tin định danh...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-3">
        <p className="text-sm text-red-500 font-medium">
          {errorMsg ? `Lỗi: ${errorMsg}` : "Không thể tải thông tin. Vui lòng thử lại."}
        </p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const { organization: org, chainRelations, members } = data
  const isChain = org.type === "CHAIN" || chainRelations.asChainOf.length > 0
  const isPartner = chainRelations.asPartnerOf.length > 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-rose-600" />
            Profile Kết Nối Nội Bộ
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Mã định danh được dùng để kết nối và xác nhận danh tính trong hệ thống smeOS
          </p>
        </div>
        <Link
          href="/tin-nhan"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Mở Chat nội bộ
        </Link>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex border-b border-neutral-200">
        {(
          [
            { key: "identity", label: "Mã định danh", icon: Hash },
            { key: "chain", label: `Chuỗi & Đối tác (${chainRelations.asPartnerOf.length + chainRelations.asChainOf.length})`, icon: Layers },
            { key: "members", label: `Thành viên (${members.length})`, icon: Users },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === key
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Mã định danh ──────────────────────────────────── */}
      {activeTab === "identity" && (
        <div className="space-y-4">
          {/* Card tổ chức */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl">
                  {isChain ? <Building2 className="w-7 h-7" /> : <Store className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">{org.displayName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <OrgTypeBadge type={org.type} />
                    {isPartner && (
                      <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                        Đối tác chuỗi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Mã kết nối chính */}
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
                <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Mã Kết Nối Nội Bộ
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-2xl font-black text-neutral-800 tracking-wider">
                      {org.connectCode.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Dùng để chuỗi mời bạn vào mạng lưới đối tác hoặc để xác nhận danh tính
                    </div>
                  </div>
                  <CopyButton value={org.connectCode} label="mã kết nối" />
                </div>
              </div>

              {/* ID kỹ thuật (rút gọn) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    ID Tổ Chức (Rút Gọn)
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-neutral-700">{org.shortId}</span>
                    <CopyButton value={org.shortId} label="ID ngắn" />
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    UUID Đầy Đủ
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[120px]">{org.id}</span>
                    <CopyButton value={org.id} label="UUID" />
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              {(org.phone || org.email || org.address) && (
                <div className="space-y-1.5 text-xs text-neutral-600 pt-1 border-t border-neutral-100">
                  {org.phone && <div><span className="font-semibold text-neutral-400">SĐT:</span> {org.phone}</div>}
                  {org.email && <div><span className="font-semibold text-neutral-400">Email:</span> {org.email}</div>}
                  {org.address && <div><span className="font-semibold text-neutral-400">Địa chỉ:</span> {org.address}</div>}
                </div>
              )}

              {/* Ghi chú bảo mật */}
              <div className="flex items-start gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/80 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Mã kết nối là <strong>slug định danh công khai</strong> — an toàn để chia sẻ với đối tác. UUID nội bộ
                  chỉ dùng trong hệ thống kỹ thuật.
                </span>
              </div>
            </div>
          </div>

          {/* Hướng dẫn kết nối */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-rose-600" />
              Cách Kết Nối Với Chuỗi
            </h3>
            <ol className="space-y-2 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Chia sẻ <strong>Mã Kết Nối</strong> (<code className="bg-neutral-100 px-1 rounded">{org.connectCode}</code>) với Admin của chuỗi muốn tham gia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Admin chuỗi vào <strong>Quản lý Đối tác → Mời tiệm đã có tài khoản</strong> và nhập mã kết nối của bạn.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Sau xác nhận, kênh Chat nội bộ giữa bạn và chuỗi sẽ tự động mở — không cần Zalo, Telegram.
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ── Tab: Chuỗi & Đối tác ──────────────────────────────── */}
      {activeTab === "chain" && (
        <div className="space-y-4">
          {chainRelations.asPartnerOf.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Cửa hàng này là Đối tác của Chuỗi
              </h3>
              <div className="space-y-2">
                {chainRelations.asPartnerOf.map((r) => (
                  <div
                    key={r.partnershipId}
                    className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between hover:border-rose-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-800">{r.chainName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Mã chuỗi: <span className="font-mono font-semibold">{r.chainConnectCode?.toUpperCase()}</span>
                          {" · "}
                          Mã đối tác: <span className="font-mono font-semibold">{r.partnerCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {r.partnershipType}
                      </span>
                      <Link
                        href="/tin-nhan"
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Nhắn tin với chuỗi"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chainRelations.asChainOf.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Chuỗi này đang quản lý các Đối tác / Chi nhánh
              </h3>
              <div className="space-y-2">
                {chainRelations.asChainOf.map((r) => (
                  <div
                    key={r.partnershipId}
                    className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between hover:border-rose-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-800">{r.partnerName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Mã đối tác: <span className="font-mono font-semibold">{r.partnerCode}</span>
                          {" · "}
                          Slug: <span className="font-mono font-semibold">{r.partnerSlug}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        {r.partnershipType}
                      </span>
                      <Link
                        href="/tin-nhan"
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Nhắn tin với đối tác"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <Link
                  href="/dieu-phoi/doi-tac"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Quản lý toàn bộ đối tác chuỗi <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {chainRelations.asPartnerOf.length === 0 && chainRelations.asChainOf.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 space-y-3">
              <Layers className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-600">Chưa có quan hệ chuỗi</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Chia sẻ Mã Kết Nối của bạn để tham gia chuỗi, hoặc vào{" "}
                <Link href="/dieu-phoi/doi-tac" className="text-rose-600 font-semibold hover:underline">
                  Quản lý Đối tác
                </Link>{" "}
                để thêm cửa hàng vào mạng lưới chuỗi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Thành viên ────────────────────────────────────── */}
      {activeTab === "members" && (
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 text-neutral-400 text-sm">
              Chưa có thành viên nào
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.membershipId}
                className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between hover:border-rose-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-800">{m.name}</div>
                    <div className="text-[11px] text-neutral-500">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      Mã thành viên
                    </div>
                    <div className="font-mono text-xs font-bold text-neutral-700">{m.memberId}</div>
                  </div>
                  <CopyButton value={m.memberId} label="mã thành viên" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
