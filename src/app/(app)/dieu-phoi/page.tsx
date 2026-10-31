"use client"

import { InfoTip } from "@/components/ui/info-tip"
import React, { useState } from "react"
import { Radio, RefreshCw, Plus, LayoutDashboard, Sparkles } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { ControlTowerDashboard } from "@/components/coordinator/control-tower-dashboard"
import { CoordinatorReminderBar } from "@/components/coordinator/coordinator-reminder-bar"
import { CoordinatorBrochureTab } from "@/components/greeting-card/coordinator/coordinator-brochure-tab"
import { UserMenu } from "@/components/layout/user-menu"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"

type CoordinatorTab = "tower" | "brochure"

export default function DieuPhoiPage() {
  const [activeTab, setActiveTab] = useState<CoordinatorTab>("tower")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { userInitials } = useSession()
  const { t, dict } = useI18n()

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header with Standardized Tab Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center shrink-0">
            <Radio size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-text">{dict.orders.coordinator.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-caption font-bold">
                {dict.orders.coordinator.statusBadge}
              </span>
              {/* Giải thích trong "?" (OPERATING_PRINCIPLES §6.1) */}
              <InfoTip label={dict.orders.coordinator.title} side="bottom">
                {dict.orders.coordinator.subtitle}
              </InfoTip>
            </div>
          </div>
        </div>

        {/* Standardized Top-Right Action Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw size={13} />
            <span>{dict.common.actions.refresh}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white text-xs gap-1.5 h-9 font-bold shadow-sm"
          >
            <Plus size={14} />
            <span>{dict.orders.coordinator.receiveNewOrder}</span>
          </Button>
          <UserMenu initials={userInitials} />
        </div>
      </div>

      {/* ── Thanh Nhắc Nghiệp Vụ Điều Phối (M0..M5) ─────────────────── */}
      <CoordinatorReminderBar />

      {/* Coordinator Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("tower")}
          className={`flex items-center gap-2 py-2 px-3 text-body-sm font-bold border-b-2 transition-colors ${
            activeTab === "tower"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <LayoutDashboard size={16} />
          <span>{dict.orders.coordinator.tabs.tower}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brochure")}
          className={`flex items-center gap-2 py-2 px-3 text-body-sm font-bold border-b-2 transition-colors ${
            activeTab === "brochure"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <Sparkles size={16} />
          <span>{dict.orders.coordinator.tabs.brochure}</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "tower" && (
        <ControlTowerDashboard
          isCreateModalOpen={isCreateOpen}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onCloseCreateModal={() => setIsCreateOpen(false)}
        />
      )}

      {activeTab === "brochure" && <CoordinatorBrochureTab />}
    </div>
  )
}
