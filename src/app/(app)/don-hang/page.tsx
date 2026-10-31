"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, RefreshCw, MessageSquarePlus } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { CreateOrderModal } from "@/components/orders/create-order-modal"
import { OrderDetailModal } from "@/components/orders/order-detail-modal"
import { ChatOrderCheckoutModal } from "@/components/chat/chat-order-checkout-modal"
import type { OrderItemCardProps } from "@/components/orders/order-card"
import { SalesBrochureTab } from "@/components/greeting-card/sales/sales-brochure-tab"
import { AdminBrochurePaymentTab } from "@/components/greeting-card/admin/admin-brochure-payment-tab"
import { CoordinatorBrochureTab } from "@/components/greeting-card/coordinator/coordinator-brochure-tab"
import { ExportOrdersButton } from "@/components/orders/export-orders-button"
import { AllOrdersTab } from "@/components/orders/workspace/all-orders-tab"
import { LeadQueueTab } from "@/components/orders/workspace/lead-queue-tab"
import { WorkbenchList } from "@/components/orders/workspace/workbench-list"
import { ApprovalRequestsList } from "@/components/orders/workspace/approval-requests-list"
import {
  WORKSPACE_TAB_LABELS,
  defaultWorkspaceTab,
  isWorkspaceTab,
  visibleWorkspaceTabs,
  type WorkspaceTab,
} from "@/components/orders/workspace/role-tabs"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"

/** Một khối trong tab: tiêu đề ngắn + nội dung (đơn Thẻ chào nhúng nguyên vẹn, đơn nguồn khác dùng màn mới). */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="text-title-sm font-bold text-text">{title}</h2>
      {children}
    </section>
  )
}

/**
 * Mục Đơn hàng theo vai (Đơn hàng đa nguồn P4 — KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md §6): Khách tiềm năng ·
 * Sale chăm sóc · Phê duyệt · Điều phối · Tất cả. Thẻ chào được nhúng nguyên vẹn (B3).
 */
export default function DonHangPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const { can } = session
  const { t } = useI18n()
  const canExport = session.can("R1")
  const tabs = visibleWorkspaceTabs(can)
  const requested = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() =>
    isWorkspaceTab(requested) && visibleWorkspaceTabs(can).includes(requested) ? requested : defaultWorkspaceTab(can),
  )
  const [orders, setOrders] = useState<OrderItemCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  function loadOrders() {
    setLoading(true)
    fetch("/api/v1/orders")
      .then((r) => r.json())
      .then((res) => {
        if (res.orders) setOrders(res.orders)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* 1. Header chuẩn FloraOS */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-title font-extrabold text-foreground">{t("orders.header.title")}</h1>
          {/* Giải thích trong "?" thay vì dòng phụ (OPERATING_PRINCIPLES §6.1) */}
          <InfoTip label={t("orders.header.title")} side="bottom">
            Theo dõi mọi đơn từ lúc nhận đến khi giao: mới nhận, đang làm, đang giao và đã xong.
          </InfoTip>
        </div>

        {/* Top-Right Action Header: 1 primary + 2 secondary/ghost */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 font-semibold">
            <Plus size={16} /> <span className="text-caption sm:text-body-sm">{t("orders.header.createOrder")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChatModalOpen(true)}
            title={t("orders.header.createFromChat")}
            className="flex items-center gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/5"
          >
            <MessageSquarePlus size={15} />
            <span className="hidden sm:inline">{t("orders.header.createFromChat")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {t("orders.header.refresh")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> {t("orders.header.home")}
          </Button>
          {canExport && (
            <ExportOrdersButton
              filename="don-hang.xlsx"
              label={t("orders.header.exportExcel")}
            />
          )}
        </div>
      </header>

      {/* Tab theo vai — mở mặc định theo việc chính của người đang xem */}
      <div role="group" aria-label="Khu làm việc" className="flex items-center gap-2 border-b border-border bg-surface px-4 sm:px-6 pt-2 pb-0 overflow-x-auto scrollbar-none [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 min-h-11 py-2.5 px-4 text-body-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            {WORKSPACE_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        {activeTab === "leads" && <LeadQueueTab />}
        {activeTab === "sale" && (
          <>
            <Section title="Đơn từ nguồn khác"><WorkbenchList mode="sale" /></Section>
            <Section title="Thẻ chào"><SalesBrochureTab /></Section>
          </>
        )}
        {activeTab === "approve" && (
          <>
            {can("R16") && <Section title="Chờ duyệt giao trước, thu sau"><ApprovalRequestsList /></Section>}
            {can("R11") && <Section title="Xác nhận tiền — đơn nguồn khác"><WorkbenchList mode="approve" /></Section>}
            {can("R11") && <Section title="Thẻ chào"><AdminBrochurePaymentTab /></Section>}
          </>
        )}
        {activeTab === "coordinate" && (
          <>
            <Section title="Thẻ chào"><CoordinatorBrochureTab /></Section>
            <Section title="Đơn nguồn khác">
              <Link href="/dieu-phoi" className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-body-sm font-semibold text-text hover:bg-surface-alt">
                Mở Tháp điều phối
              </Link>
            </Section>
          </>
        )}
        {activeTab === "all" && <AllOrdersTab orders={orders} onSelect={setSelectedOrderId} onCreate={() => setCreateOpen(true)} />}
      </main>

      <CreateOrderModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={loadOrders} />
      <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} onUpdated={loadOrders} />
      <ChatOrderCheckoutModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        initialDraft={{ recipientName: null, recipientPhone: null, deliveryAddress: null, deliveryTime: null, occasion: null, cardMessage: null, flowerStyleOrTone: null, budgetVnd: null }}
        onOrderCreated={() => loadOrders()}
      />
    </div>
  )
}
