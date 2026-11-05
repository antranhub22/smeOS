"use client"

import React, { useState, use } from "react"
import { History } from "@/components/ui/icon-set/history"
import { Users } from "@/components/ui/icon-set/users"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { useSession } from "@/lib/session"
import { CareWorkflow } from "@/components/marketing-center/care/care-workflow"
import { RecentInteractionsList } from "@/components/marketing-center/care/recent-interactions-list"
import type { CareCardAssetCode } from "@/modules/care-cards/domain/care-card"

interface PageProps {
  searchParams?: Promise<{ asset?: string }>
}

export default function CustomerCarePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? use(searchParams) : undefined
  const initialAssetCode = (resolvedParams?.asset as CareCardAssetCode) || "49"

  const { organization } = useSession()
  const storeName = organization?.name || "Cửa hàng của bạn"
  const storePhone = undefined

  const [activeTab, setActiveTab] = useState<"workflow" | "history">("workflow")

  return (
    <div className="min-h-screen bg-bg pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PageHeader
          title="Chăm sóc khách hàng"
          description="Gắn kết khách cũ, gửi thiệp tri ân và nhắc lịch chăm sóc"
          backHref="/cong-cu"
          backLabel="Trung tâm công cụ"
          actions={
              <div role="group" aria-label="Chế độ xem" className="flex items-center p-1 rounded-xl bg-surface-alt border border-border">
                <Button
                  type="button"
                  variant={activeTab === "workflow" ? "secondary" : "ghost"}
                  aria-pressed={activeTab === "workflow"}
                  size="sm"
                  onClick={() => setActiveTab("workflow")}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-auto text-caption font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gửi chăm sóc</span>
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "history" ? "secondary" : "ghost"}
                  aria-pressed={activeTab === "history"}
                  size="sm"
                  onClick={() => setActiveTab("history")}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-auto text-caption font-semibold"
                >
                  <History className="w-4 h-4" />
                  <span>Nhật ký tương tác</span>
                </Button>
              </div>
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "workflow" ? (
          <CareWorkflow
            initialAssetCode={initialAssetCode}
            storeName={storeName}
            storePhone={storePhone}
          />
        ) : (
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4 max-w-4xl mx-auto">
            <div>
              <h2 className="text-title-sm font-bold text-text">Lịch sử tương tác chăm sóc khách hàng</h2>
              <p className="text-caption text-text-muted">
                Các lượt gửi thiệp, tin nhắn Zalo và cuộc gọi chăm sóc được nhân viên ghi nhận
              </p>
            </div>
            <RecentInteractionsList />
          </div>
        )}
      </div>
    </div>
  )
}
