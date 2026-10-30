"use client"

/**
 * Phần kết quả Phase 3 của Chức năng 04 — hiển thị bài viết đã sinh
 * và gợi ý chuyển tiếp sang Lịch đăng bài.
 * Tách ra để giảm kích thước page.tsx (SRP ≤350 dòng).
 */

import React from "react"
import { RefreshCw, Send } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { MultichannelPostCard, type MultichannelPostItem } from "@/components/templates/content-engine"
import { useRouter } from "next/navigation"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"

interface GenerationResultsProps {
  posts: MultichannelPostItem[]
  productName: string
  productImageUrl?: string | undefined
  modelInfo: { provider?: string; modelName?: string; isFallback?: boolean }
  criticScore?: number | undefined
  onUpdatePost: (channel: string, updated: Partial<MultichannelPostItem>) => void
  onApprovePost: (post: MultichannelPostItem) => void
  onReset: () => void
}

export function GenerationResults({
  posts,
  productName,
  productImageUrl,
  modelInfo,
  criticScore,
  onUpdatePost,
  onApprovePost,
  onReset,
}: GenerationResultsProps) {
  const router = useRouter()
  const { business } = useTenantProfile()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-text-muted">Bài đã soạn</span>
          <h2 className="text-lg font-black text-text">Xem trước & Biên tập nội dung</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs gap-1.5 shadow-xs"
        >
          <RefreshCw size={13} />
          Viết bài mới
        </Button>
      </div>

      <MultichannelPostCard
        posts={posts}
        productName={productName}
        productImageUrl={productImageUrl}
        modelInfo={modelInfo}
        shopName={business?.display_name}
        criticScore={criticScore}
        onUpdatePost={onUpdatePost}
        onSchedulePost={onApprovePost}
      />

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span>🚀</span> Bước tiếp theo: Xuất bản đa nền tảng
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            Sau khi duyệt, bài viết chuyển vào lịch đăng bài.
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => router.push("/lich-dang" as never)}
          className="text-xs gap-1.5 font-bold whitespace-nowrap"
        >
          Đến Lịch đăng bài
          <Send size={13} />
        </Button>
      </div>
    </div>
  )
}
