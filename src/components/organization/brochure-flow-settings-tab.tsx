"use client"

import React from "react"
import { Send } from "lucide-react"
import { BrochureLanguageSettings } from "@/components/greeting-card/admin/brochure-language-settings"
import { BrochureWorkflowSettings } from "@/components/greeting-card/admin/brochure-workflow-settings"
import { BrochureStepTimeoutSettings } from "@/components/greeting-card/admin/brochure-step-timeout-settings"
import { BrochureStepSlaSettings } from "@/components/greeting-card/admin/brochure-step-sla-settings"
import { BrochureLinkLifetimeSettings } from "@/components/greeting-card/admin/brochure-link-lifetime-settings"
import { StaffNotifySettings } from "@/components/greeting-card/admin/staff-notify-settings"
import { TelegramDispatchConnector } from "@/components/greeting-card/admin/telegram-dispatch-connector"

/**
 * Tab 8: Thiết lập toàn diện cơ chế vận hành, quy trình duyệt, thời hạn và kênh điều phối Thẻ chào
 */
export function BrochureFlowSettingsTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
        <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
          <Send size={18} className="text-primary" /> Cơ Chế Vận Hành & Tự Động Hủy Đơn Thẻ Chào
        </h2>
        <p className="text-xs text-text-muted">
          Thiết lập quy trình duyệt (Tinh gọn / Tiêu chuẩn / Nghiêm ngặt), ngôn ngữ quốc tế, thời hạn hết hạn liên kết và thời gian giữ chỗ.
        </p>
      </div>

      {/* Thiết lập Ngôn ngữ & Khách Quốc tế */}
      <BrochureLanguageSettings />

      {/* Ma trận vận hành quy trình */}
      <BrochureWorkflowSettings />

      {/* Thời hạn & Tự động hủy đơn theo bước */}
      <BrochureStepTimeoutSettings />

      {/* Thời hạn hiệu lực của liên kết Thẻ Chào */}
      <BrochureLinkLifetimeSettings />

      {/* SLA xử lý đơn theo bước */}
      <BrochureStepSlaSettings />

      {/* Thông báo Telegram điều phối */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
        <h3 className="text-sm font-bold text-text mb-3">Thông Báo Kênh Điều Phối & Telegram</h3>
        <div className="space-y-4">
          <StaffNotifySettings />
          <TelegramDispatchConnector />
        </div>
      </div>
    </div>
  )
}
