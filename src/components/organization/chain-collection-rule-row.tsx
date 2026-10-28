"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { type FieldDefinitionV2, type PropagationTarget } from "@/modules/field-platform/domain/field-registry-v2"
import { type CollectionRule } from "@/modules/field-platform/domain/chain-collection-profile"

interface RuleRowProps {
  readonly field: FieldDefinitionV2
  readonly rule: CollectionRule
  readonly onChangeRule: (updated: CollectionRule) => void
}

export function ChainCollectionRuleRow({ field, rule, onChangeRule }: RuleRowProps) {
  const isS2 = field.sensitivity === "S2_CONFIDENTIAL" || field.pii.isPii

  const getSensitivityBadge = () => {
    switch (field.sensitivity) {
      case "S0_PUBLIC":
        return <Badge tone="neutral" className="text-caption">S0 Công khai</Badge>
      case "S1_INTERNAL":
        return <Badge tone="accent" className="text-caption">S1 Nội bộ</Badge>
      case "S2_CONFIDENTIAL":
        return <Badge tone="warning" className="text-caption">S2 Bảo mật</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 hover:border-primary/40 bg-surface transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-body-sm text-text">{field.fieldName.vi}</span>
          {getSensitivityBadge()}
          {field.pii.isPii && (
            <span className="px-1.5 py-0.5 rounded text-caption font-semibold bg-danger/10 text-danger border border-danger/20">
              Cá nhân
            </span>
          )}
        </div>
        <p className="text-caption text-text-muted mt-0.5 font-mono truncate">{field.fieldKey}</p>
        
        {isS2 && (
          <input
            type="text"
            placeholder="Mục đích thu thập (bắt buộc với dữ liệu cá nhân)…"
            value={rule.purpose ?? ""}
            onChange={(e) => onChangeRule({ ...rule, purpose: e.target.value })}
            className="mt-2 w-full text-caption px-2.5 py-1.5 rounded-lg border border-border bg-surface-alt focus:outline-primary focus:border-primary"
          />
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        <div className="flex flex-col items-start gap-1">
          <label className="text-caption font-semibold text-text-muted">Sàn (Tối thiểu)</label>
          <select
            value={rule.minForm}
            onChange={(e) => onChangeRule({ ...rule, minForm: e.target.value as PropagationTarget })}
            className="text-body-sm h-8 px-2 rounded-lg border border-border bg-surface focus:outline-primary font-medium"
          >
            <option value="NONE">NONE (Không thu)</option>
            <option value="AGGREGATED">AGGREGATED (Tổng hợp)</option>
            <option value="MASKED">MASKED (Che bảo mật)</option>
            <option value="RAW">RAW (Nguyên bản)</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1">
          <label className="text-caption font-semibold text-text-muted">Trần của chuỗi</label>
          <select
            value={rule.maxForm ?? field.propagation.ceiling.toChain}
            onChange={(e) => onChangeRule({ ...rule, maxForm: e.target.value as PropagationTarget })}
            className="text-body-sm h-8 px-2 rounded-lg border border-border bg-surface focus:outline-primary font-medium"
          >
            <option value="AGGREGATED">AGGREGATED (Tổng hợp)</option>
            <option value="MASKED">MASKED (Che bảo mật)</option>
            <option value="RAW">RAW (Nguyên bản)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
