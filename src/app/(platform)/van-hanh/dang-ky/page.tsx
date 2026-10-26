"use client"

<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

type RegistrationItem = {
  id: string
  fullName: string
  email: string
  phone: string | null
  storeName: string
  industry: string
  plan: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
  organization?: {
    id: string
    name: string
    slug: string
  } | null
}

export default function DangKyMoiPage() {
  const [items, setItems] = useState<RegistrationItem[] | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [loi, setLoi] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>("")

  const loadData = async (filter: string) => {
    setLoi(null)
    try {
      const res = await fetch(`/api/v1/platform/registrations?status=${filter}`)
      if (!res.ok) {
        setLoi("Không tải được danh sách đơn đăng ký.")
        return
      }
      const data = await res.json()
      setItems(data.data || [])
    } catch {
      setLoi("Lỗi kết nối khi tải danh sách đơn đăng ký.")
    }
  }

  useEffect(() => {
    void loadData(statusFilter)
  }, [statusFilter])

  const handleApprove = async (id: string, storeName: string) => {
    if (!confirm(`Xác nhận DUYỆT đăng ký cho cửa hàng "${storeName}"?`)) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/v1/platform/registrations/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_note: "Đã phê duyệt thử nghiệm" }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Lỗi duyệt: ${err.message || "Không thể duyệt"}`)
        return
      }
      alert("Đã duyệt thành công! Tài khoản cửa hàng đã có thể đăng nhập.")
      void loadData(statusFilter)
    } catch {
      alert("Lỗi kết nối khi thực hiện duyệt.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.")
      return
    }
    setActionLoading(id)
    try {
      const res = await fetch(`/api/v1/platform/registrations/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_note: rejectReason.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Lỗi từ chối: ${err.message || "Không thể từ chối"}`)
        return
      }
      alert("Đã từ chối đơn đăng ký.")
      setRejectId(null)
      setRejectReason("")
      void loadData(statusFilter)
    } catch {
      alert("Lỗi kết nối khi thực hiện từ chối.")
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = items ? items.filter((x) => x.status === "PENDING").length : 0

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-text">Xét duyệt đăng ký tài khoản mới</h1>
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 text-xs font-semibold">
                Giai đoạn thử nghiệm
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Kiểm soát quyền truy cập, bảo vệ tài nguyên và chống lạm dụng webapp.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-md text-xs">
            {[
              { key: "PENDING", label: `Chờ duyệt ${statusFilter === "PENDING" && items ? `(${items.length})` : ""}` },
              { key: "APPROVED", label: "Đã duyệt" },
              { key: "REJECTED", label: "Từ chối" },
              { key: "all", label: "Tất cả" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loi && <p className="text-xs text-danger py-4">{loi}</p>}

        {!items && !loi && (
          <div className="py-4">
            <SkeletonBlock lines={5} />
          </div>
        )}

        {items && items.length === 0 && (
          <div className="py-8 text-center text-xs text-text-muted">
            Không có đơn đăng ký nào trong mục này.
          </div>
        )}

        {items && items.length > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="py-2 pr-3">Người đăng ký</th>
                  <th className="py-2 pr-3">Cửa hàng</th>
                  <th className="py-2 pr-3">Ngành hàng</th>
                  <th className="py-2 pr-3">Gói</th>
                  <th className="py-2 pr-3">Thời gian nộp</th>
                  <th className="py-2 pr-3">Trạng thái</th>
                  <th className="py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-text">{item.fullName}</div>
                      <div className="text-[11px] text-text-muted">{item.email}</div>
                      {item.phone && <div className="text-[11px] text-text-muted">{item.phone}</div>}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="font-medium text-text">{item.storeName}</div>
                      {item.organization && (
                        <div className="text-[10px] text-text-muted font-mono">{item.organization.slug}</div>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-surface border border-border text-[11px]">
                        {item.industry}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-[11px] font-mono uppercase text-text-muted">{item.plan}</span>
                    </td>
                    <td className="py-3 pr-3 text-text-muted">
                      {new Date(item.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 pr-3">
                      {item.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                      {item.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      )}
                      {item.status === "REJECTED" && (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 text-[11px] font-semibold">
                            <XCircle className="w-3 h-3" /> Từ chối
                          </span>
                          {item.reviewNote && (
                            <p className="text-[10px] text-text-muted mt-1 max-w-xs italic">
                              "{item.reviewNote}"
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {item.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item.id, item.storeName)}
                            disabled={actionLoading === item.id}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === item.id ? "Đang xử lý..." : "Duyệt"}
                          </button>
                          <button
                            onClick={() => {
                              setRejectId(item.id)
                              setRejectReason("")
                            }}
                            disabled={actionLoading === item.id}
                            className="px-2 py-1 text-xs font-medium rounded border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal từ chối đơn */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-surface border border-border p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-4 h-4" /> Từ chối đơn đăng ký
            </div>
            <p className="text-xs text-text-muted">
              Vui lòng nhập lý do từ chối để lưu vào hồ sơ kiểm duyệt:
            </p>
            <textarea
              className="w-full h-24 p-2 text-xs border border-border rounded bg-muted/30 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="VD: Thông tin không hợp lệ, đăng ký thử nghiệm spam..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="px-3 py-1.5 text-xs rounded border border-border text-text hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectId)}
                disabled={actionLoading === rejectId}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading === rejectId ? "Đang lưu..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
=======
// Duyệt tài khoản tự đăng ký (`N13`, PO 22/10/2026). Xem đặc tả 06 mục 21.

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SkeletonBlock } from "@/components/ui/skeleton"

type PendingRegistration = {
  userId: string
  email: string
  name: string | null
  createdAt: string
  organizationName: string | null
  instantTrial: boolean
  leadPhone: string | null
}

type DecisionResult = { status: "APPROVED" | "REJECTED"; temporaryPassword?: string }

async function taiDanhSach(): Promise<{ data: PendingRegistration[] } | { loi: string }> {
  const res = await fetch("/api/v1/platform/registrations")
  if (!res.ok) return { loi: res.status === 403 ? "Bạn chưa có quyền duyệt đăng ký." : "Không tải được danh sách đăng ký." }
  return { data: ((await res.json()) as { data: PendingRegistration[] }).data }
}

export default function DuyetDangKyPage() {
  const [items, setItems] = useState<PendingRegistration[] | null>(null)
  const [loi, setLoi] = useState<string | null>(null)
  const [dangXuLy, setDangXuLy] = useState<string | null>(null)
  const [matKhauTam, setMatKhauTam] = useState<{ email: string; phone: string | null; password: string } | null>(null)

  const apDung = useCallback((kq: Awaited<ReturnType<typeof taiDanhSach>>) => {
    if ("loi" in kq) setLoi(kq.loi)
    else setItems(kq.data)
  }, [])

  useEffect(() => {
    void (async () => apDung(await taiDanhSach()))()
  }, [apDung])

  async function quyet(item: PendingRegistration, decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && !window.confirm(`Từ chối đăng ký của ${item.email}?`)) return
    setDangXuLy(item.userId)
    setLoi(null)
    try {
      const res = await fetch(`/api/v1/platform/registrations/${item.userId}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      const body = (await res.json().catch(() => null)) as { data?: DecisionResult; error?: { message?: string } } | null
      if (!res.ok) {
        setLoi(body?.error?.message ?? "Không xử lý được đăng ký này.")
        return
      }
      if (body?.data?.temporaryPassword) {
        setMatKhauTam({ email: item.email, phone: item.leadPhone, password: body.data.temporaryPassword })
      }
      apDung(await taiDanhSach())
    } finally {
      setDangXuLy(null)
    }
  }

  if (!items && !loi) return <div className="py-4"><SkeletonBlock lines={4} /></div>

  return (
    <Card className="overflow-x-auto p-4">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <h1 className="text-base font-bold text-text">Duyệt đăng ký</h1>
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-text-muted">{items?.length ?? 0} đang chờ</span>
      </div>
      <p className="mb-3 text-xs text-text-muted">
        Tài khoản tự đăng ký hoặc dùng thử chỉ đăng nhập được sau khi bạn duyệt.
      </p>

      {loi && <p className="mb-3 text-sm text-danger">{loi}</p>}

      {matKhauTam && (
        <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm" role="status">
          <div className="font-semibold text-text">Mật khẩu tạm cho {matKhauTam.email}</div>
          <div className="mt-1 font-mono text-base text-text select-all">{matKhauTam.password}</div>
          <div className="mt-1 text-xs text-text-muted">
            Chỉ hiện một lần. Gửi cho khách{matKhauTam.phone ? ` qua số ${matKhauTam.phone}` : ""} rồi đóng thông báo này.
          </div>
          <Button type="button" variant="outline" className="mt-2" onClick={() => setMatKhauTam(null)}>
            Đã gửi, đóng lại
          </Button>
        </div>
      )}

      {items && items.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">Không có đăng ký nào đang chờ.</p>
      ) : (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="py-2 pr-3">Tài khoản</th>
              <th className="py-2 pr-3">Tổ chức</th>
              <th className="py-2 pr-3">Hình thức</th>
              <th className="py-2 pr-3">Đăng ký lúc</th>
              <th className="py-2 pr-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items?.map((item) => (
              <tr key={item.userId} className="hover:bg-surface-alt">
                <td className="py-2 pr-3">
                  <div className="font-medium text-text">{item.email}</div>
                  {item.name && <div className="text-text-muted">{item.name}</div>}
                </td>
                <td className="py-2 pr-3">{item.organizationName ?? "—"}</td>
                <td className="py-2 pr-3">
                  {item.instantTrial ? `Dùng thử${item.leadPhone ? ` · ${item.leadPhone}` : ""}` : "Đăng ký"}
                </td>
                <td className="py-2 pr-3">{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                <td className="py-2 pr-3">
                  <div className="flex justify-end gap-2">
                    <Button type="button" disabled={dangXuLy === item.userId} onClick={() => void quyet(item, "APPROVE")}>
                      Duyệt
                    </Button>
                    <Button type="button" variant="outline" disabled={dangXuLy === item.userId} onClick={() => void quyet(item, "REJECT")}>
                      Từ chối
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
>>>>>>> origin/main
  )
}
