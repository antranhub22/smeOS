"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/session"
import { isPendingProposal } from "@/modules/products/domain/product-proposal"

interface ProductProposalBannerProps {
  productId: string
  attributes: Record<string, unknown> | null | undefined
  onApproved: () => void
}

/**
 * Mẫu nhân viên đề xuất (đã dùng được) chờ Điều hành duyệt. Chỉ người có `H3`
 * thấy nút Duyệt; máy chủ kiểm lại ở `POST /products/:id/approve`.
 */
export function ProductProposalBanner({ productId, attributes, onApproved }: ProductProposalBannerProps) {
  const { can } = useSession()
  const [dangDuyet, setDangDuyet] = useState(false)
  const [loi, setLoi] = useState<string | null>(null)

  if (!isPendingProposal(attributes)) return null

  const duyet = async () => {
    setDangDuyet(true)
    setLoi(null)
    try {
      const res = await fetch(`/api/v1/products/${productId}/approve`, { method: "POST" })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error?.message || "Không duyệt được mẫu, vui lòng thử lại")
      onApproved()
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không duyệt được mẫu, vui lòng thử lại")
    } finally {
      setDangDuyet(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-bg px-3.5 py-2.5 text-body-sm text-warning">
      <span className="flex-1 font-medium">
        Mẫu do nhân viên đề xuất, đang dùng được để bán và chờ Điều hành duyệt vào danh mục chính thức.
      </span>
      {can("H3") && (
        <Button size="sm" onClick={duyet} disabled={dangDuyet} className="font-bold">
          {dangDuyet && <Loader2 size={15} className="animate-spin" />}
          <span>Duyệt mẫu</span>
        </Button>
      )}
      {loi && <span className="w-full text-danger">{loi}</span>}
    </div>
  )
}
