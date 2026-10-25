"use client"

import React from "react"
import {
  Store,
  Palette,
  QrCode,
  DollarSign,
  Gift,
  ShieldCheck,
  FileText,
  Send,
  Cpu,
} from "lucide-react"

export type SettingsTab =
  | "INFO"          // 1. Thông tin cơ sở & Pháp lý (L1 Master)
  | "BRANDING"      // 2. Nhận diện thương hiệu (Logo, màu, dịp)
  | "PAYMENT"       // 3. Tài khoản ngân hàng & VietQR
  | "DEPOSIT"       // 4. Đặt cọc, Thanh toán & Dải giá
  | "PROMOTIONS"    // 5. Danh mục ưu đãi (Voucher & Quà tặng)
  | "COMMITMENTS"   // 6. Cam kết chất lượng
  | "AGREEMENTS"    // 7. Thỏa thuận đặt hàng
  | "BROCHURE_FLOW" // 8. Cơ chế Thẻ Chào & Quy trình
  | "AI_CHANNELS"   // 9. Trợ lý AI & Mạng xã hội
  | "COLLECTION_PROFILE" // 10. Danh mục thu thập chuỗi (§9.5.8)

interface SettingsTabsNavProps {
  activeTab: SettingsTab
  onSelectTab: (tab: SettingsTab) => void
  policyCounts: {
    promotions: number
    commitments: number
    agreements: number
  }
}

export function SettingsTabsNav({
  activeTab,
  onSelectTab,
  policyCounts,
}: SettingsTabsNavProps) {
  const tabs = [
    { key: "INFO" as const, label: "1. Thông Tin Tiệm", icon: Store },
    { key: "BRANDING" as const, label: "2. Thương Hiệu", icon: Palette },
    { key: "PAYMENT" as const, label: "3. Nhận Thanh Toán", icon: QrCode },
    { key: "DEPOSIT" as const, label: "4. Đặt Cọc & Giá", icon: DollarSign },
    { key: "PROMOTIONS" as const, label: `5. Ưu Đãi (${policyCounts.promotions})`, icon: Gift },
    { key: "COMMITMENTS" as const, label: `6. Cam Kết (${policyCounts.commitments})`, icon: ShieldCheck },
    { key: "AGREEMENTS" as const, label: `7. Thỏa Thuận (${policyCounts.agreements})`, icon: FileText },
    { key: "BROCHURE_FLOW" as const, label: "8. Thẻ Chào & Quy Trình", icon: Send },
    { key: "AI_CHANNELS" as const, label: "9. AI & Kênh", icon: Cpu },
    { key: "COLLECTION_PROFILE" as const, label: "10. Thu Thập Chuỗi", icon: ShieldCheck },
  ]

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-text-muted hover:text-text hover:bg-background"
            }`}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
