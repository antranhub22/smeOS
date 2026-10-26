"use client"

import React from "react"
import Link from "next/link"
import type { Route } from "next"
import { Cpu, Share2 } from "lucide-react"
import { DispatchReminderPolicyCard } from "@/components/coordinator/dispatch-reminder-policy-card"
import { useSession } from "@/lib/session"

/**
 * Tab 9: Cài đặt tích hợp AI, kênh mạng xã hội và nhắc việc điều phối
 */
export function AiChannelsSettingsTab() {
  const { can } = useSession()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
        <div>
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
            <Cpu size={18} />
          </div>
          <h3 className="text-sm font-bold text-text">Thiết Lập Trợ Lý AI</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Quản lý các đề xuất của AI (Proposal Mode), bảo vệ thông tin PII và cài đặt giới hạn chi phí.
          </p>
        </div>
        <Link
          href={"/cai-dat-ai" as Route}
          className="mt-4 px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-text text-center hover:bg-surface-alt transition-colors"
        >
          Mở Cấu Hình AI
        </Link>
      </div>

      <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
        <div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Share2 size={18} />
          </div>
          <h3 className="text-sm font-bold text-text">Kết Nối Mạng Xã Hội</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Đồng bộ tự động sản phẩm và bài đăng lên Facebook, Instagram, TikTok và Zalo OA.
          </p>
        </div>
        <Link
          href={"/ket-noi" as Route}
          className="mt-4 px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-text text-center hover:bg-surface-alt transition-colors"
        >
          Kết Nối Kênh
        </Link>
      </div>

      <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between sm:col-span-2">
        <DispatchReminderPolicyCard canEdit={can("R12")} />
      </div>
    </div>
  )
}
