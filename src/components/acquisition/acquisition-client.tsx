"use client"

import { useCallback, useState } from "react"
import { Plus, QrCode, UserPlus } from "@/components/ui/icons"
import { FeatureGuidanceCard } from "@/components/ui/feature-guidance-card"
import { TabActionHeader } from "@/components/ui/tab-header"
import { LeadsTab } from "./leads-tab"
import { ShortLinksTab } from "./short-links-tab"

type TabId = "links" | "leads"

/** Thu hút khách (Bước 4): mã QR & link động có thống kê + khách để lại thông tin. */
export function AcquisitionClient({ initialTab }: { initialTab: TabId }) {
  const [tab, setTab] = useState<TabId>(initialTab)
  const [creating, setCreating] = useState(false)
  const [newLeads, setNewLeads] = useState<number | undefined>(undefined)
  const onCountsChange = useCallback((counts: Record<string, number>) => setNewLeads(counts.NEW ?? 0), [])

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FeatureGuidanceCard
        guidanceId="thu-hut-khach"
        tag="THU HÚT KHÁCH HÀNG"
        title="Mã QR, link bán hàng và khách để lại thông tin"
        description="Tạo một mã QR hoặc link cho mỗi nơi bạn quảng bá để biết khách đến từ đâu. Khách để lại tên và số điện thoại sẽ vào danh sách khách hàng để bạn gọi lại."
        tips={[
          "Mỗi chỗ đặt nên có mã riêng (quầy, tờ rơi, xe giao) để so sánh nơi nào hiệu quả.",
          "Đổi trang đích bất cứ lúc nào mà không phải in lại mã.",
          "Khách chỉ được lưu khi đã đồng ý cho cửa hàng liên hệ.",
        ]}
      />
      <TabActionHeader
        tabs={[
          { id: "links", label: "Mã QR và link", icon: QrCode },
          { id: "leads", label: "Khách để lại thông tin", icon: UserPlus, ...(newLeads ? { badge: newLeads, badgeTone: "accent" as const } : {}) },
        ]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as TabId)}
        primaryActions={tab === "links" ? [{ id: "create", label: "Tạo mã mới", icon: Plus, onClick: () => setCreating(true), disabled: creating }] : []}
      />
      {tab === "links" ? (
        <ShortLinksTab creating={creating} onCreatingChange={setCreating} />
      ) : (
        <LeadsTab onCountsChange={onCountsChange} />
      )}
    </div>
  )
}
