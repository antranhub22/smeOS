"use client"

// Bước duyệt ghép cột khi nhập tệp khảo sát: hệ thống tự ghép theo tên tiêu đề,
// người nhập sửa chỗ sai rồi mới nhập — tệp lệch cột không làm sai dữ liệu.
import React, { useMemo, useState } from "react"
import { AlertCircle, CheckCircle } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Disclosure } from "@/components/ui/disclosure"
import { SHOP_NAME_FIELD, SURVEY_COLUMNS } from "@/modules/platform/domain/partner-marketplace-columns"
import type { ColumnMapping, MatchSource } from "@/modules/platform/domain/partner-marketplace-column-match"

export interface ColumnMappingPreview {
  headers: string[]
  samples: string[]
  rowCount: number
  mapping: ColumnMapping
  source: MatchSource[]
}

interface MarketplaceColumnMappingDialogProps {
  fileName: string
  preview: ColumnMappingPreview
  busy: boolean
  /** Lỗi khi nhập (máy chủ từ chối) — hiện ngay trong hộp. */
  error?: string
  onCancel: () => void
  onConfirm: (mapping: ColumnMapping) => void
}

/** Chỉ số cột → chữ cột như Excel (0 → A, 26 → AA). */
function columnLetter(index: number): string {
  let n = index + 1
  let out = ""
  while (n > 0) {
    const r = (n - 1) % 26
    out = String.fromCharCode(65 + r) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

export function MarketplaceColumnMappingDialog({ fileName, preview, busy, error, onCancel, onConfirm }: MarketplaceColumnMappingDialogProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(preview.mapping)

  const usedBy = useMemo(() => {
    const m = new Map<number, number>()
    mapping.forEach((col, field) => col !== null && m.set(col, field))
    return m
  }, [mapping])

  const mappedCount = mapping.filter((c) => c !== null).length
  const unusedColumns = preview.headers.filter((h, i) => h && !usedBy.has(i))
  const missingShopName = mapping[SHOP_NAME_FIELD] === null
  const coreFields = SURVEY_COLUMNS.map((_, i) => i).filter((i) => SURVEY_COLUMNS[i]!.core)
  const otherFields = SURVEY_COLUMNS.map((_, i) => i).filter((i) => !SURVEY_COLUMNS[i]!.core)
  const otherUnmapped = otherFields.filter((i) => mapping[i] === null).length

  /** Chọn một cột cho trường: cột đó bị gỡ khỏi trường đang giữ (mỗi cột chỉ một trường). */
  function assign(field: number, col: number | null) {
    setMapping((prev) => prev.map((c, f) => (f === field ? col : col !== null && c === col ? null : c)))
  }

  const renderRow = (field: number) => {
    const def = SURVEY_COLUMNS[field]!
    const col = mapping[field] ?? null
    const auto = col !== null && col === preview.mapping[field] ? preview.source[field] : null
    const selectId = `map-field-${field}`
    return (
      <div key={def.key} className="grid gap-1 border-b border-border/60 py-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-start sm:gap-3">
        <label htmlFor={selectId} className="pt-1.5 text-sm font-medium text-text">
          {def.label}
          {field === SHOP_NAME_FIELD && <span className="text-danger-text"> *</span>}
        </label>
        <div className="min-w-0">
          <select
            id={selectId}
            value={col === null ? "" : String(col)}
            onChange={(e) => assign(field, e.target.value === "" ? null : Number(e.target.value))}
            className={`h-9 w-full rounded-lg border bg-surface px-2 text-sm text-text ${col === null ? "border-warning-border" : "border-border"}`}
          >
            <option value="">— Không lấy —</option>
            {preview.headers.map((h, i) => (
              <option key={i} value={i}>
                {`Cột ${columnLetter(i)} · ${h || "(không có tiêu đề)"}`}
                {usedBy.has(i) && usedBy.get(i) !== field ? ` — đang dùng cho ${SURVEY_COLUMNS[usedBy.get(i)!]!.label}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 truncate text-caption text-text-muted">
            {col === null
              ? "Chưa ghép — trường này sẽ để trống"
              : `${auto === "position" ? "Theo vị trí cột gốc · " : ""}Ví dụ: ${preview.samples[col] || "(trống)"}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !busy && onCancel()}
      size="lg"
      title="Ghép cột trước khi nhập"
      description={`${fileName} · ${preview.rowCount} dòng dữ liệu`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Huỷ
          </Button>
          <Button type="button" onClick={() => onConfirm(mapping)} disabled={busy || missingShopName}>
            {busy ? "Đang nhập tệp..." : `Nhập ${preview.rowCount} dòng`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
            missingShopName ? "border-danger-border bg-danger-bg text-danger-text" : "border-success-border bg-success-bg text-success-text"
          }`}
        >
          {missingShopName ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>
            {missingShopName
              ? "Chưa nhận ra cột Tên cửa hàng — chọn cột này để nhập được."
              : `Đã ghép ${mappedCount}/${SURVEY_COLUMNS.length} trường theo tên cột. Kiểm tra cột ví dụ, sửa chỗ chưa đúng rồi nhập.`}
          </span>
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <p className="text-sm text-text-muted">
          Hồ sơ cửa hàng trùng tên sẽ được ghi đè bằng dữ liệu trong tệp. Ảnh đã tải được giữ nguyên.
        </p>

        <section aria-label="Trường chính">{coreFields.map(renderRow)}</section>

        <Disclosure
          label={`Các trường còn lại (${otherFields.length})`}
          {...(otherUnmapped ? { appliedSummary: `${otherUnmapped} trường chưa ghép` } : {})}
        >
          {otherFields.map(renderRow)}
        </Disclosure>

        {unusedColumns.length > 0 && (
          <p className="text-caption text-text-muted">
            {`Cột trong tệp không dùng (${unusedColumns.length}): ${unusedColumns.join(" · ")}`}
          </p>
        )}
      </div>
    </Dialog>
  )
}
