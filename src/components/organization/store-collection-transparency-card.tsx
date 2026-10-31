"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { ShieldCheck, Info, CheckCircle2, Lock } from "@/components/ui/icons"
import type { StoreCollectionTransparencyResult } from "@/modules/field-platform/use-cases/get-store-collection-transparency"

interface TransparencyCardProps {
  readonly storeId?: string
}

export function StoreCollectionTransparencyCard({ storeId }: TransparencyCardProps) {
  const [data, setData] = useState<StoreCollectionTransparencyResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransparency() {
      setLoading(true)
      try {
        const url = storeId
          ? `/api/v1/store/collection-transparency?storeId=${storeId}`
          : "/api/v1/store/collection-transparency"
        const res = await fetch(url)
        if (res.ok) {
          const json = await res.json()
          setData(json.data as StoreCollectionTransparencyResult)
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false)
      }
    }
    void fetchTransparency()
  }, [storeId])

  if (loading) {
    return <SkeletonBlock lines={4} />
  }

  if (!data || data.items.length === 0) {
    return (
      <Card className="p-4 border-dashed border-border bg-surface text-center">
        <Info size={18} className="mx-auto text-text-muted mb-1.5" />
        <p className="text-body-sm font-semibold text-text">Chuỗi chưa áp dụng danh mục thu thập bắt buộc</p>
        <p className="text-caption text-text-muted mt-0.5">
          Dữ liệu của cửa hàng hiện tại đang được lưu trữ cục bộ theo phạm vi tổ chức.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-5 border-border bg-surface space-y-4">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-body-sm text-text">
              Dữ liệu chuỗi đang thu thập từ {data.storeName}
            </h3>
            <p className="text-caption text-text-muted">
              Minh bạch thu thập theo Chain Collection Profile v{data.profileVersion} (§9.5.8)
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {data.items.map((item) => (
          <div key={item.fieldKey} className="py-2.5 flex items-center justify-between gap-3 text-caption">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-text">{item.fieldNameVi}</span>
                {item.isMandatory && (
                  <span className="text-caption font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Bắt buộc
                  </span>
                )}
              </div>
              {item.purpose && (
                <p className="text-text-muted italic flex items-center gap-1 text-caption">
                  <Lock size={10} />
                  <span>Mục đích: {item.purpose}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-caption font-mono font-semibold px-2 py-0.5 rounded bg-surface-alt border border-border">
                Dạng: {item.effectiveTarget}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
