"use client"

import React, { Suspense } from "react"
import { ChainDataHub } from "@/components/chain-data/chain-data-hub"
import { SkeletonBlock } from "@/components/ui/skeleton"

export default function DuLieuChuoiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-7xl mx-auto w-full">
          <SkeletonBlock lines={6} label="Đang tải Trung Tâm Dữ Liệu Chuỗi…" />
        </div>
      }
    >
      <ChainDataHub />
    </Suspense>
  )
}
