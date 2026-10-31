"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Users, UserPlus, Sparkles, Search, Calendar, ArrowRight } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { Badge } from "@/components/ui/badge"
import { FeatureGuidanceCard } from "@/components/ui/feature-guidance-card"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { CreateCustomerModal } from "@/components/crm/create-customer-modal"
import { CustomerDetailModal } from "@/components/crm/customer-detail-modal"
import { OccasionCarePanel } from "@/components/crm/occasion-care-panel"
import { ExportCustomersButton } from "@/components/crm/export-customers-button"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"
import { getIndustryPlugin, getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import type { CustomerMasterIndex, OccasionReminder } from "@/modules/crm/domain/customer-master-index"
import { MobileMenuButton } from "@/components/layout/mobile-nav-context"

/** Nhãn hạng khách hiển thị tiếng Việt, không để mã tiếng Anh trên màn hình (CLAUDE.md #6). */
const TIER_LABEL: Record<string, string> = {
  VIP: "VIP",
  GOLD: "Vàng",
  SILVER: "Bạc",
  BRONZE: "Đồng",
  NEW: "Mới",
}

export default function CRMPage() {
  const { orgName, can, organization } = useSession()
  const { t, dict } = useI18n()
  const ti = getIndustryTerminology(organization?.industry)
  const [customers, setCustomers] = useState<CustomerMasterIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("")

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Reminders drawer
  const [reminders, setReminders] = useState<OccasionReminder[]>([])
  const [showReminders, setShowReminders] = useState(false)
  const [scanningReminders, setScanningReminders] = useState(false)

  const loadCustomers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (tierFilter) params.set("tier", tierFilter)

    fetch(`/api/v1/crm/customers?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        setCustomers(res.items ?? [])
      })
      .catch(() => {
        // Im lặng fallback về danh sách rỗng khi lỗi mạng
      })
      .finally(() => setLoading(false))
  }, [search, tierFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu từ API khi mount/đổi tham số; setState nằm trong hàm tải (nợ #149)
    loadCustomers()
  }, [loadCustomers])

  async function handleScanReminders() {
    setScanningReminders(true)
    try {
      const res = await fetch("/api/v1/crm/reminders/upcoming?days=14").then((r) => r.json())
      setReminders(res.items ?? [])
      setShowReminders(true)
    } finally {
      setScanningReminders(false)
    }
  }

  const tierColors: Record<string, "danger" | "warning" | "neutral" | "success" | "accent"> = {
    VIP: "danger",
    GOLD: "warning",
    SILVER: "accent",
    BRONZE: "neutral",
    NEW: "neutral",
  }

  const industryPlugin = getIndustryPlugin(organization?.industry)
  const industryName = industryPlugin?.identity?.name || "Cửa hàng"

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Header chuẩn có Top-Right Action Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 py-4 backdrop-blur-sm">
        <div className="flex items-start"><MobileMenuButton /><div>
          {/* Tiêu đề ngắn; giải thích chi tiết trong "?" (OPERATING_PRINCIPLES §6.1) */}
          <div className="flex items-center gap-2">
            <h1 className="text-title font-extrabold text-foreground">Khách hàng</h1>
            <InfoTip label="Khách hàng" side="bottom">
              Hồ sơ khách hàng hợp nhất · Phân tầng khách tự động · Nhắc ngày kỷ niệm · {industryName}
            </InfoTip>
          </div>
        </div></div>

        {/* Top-Right Action Header */}
        <div className="flex items-center gap-2">
          {(can("Q1") || can("Q5")) && (
            <ExportCustomersButton tier={tierFilter} search={search} />
          )}
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-semibold flex items-center gap-1.5"
          >
            <UserPlus size={16} /> Thêm khách hàng
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScanReminders}
            disabled={scanningReminders}
            className="flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-primary" />
            {scanningReminders ? "Đang quét..." : "⚡ Quét dịp sắp tới (14 ngày)"}
          </Button>
        </div>
      </header>

      {/* 2. Main content */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Khối hướng dẫn SSOT FeatureGuidanceCard */}
        <FeatureGuidanceCard
          badgeLabel="HƯỚNG DẪN KHÁCH HÀNG"
          badgeIcon={Users}
          title="Quản lý khách hàng và chăm sóc"
          description="Lưu hồ sơ khách từ lịch sử đơn hàng, tự phân hạng khách (VIP, Vàng, Bạc, Đồng) và chỉ gửi tin khi khách đã đồng ý."
          tips={[
            { icon: "💎", text: "Phân hạng tự động theo tổng chi tiêu và số đơn thật của khách" },
            { icon: "🎂", text: `Lưu ngày kỷ niệm: Nhắc trước 7-14 ngày để tư vấn ${ti.sampleProduct} và lời nhắn thiệp` },
            { icon: "🛡️", text: "Chỉ gửi tin Zalo/SMS khi khách đã đồng ý nhận" },
          ]}
        />

        {/* Panel Lịch Chăm Sóc Ngày Kỷ Niệm (CRM-08..12) */}
        {showReminders && (
          <OccasionCarePanel
            reminders={reminders}
            shopName={orgName || "Cửa hàng của bạn"}
            onClose={() => setShowReminders(false)}
            onViewCustomer={(id) => setSelectedCustomerId(id)}
          />
        )}

        {/* Thanh công cụ tìm kiếm & lọc */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              loadCustomers()
            }}
            className="flex items-center gap-2 flex-1 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tên, số điện thoại hoặc mã KH..."
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Tìm kiếm
            </Button>
          </form>

          {/* Bộ lọc hạng khách */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-muted-foreground mr-1">Hạng:</span>
            {(["", "VIP", "GOLD", "SILVER", "BRONZE", "NEW"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-full text-caption transition-colors ${
                  tierFilter === t
                    ? "bg-primary text-white font-bold"
                    : "bg-surface border border-border text-text-muted hover:bg-surface-alt hover:text-text"
                }`}
              >
                {TIER_LABEL[t] ?? "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng danh sách khách hàng */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-border bg-surface-alt font-bold text-caption text-text-muted">
              <tr>
                <th className="px-4 py-3">Mã KH</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Hạng khách</th>
                <th className="px-4 py-3">Tổng chi tiêu</th>
                <th className="px-4 py-3 whitespace-nowrap">Số đơn</th>
                <th className="hidden md:table-cell px-4 py-3">Dịp kỷ niệm</th>
                <th className="hidden lg:table-cell px-4 py-3">Sở thích</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 px-4">
                    <SkeletonBlock lines={4} />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-caption text-text-muted">
                    Chưa có khách hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-primary">{c.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-text">{c.name}</div>
                      <div className="text-caption text-text-muted">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={tierColors[c.metrics?.tier] ?? "neutral"} className="font-bold">
                        {c.metrics?.tier === "VIP" ? "VIP" : c.metrics?.tier === "GOLD" ? "Vàng" : c.metrics?.tier === "SILVER" ? "Bạc" : c.metrics?.tier === "BRONZE" ? "Đồng" : "Khách mới"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-primary">
                      {Number(c.metrics?.totalSpentVnd ?? 0).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">{c.metrics?.orderCount ?? 0} đơn</td>
                    <td className="hidden md:table-cell px-4 py-3">
                      {c.occasions?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <Calendar className="h-3 w-3" /> {c.occasions[0]?.name} ({c.occasions[0]?.date})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground">
                      {c.preferences?.preferredFlowers?.slice(0, 2).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="text-xs font-semibold"
                      >
                        Hồ sơ Master <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
      <CreateCustomerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadCustomers}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onUpdated={loadCustomers}
      />
    </div>
  )
}
