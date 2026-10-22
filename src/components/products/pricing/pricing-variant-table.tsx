"use client"

import React, { useState } from "react"
import { optionName, priceLabel, summarizePricing, type PriceOptionRow, type ProductPricing } from "@/modules/products/domain/product-pricing"
import { formatVndInput, parseVndInput } from "./pricing-form"
import { MoneyInput } from "./money-input"
import { VariantImageCell } from "./variant-image-cell"

interface Props {
  pricing: ProductPricing
  setPricing: (p: ProductPricing) => void
}

/** Bảng giá từng phiên bản: giá thường, giá cao điểm, đang bán. Có điền nhanh. */
export function PricingVariantTable({ pricing, setPricing }: Props) {
  const [bulkPrice, setBulkPrice] = useState("")
  const [peakPercent, setPeakPercent] = useState("")
  if (pricing.rows.length === 0) {
    return <p className="text-caption text-text-muted">Chọn ít nhất một giá trị cho nhóm đặc điểm để nhập giá.</p>
  }

  const setRow = (i: number, patch: Partial<PriceOptionRow>) =>
    setPricing({ ...pricing, rows: pricing.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
  const fillEmpty = () => {
    const v = parseVndInput(bulkPrice)
    if (v !== null) setPricing({ ...pricing, rows: pricing.rows.map((r) => (r.priceVnd === null ? { ...r, priceVnd: v } : r)) })
  }
  const applyPeak = () => {
    const pct = Number(peakPercent)
    if (!(pct > 0 && pct <= 300)) return
    setPricing({
      ...pricing,
      rows: pricing.rows.map((r) => (r.priceVnd === null ? r : { ...r, peakPriceVnd: Math.round((r.priceVnd * (100 + pct)) / 100 / 1000) * 1000 })),
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-alt p-2">
        <div className="w-36">
          <MoneyInput label="Giá cho các ô còn trống" value={bulkPrice} onChange={setBulkPrice} placeholder="Giá chung" />
        </div>
        <button type="button" onClick={fillEmpty} className="h-10 rounded-xl border border-border bg-surface px-3 text-body-sm font-semibold text-text">
          Điền ô còn trống
        </button>
        <div className="flex items-center gap-1">
          <span className="text-caption text-text-muted">Cao điểm +</span>
          <input
            inputMode="numeric"
            aria-label="Phần trăm tăng giá ngày cao điểm"
            value={peakPercent}
            onChange={(e) => setPeakPercent(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="h-10 w-16 rounded-xl border border-border bg-surface px-2 text-body-sm"
            placeholder="20"
          />
          <span className="text-caption text-text-muted">%</span>
        </div>
        <button type="button" onClick={applyPeak} className="h-10 rounded-xl border border-border bg-surface px-3 text-body-sm font-semibold text-text">
          Tính giá cao điểm
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-alt text-caption text-text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Phiên bản ({pricing.dimensions.map((d) => d.label).join(" / ")})</th>
              <th className="px-3 py-2 text-left font-semibold">Giá thường (₫)</th>
              <th className="px-3 py-2 text-left font-semibold">Giá cao điểm (₫)</th>
              <th className="px-3 py-2 text-left font-semibold">Ảnh riêng</th>
              <th className="px-3 py-2 text-center font-semibold">Đang bán</th>
            </tr>
          </thead>
          <tbody>
            {pricing.rows.map((r, i) => (
              <tr key={r.values.join("|")} className={`border-t border-border ${r.active ? "" : "opacity-60"}`}>
                <td className="px-3 py-2 font-semibold text-text whitespace-nowrap">{optionName(r.values)}</td>
                <td className="px-3 py-1 min-w-32">
                  <MoneyInput
                    label={`Giá thường ${optionName(r.values)}`}
                    value={formatVndInput(r.priceVnd)}
                    onChange={(v) => setRow(i, { priceVnd: parseVndInput(v) })}
                    placeholder="Bắt buộc"
                  />
                </td>
                <td className="px-3 py-1 min-w-32">
                  <MoneyInput
                    label={`Giá cao điểm ${optionName(r.values)}`}
                    value={formatVndInput(r.peakPriceVnd)}
                    onChange={(v) => setRow(i, { peakPriceVnd: parseVndInput(v) })}
                    placeholder="Như giá thường"
                  />
                </td>
                <td className="px-3 py-1">
                  <VariantImageCell label={optionName(r.values)} assetId={r.imageAssetId} onChange={(imageAssetId) => setRow(i, { imageAssetId })} />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    aria-label={`Đang bán ${optionName(r.values)}`}
                    checked={r.active}
                    onChange={(e) => setRow(i, { active: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-caption text-text-muted">
        Khách sẽ thấy: <span className="font-semibold text-text">{priceLabel(summarizePricing(pricing))}</span>. Khách chọn phiên bản nào thì trả đúng giá phiên bản đó.
      </p>
    </div>
  )
}
