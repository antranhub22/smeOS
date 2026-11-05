"use client"

import React from "react"
import { Clock } from "@/components/ui/icon-set/clock"
import { RefreshCw } from "@/components/ui/icon-set/refresh-cw"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { PlatformFeedPost } from "./platform-feed-preview"

export interface SchedulePostItemCardProps {
  item: PlatformFeedPost
  isChecked: boolean
  isActive: boolean
  onSelect: () => void
  onToggleCheck: () => void
  onRetry: () => void
  formatTime: (isoStr?: string | null) => string
}

export function SchedulePostItemCard({
  item,
  isChecked,
  isActive,
  onSelect,
  onToggleCheck,
  onRetry,
  formatTime,
}: SchedulePostItemCardProps) {
  const isError = item.status === "failed" || item.status === "error"

  return (
    <Card
      className={`relative flex items-center gap-3.5 p-3.5 transition-all cursor-pointer border ${
        isActive
          ? "border-primary ring-1 ring-primary/20 bg-primary/[0.02]"
          : "border-border hover:border-primary/40 bg-surface"
      }`}
    >
      <div className="relative z-10 flex">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggleCheck}
          aria-label={`Chọn bài ${item.title}`}
        />
      </div>
      {item.media_url && (
        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-alt border border-border shadow-2xs">
          <img
            src={item.media_url}
            alt={item.title}
            onError={(e) => {
              e.currentTarget.src = "/images/sample-flower.jpg"
            }}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {/* Nút chính phủ cả thẻ (after:inset-0) — ô chọn và nút Thử lại nằm trên lớp phủ */}
        <Button variant="ghost"
          type="button"
          onClick={onSelect}
          aria-current={isActive || undefined}
          className="h-auto p-0 justify-start gap-0 block w-full truncate text-left text-body font-bold text-text after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {item.title}
        </Button>
        <div className="text-caption text-text-muted flex items-center gap-2 mt-0.5">
          <span className="font-semibold text-primary">{item.channel_label}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {formatTime(item.scheduled_time || item.created_at)}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
        <Badge
          tone={
            item.status === "scheduled"
              ? "success"
              : item.status === "draft"
              ? "neutral"
              : "danger"
          }
          className="text-caption"
        >
          {item.status === "scheduled"
            ? "Đã lên lịch"
            : item.status === "draft"
            ? "Bản nháp"
            : "Lỗi"}
        </Badge>

        {isError && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRetry()
            }}
            className="text-caption text-danger hover:bg-danger/10 gap-1 h-7 px-2"
          >
            <RefreshCw size={12} /> Thử lại
          </Button>
        )}
      </div>
    </Card>
  )
}
