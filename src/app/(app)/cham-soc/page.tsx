"use client"

import React, { useState, use } from "react"
import { Heart, History, Users, Sparkles, ArrowLeft } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { MobileMenuButton } from "@/components/layout/mobile-nav-context"
import { useSession } from "@/lib/session"
import { CareWorkflow } from "@/components/marketing-center/care/care-workflow"
import { RecentInteractionsList } from "@/components/marketing-center/care/recent-interactions-list"
import type { CareCardAssetCode } from "@/modules/care-cards/domain/care-card"
import Link from "next/link"

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
    <div className="min-h-screen bg-background pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <Link
              href="/cong-cu"
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
              title="Quay lại Trung tâm công cụ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
                <h1 className="text-title-sm font-bold text-text">Chăm sóc khách hàng</h1>
              </div>
              <p className="text-caption text-text-muted hidden sm:block">
                Gắn kết khách cũ, gửi thiệp tri ân và nhắc lịch chăm sóc
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-surface-alt border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${
                activeTab === "workflow"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Gửi chăm sóc</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Nhật ký tương tác</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
      </main>
    </div>
  )
}
