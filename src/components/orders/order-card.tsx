"use client"

import React from "react"
import { Eye } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export interface OrderItemCardProps {
  id: string
  code: string
  status: string
  productionStatus: string
  deliveryStatus: string
  totalVnd: number
  cardMessage?: string
  deliveryAddress?: { recipientName?: string; phone?: string; street?: string }
  deliveryWindow?: { date: string; timeSlot?: string }
  items?: Array<{ description: string; quantity: number }>
  createdAt: string
}

export function OrderCard({
  order,
  onSelect,
}: {
  order: OrderItemCardProps
  onSelect: () => void
}) {
  const { dict, formatCurrency, formatTime } = useI18n()

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left cursor-pointer rounded-xl border border-border bg-surface p-3 transition-all hover:border-primary hover:shadow-sm space-y-2 text-body-sm focus-visible:outline-2 focus-visible:outline-primary min-h-11"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-primary">{order.code}</span>
        <span className="text-caption text-text-muted">
          {formatTime(order.createdAt)}
        </span>
      </div>

      <div>
        <div className="font-bold text-text">
          {order.deliveryAddress?.recipientName ?? dict.orders.actions.walkInCustomer}
        </div>
        <div className="text-text-muted truncate text-caption">
          {order.deliveryAddress?.street ?? dict.orders.actions.pickupAtShop}
        </div>
      </div>

      {order.items && order.items[0] && (
        <div className="text-caption text-text-muted bg-surface-alt px-2 py-1 rounded-lg">
          🌸 {order.items[0].description}{" "}
          {order.items.length > 1 ? `(+${order.items.length - 1} món)` : ""}
        </div>
      )}

      {order.cardMessage && (
        <div className="truncate text-caption italic text-warning">
          💌 {order.cardMessage}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="font-bold text-primary">
          {formatCurrency(order.totalVnd)}
        </span>
        <span className="text-caption text-primary flex items-center gap-1 font-semibold">
          <Eye size={13} aria-hidden="true" /> {dict.orders.actions.viewDetails}
        </span>
      </div>
    </button>
  )
}

