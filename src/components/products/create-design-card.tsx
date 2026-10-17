"use client"

import React from "react"
import { Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getDesignFieldsConfig } from "./create-product-types"

interface CreateDesignCardProps {
  industryKey?: string
  shape: string
  setShape: (v: string) => void
  facing: string
  setFacing: (v: string) => void
  container: string
  setContainer: (v: string) => void
  primaryColor: string
  setPrimaryColor: (v: string) => void
}

export function CreateDesignCard({
  industryKey,
  shape,
  setShape,
  facing,
  setFacing,
  container,
  setContainer,
  primaryColor,
  setPrimaryColor,
}: CreateDesignCardProps) {
  const cfg = getDesignFieldsConfig(industryKey)

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 text-title-sm font-bold text-text">
        <Layers size={18} className="text-primary" />
        <span>{cfg.cardTitle}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-caption font-semibold text-text mb-1">
            {cfg.shapeLabel}
          </label>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {cfg.shapeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-caption font-semibold text-text mb-1">
            {cfg.facingLabel}
          </label>
          <select
            value={facing}
            onChange={(e) => setFacing(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {cfg.facingOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-caption font-semibold text-text mb-1">
            {cfg.containerLabel}
          </label>
          <input
            type="text"
            value={container}
            onChange={(e) => setContainer(e.target.value)}
            placeholder={cfg.containerPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>

        <div>
          <label className="block text-caption font-semibold text-text mb-1">
            Tông màu chủ đạo
          </label>
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="Đỏ, Pastel, Trắng kem..."
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
      </div>
    </Card>
  )
}
