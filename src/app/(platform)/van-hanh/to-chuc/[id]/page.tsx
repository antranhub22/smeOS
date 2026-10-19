"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { Building2, Store, Clock, CheckCircle2 } from "lucide-react"

type PlatformOrganizationDetail = {
  id: string
  name: string
  slug: string
  type: string
  creditBalance: number
  createdAt: string
  memberCount: number
  branchCount: number
  workspaceKinds: string[]
  pendingModelChange?: {
    requested_type: string
    requested_at: string
    requested_by?: string
    note?: string | null
  } | null
}

async function layJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url)
  if (!res.ok) return null
  return (await res.json()) as T
}

function Dong({ nhan, giaTri }: { nhan: string; giaTri: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-xs last:border-0">
      <span className="text-text-muted">{nhan}</span>
      <span className="font-medium">{giaTri}</span>
    </div>
  )
}

export default function ChiTietToChucPage() {
  const params = useParams<{ id: string }>()
  const [org, setOrg] = useState<PlatformOrganizationDetail | null>(null)
  const [loi, setLoi] = useState<string | null>(null)
  const [thongBao, setThongBao] = useState<string | null>(null)
  const [dangDuyet, setDangDuyet] = useState(false)

  const taiDuLieu = async () => {
    const res = await layJson<{ data: PlatformOrganizationDetail }>(`/api/v1/platform/organizations/${params.id}`)
    if (!res) {
      setLoi("Không tìm thấy tổ chức, hoặc không tải được.")
      return
    }
    setOrg(res.data)
  }

  useEffect(() => {
    void taiDuLieu()
  }, [params.id])

  const handleApprove = async (targetType: string) => {
    setDangDuyet(true)
    setLoi(null)
    setThongBao(null)
    try {
      const res = await fetch(`/api/v1/platform/organizations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          note: "Phê duyệt bởi Quản trị viên SaaS",
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error?.message || "Phê duyệt thất bại")
      }

      setThongBao(`Đã chuyển đổi tổ chức sang ${targetType === "CHAIN" ? "Chuỗi cửa hàng" : "1 Cửa hàng độc lập"} thành công!`)
      await taiDuLieu()
    } catch (err: unknown) {
      setLoi(err instanceof Error ? err.message : "Đã có lỗi xảy ra")
    } finally {
      setDangDuyet(false)
    }
  }

  if (loi && !org) return <p role="alert" className="text-sm text-danger">{loi}</p>
  if (!org) return <div className="py-4"><SkeletonBlock lines={4} /></div>

  const isChain = org.type === "CHAIN" || org.type === "FLOWER_NETWORK"

  return (
    <div className="space-y-4 max-w-xl">
      {thongBao && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-body-sm font-semibold text-primary flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{thongBao}</span>
        </div>
      )}

      {loi && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-body-sm font-semibold text-danger">
          {loi}
        </div>
      )}

      {/* Khối cảnh báo yêu cầu chuyển đổi mô hình đang chờ duyệt */}
      {org.pendingModelChange && (
        <Card className="p-4 border-2 border-warning/40 bg-warning-bg rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-warning font-bold text-body-sm">
            <Clock size={16} />
            <span>Yêu cầu chuyển đổi mô hình cần duyệt</span>
          </div>

          <div className="text-caption text-text-muted space-y-1">
            <div>
              Chuyển sang:{" "}
              <strong className="text-foreground">
                {org.pendingModelChange.requested_type === "CHAIN" ? "Chuỗi cửa hàng (CHAIN)" : "1 Cửa hàng độc lập (SINGLE)"}
              </strong>
            </div>
            <div>Thời gian gửi: {new Date(org.pendingModelChange.requested_at).toLocaleString("vi-VN")}</div>
            {org.pendingModelChange.note && (
              <div className="italic">Lý do: &ldquo;{org.pendingModelChange.note}&rdquo;</div>
            )}
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              disabled={dangDuyet}
              onClick={() => handleApprove(org.pendingModelChange!.requested_type)}
              className="gap-1.5 font-bold shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>{dangDuyet ? "Đang xử lý…" : `Duyệt chuyển sang ${org.pendingModelChange.requested_type}`}</span>
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-1 border-b border-border pb-2">
          <p className="text-lg font-semibold">{org.name}</p>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-text-muted">Phạm vi: Tổ chức cụ thể</span>
        </div>

        <Dong nhan="Slug" giaTri={org.slug} />
        <Dong
          nhan="Loại tổ chức"
          giaTri={
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isChain ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                }`}
              >
                {isChain ? "Chuỗi cửa hàng (CHAIN)" : "1 Cửa hàng độc lập (SINGLE)"}
              </span>

              {/* Nút đổi nhanh của Admin nếu không có pending request */}
              {!org.pendingModelChange && (
                <button
                  type="button"
                  disabled={dangDuyet}
                  onClick={() => handleApprove(isChain ? "SINGLE" : "CHAIN")}
                  className="text-caption text-text-muted hover:text-primary underline ml-1"
                >
                  {isChain ? "Chuyển về 1 Cửa hàng" : "Chuyển sang Chuỗi"}
                </button>
              )}
            </div>
          }
        />
        <Dong nhan="Số dư credit" giaTri={org.creditBalance} />
        <Dong nhan="Thành viên" giaTri={org.memberCount} />
        <Dong nhan="Chi nhánh" giaTri={org.branchCount} />
        <Dong nhan="Workspace" giaTri={org.workspaceKinds.join(", ") || "—"} />
        <Dong nhan="Tạo lúc" giaTri={new Date(org.createdAt).toLocaleString("vi-VN")} />
      </Card>
    </div>
  )
}

