import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
} from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export type BusinessDomain = "order" | "product" | "job" | "approval" | "general"

export interface StatusConfig {
  label: string
  tone: NonNullable<BadgeProps["tone"]>
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

export const STATUS_REGISTRY: Record<string, StatusConfig> = {
  // Common / General
  ACTIVE: { label: "Đang hoạt động", tone: "success", icon: CheckCircle2 },
  INACTIVE: { label: "Tạm dừng", tone: "neutral" },
  ENABLED: { label: "Đã bật", tone: "success" },
  DISABLED: { label: "Đã tắt", tone: "neutral" },
  SUCCESS: { label: "Thành công", tone: "success", icon: CheckCircle2 },
  ERROR: { label: "Lỗi", tone: "danger", icon: XCircle },
  WARNING: { label: "Cảnh báo", tone: "warning", icon: AlertCircle },

  // Orders
  DRAFT: { label: "Bản nháp", tone: "neutral" },
  PENDING: { label: "Chờ xử lý", tone: "warning", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", tone: "info" },
  PROCESSING: { label: "Đang xử lý", tone: "info", icon: Clock },
  SHIPPED: { label: "Đang giao", tone: "info" },
  COMPLETED: { label: "Hoàn tất", tone: "success", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", tone: "neutral", icon: XCircle },
  REJECTED: { label: "Đã từ chối", tone: "danger", icon: XCircle },

  // Products
  ARCHIVED: { label: "Đã lưu trữ", tone: "neutral" },
  OUT_OF_STOCK: { label: "Hết hàng", tone: "danger" },

  // Jobs
  QUEUED: { label: "Trong hàng đợi", tone: "neutral", icon: Clock },
  FAILED: { label: "Thất bại", tone: "danger", icon: XCircle },

  // Approvals
  APPROVED: { label: "Đã duyệt", tone: "success", icon: CheckCircle2 },
  EXPIRED: { label: "Hết hạn", tone: "neutral" },
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  label?: string
  tone?: BadgeProps["tone"]
  showIcon?: boolean
  size?: BadgeProps["size"]
}

export function StatusBadge({
  status,
  label: customLabel,
  tone: customTone,
  showIcon = true,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedKey = status.toUpperCase().trim()
  const config = STATUS_REGISTRY[normalizedKey] || {
    label: customLabel || status,
    tone: customTone || "neutral",
  }

  const tone = customTone || config.tone
  const label = customLabel || config.label
  const Icon = config.icon

  return (
    <Badge tone={tone} size={size} className={cn("gap-1 font-semibold", className)} {...props}>
      {showIcon && Icon && <Icon size={12} className="shrink-0" />}
      <span>{label}</span>
    </Badge>
  )
}
