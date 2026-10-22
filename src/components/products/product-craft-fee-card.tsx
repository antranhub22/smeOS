"use client"

import React, { useState } from "react"
import { Coins, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CraftComplexity, IndustryCraftFeeSpec } from "@/modules/organization/domain/industry-plugin-contract"

interface ProductCraftFeeCardProps {
  productId: string
  attributes: Record<string, unknown>
  spec: IndustryCraftFeeSpec
  onUpdated?: (() => void) | undefined
}

const LEVELS: CraftComplexity[] = ["EASY", "MEDIUM", "HARD"]

/**
 * Phí làm thay riêng của mẫu (cách tính "Phí cố định theo từng mẫu") và độ khó (cách tính
 * "Nguyên liệu + công theo độ khó"). Lưu ở `products.attributes.craft_fee_vnd` / `craft_complexity`.
 */
export function ProductCraftFeeCard({ productId, attributes, spec, onUpdated }: ProductCraftFeeCardProps) {
  const [fee, setFee] = useState<number>(typeof attributes.craft_fee_vnd === "number" ? attributes.craft_fee_vnd : 0)
  const [level, setLevel] = useState<CraftComplexity | "">(
    attributes.craft_complexity === "EASY" || attributes.craft_complexity === "MEDIUM" || attributes.craft_complexity === "HARD" ? attributes.craft_complexity : ""
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const next: Record<string, unknown> = { ...attributes, craft_fee_vnd: fee > 0 ? fee : null, craft_complexity: level || null }
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributes: next }),
      })
      if (!res.ok) throw new Error(`Lưu thất bại (${res.status})`)
      setMessage({ ok: true, text: "Đã lưu." })
      onUpdated?.()
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Không lưu được" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div>
        <h3 className="text-body font-extrabold text-foreground flex items-center gap-2">
          <Coins size={18} className="text-primary" /> {spec.feeLabel} của mẫu này
        </h3>
        <p className="text-caption text-text-muted">Dùng khi cửa hàng chọn cách tính theo từng mẫu hoặc theo độ khó. Để trống thì tính theo % giá hàng.</p>
      </div>
      <label className="flex items-center justify-between gap-3 text-body-sm text-foreground">
        Phí cố định cho một sản phẩm
        <input
          type="number"
          min={0}
          step={10_000}
          value={fee || ""}
          onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))}
          placeholder="Chưa đặt"
          className="w-36 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-right font-bold"
        />
      </label>
      <label className="flex items-center justify-between gap-3 text-body-sm text-foreground">
        Độ khó khi làm
        <select value={level} onChange={(e) => setLevel(e.target.value as CraftComplexity | "")} className="w-36 px-2.5 py-1.5 rounded-lg border border-border bg-surface">
          <option value="">Chưa đặt</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {spec.complexityLabels[l]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center justify-end gap-3">
        {message && <span className={`text-caption ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</span>}
        <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Lưu"}
        </Button>
      </div>
    </Card>
  )
}
