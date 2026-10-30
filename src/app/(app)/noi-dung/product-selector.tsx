"use client"

/**
 * Component chọn sản phẩm từ Product Master (Bước 1A) cho Chức năng 04.
 * Tách ra khỏi page.tsx để tuân thủ SRP ≤350 dòng.
 */

import Link from "next/link"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SkeletonBlock } from "@/components/ui/skeleton"

export interface ProductOption {
  id: string
  name: string
  code?: string | undefined
  price?: number | undefined
  flowers?: string | undefined
  color?: string | undefined
  imageUrl?: string | undefined
}

interface ProductSelectorProps {
  products: ProductOption[]
  selectedProductId: string
  isLoading: boolean
  loadError: string | null
  sampleProductLabel: string
  onSelect: (id: string) => void
}

export function ProductSelector({
  products,
  selectedProductId,
  isLoading,
  loadError,
  sampleProductLabel,
  onSelect,
}: ProductSelectorProps) {
  return (
    <Card className="border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-text-muted">Bước 1: Chọn sản phẩm</div>
          <div className="text-title-sm font-extrabold text-text">Sản phẩm trong kho</div>
        </div>
        <Badge tone="accent" className="text-xs">
          {products.length} sản phẩm sẵn sàng
        </Badge>
      </div>

      {isLoading ? (
        <div className="py-4">
          <SkeletonBlock lines={3} label="Đang tải danh sách sản phẩm từ cơ sở dữ liệu..." />
        </div>
      ) : loadError ? (
        <div className="py-6 text-center text-xs text-danger bg-danger/10 rounded-lg border border-danger/30 p-3">
          {loadError}
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted bg-surface/50 rounded-lg p-4">
          Chưa có sản phẩm nào.{" "}
          <Link href="/san-pham/tao-moi" className="font-semibold text-primary underline">Thêm sản phẩm</Link> hoặc chọn &ldquo;Tải ảnh sản phẩm mới&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-h-[280px] overflow-y-auto pr-1">
          {products.map((prod) => {
            const isSelected = prod.id === selectedProductId
            return (
              <button
                key={prod.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(prod.id)}
                className={`text-left rounded-xl border p-3 transition flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border hover:border-text-muted bg-background"
                }`}
              >
                {prod.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center text-xl flex-shrink-0">
                    🌸
                  </div>
                )}
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-bold text-text-muted truncate">
                      {prod.code || "SKU"}
                    </span>
                    <span className="text-caption font-bold text-primary">
                      {prod.price ? `${prod.price.toLocaleString("vi-VN")}đ` : "Giá liên hệ"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-text line-clamp-1">{prod.name}</div>
                  <div className="text-caption text-text-muted line-clamp-1">
                    {prod.flowers || sampleProductLabel}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
