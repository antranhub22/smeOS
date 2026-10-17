"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import type { IndustryPluginContract } from "@/modules/organization/domain/industry-plugin-contract"
import type { TerminologyGetter } from "./create-product-types"

interface CreateStoryCardProps {
  ti: TerminologyGetter
  industry: IndustryPluginContract
  description: string
  setDescription: (v: string) => void
}

export function CreateStoryCard({
  ti,
  industry,
  description,
  setDescription,
}: CreateStoryCardProps) {
  const placeholder =
    industry.identity.key === "FASHION"
      ? "Mô tả ý tưởng thiết kế, chất liệu sợi dệt, hướng dẫn bảo quản giữ phom dáng hoặc câu chuyện bộ sưu tập..."
      : industry.identity.key === "FNB"
      ? "Mô tả hương vị món ăn, công thức chế biến đặc trưng, nguồn gốc nguyên liệu tươi sạch..."
      : "Mô tả ý nghĩa mẫu hoa, cảm xúc gửi gắm hoặc hướng dẫn chăm sóc giúp hoa tươi lâu…"

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="text-title-sm font-bold text-text">
        Câu chuyện và thông điệp {ti("sampleProduct").toLowerCase()}
      </div>
      <div>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-surface p-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>
    </Card>
  )
}
