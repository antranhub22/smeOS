"use client"

import React, { useState, use } from "react"
import { History } from "@/components/ui/icon-set/history"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { useSession } from "@/lib/session"
import { PrintWorkflow } from "@/components/marketing-center/print/print-workflow"
import { PrintRenditionList } from "@/components/marketing-center/print/print-rendition-list"
import type { PrintPresetCode } from "@/modules/print/domain/print-preset"

interface PageProps {
  searchParams?: Promise<{ asset?: string; preset?: string }>
}

export default function PrintWorkspacePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? use(searchParams) : undefined
  const initialAssetCode = resolvedParams?.asset
  const initialPresetCode = (resolvedParams?.preset as PrintPresetCode) || "A6"

  const { organization } = useSession()
  const storeName = organization?.name || "Cửa hàng của bạn"

  const [activeTab, setActiveTab] = useState<"workflow" | "history">("workflow")

  return (
    <div className="min-h-screen bg-bg pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PageHeader
          title="Ấn phẩm & In ấn chất lượng cao"
          description="Xuất file PDF chuẩn nhà in (300 DPI, tràn lề 3mm, dấu định vị xén)"
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
                  <span>Tạo bản in</span>
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
                  <span>Lịch sử ấn phẩm</span>
                </Button>
              </div>
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "workflow" ? (
          <PrintWorkflow
            initialPresetCode={initialPresetCode}
            initialAssetCode={initialAssetCode}
            storeName={storeName}
          />
        ) : (
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4 max-w-4xl mx-auto">
            <div>
              <h2 className="text-title-sm font-bold text-text">
                Lịch sử các bản in đã xuất
              </h2>
              <p className="text-caption text-text-muted">
                Các bản PDF in ấn đã lưu kèm thông số tràn lề, kích thước và dấu định vị xén
              </p>
            </div>
            <PrintRenditionList />
          </div>
        )}
      </div>
    </div>
  )
}
