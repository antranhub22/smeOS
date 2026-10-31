"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { Route } from "next"
import { UserPlus } from "@/components/ui/icons"
import { EmptyState } from "@/components/ui/empty-state"
import { InlineError } from "@/components/ui/inline-error"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/i18n/formatters"
import { LEAD_STATUS_LABELS } from "@/modules/acquisition/domain/lead-rules"
import { leadSourceLabel } from "@/modules/orders/domain/lead-queue"
import { EntryActionsSettingsPanel } from "@/components/orders/entry-actions-settings"
import { acquisitionApi, type LeadItem, type LeadStatus } from "./acquisition-api"

const STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "WON", "LOST"]

function sourceLabel(lead: LeadItem): string {
  if (lead.short_link) return lead.short_link.placement_label ? `${lead.short_link.name} · ${lead.short_link.placement_label}` : lead.short_link.name
  return lead.source === "CATALOG_LINK" ? "Trang catalog" : lead.source === "SHORT_LINK" ? "Link/QR" : leadSourceLabel(lead.source)
}

/** Khách để lại tên + SĐT trên trang công khai; nhân viên đổi trạng thái chăm sóc. */
export function LeadsTab({ onCountsChange }: { onCountsChange: (counts: Record<string, number>) => void }) {
  const [filter, setFilter] = useState<LeadStatus | undefined>("NEW")
  const [leads, setLeads] = useState<LeadItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(
    () =>
      acquisitionApi
        .listLeads(filter)
        .then((p) => {
          setLeads(p.items)
          setError(null)
          onCountsChange(p.counts)
        })
        .catch((e: Error) => setError(e.message)),
    [filter, onCountsChange],
  )

  useEffect(() => {
    void fetchLeads()
  }, [fetchLeads])

  const load = () => {
    setError(null)
    setLeads(null)
    void fetchLeads()
  }

  const selectFilter = (s: LeadStatus | undefined) => {
    setLeads(null)
    setFilter(s)
  }

  const changeStatus = async (lead: LeadItem, status: LeadStatus) => {
    try {
      await acquisitionApi.updateLead(lead.id, { status })
      void fetchLeads()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không cập nhật được")
    }
  }

  return (
    <div className="space-y-4">
      <EntryActionsSettingsPanel />
      <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1.5">
        {[undefined, ...STATUSES].map((s) => (
          <button
            key={s ?? "ALL"}
            type="button"
            aria-pressed={filter === s}
            onClick={() => selectFilter(s)}
            className={`h-8 rounded-lg px-3 text-caption font-medium ${filter === s ? "bg-primary text-white" : "bg-surface text-text border border-border"}`}
          >
            {s ? LEAD_STATUS_LABELS[s] : "Tất cả"}
          </button>
        ))}
      </div>
      {error && <InlineError message={error} onRetry={load} />}
      {leads === null && !error && <SkeletonBlock lines={3} label="Đang tải khách để lại thông tin" />}
      {leads?.length === 0 && (
        <EmptyState
          icon={UserPlus}
          title={filter ? `Không có khách ở trạng thái "${LEAD_STATUS_LABELS[filter]}"` : "Chưa có khách để lại thông tin"}
          reason="Khách điền tên và số điện thoại ở cuối trang catalog công khai sẽ hiện ở đây."
        />
      )}
      {leads && leads.length > 0 && (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li key={lead.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5">
                <div className="text-body font-semibold text-text">
                  {lead.customer_id ? <Link href={`/khach-hang?id=${lead.customer_id}` as Route} className="hover:underline">{lead.name}</Link> : lead.name}
                </div>
                <a href={`tel:${lead.phone}`} className="text-body-sm text-primary hover:underline">{lead.phone}</a>
                <p className="text-caption text-text-muted">
                  {formatDateTime(lead.created_at)} · Nguồn: {sourceLabel(lead)}
                  {lead.utm_campaign ? ` · Chiến dịch: ${lead.utm_campaign}` : ""}
                </p>
                {lead.message && <p className="text-body-sm text-text">{lead.message}</p>}
              </div>
              <label className="flex shrink-0 items-center gap-2 text-caption text-text">
                <span>Trạng thái</span>
                <select
                  value={lead.status}
                  onChange={(e) => void changeStatus(lead, e.target.value as LeadStatus)}
                  className="h-9 rounded-lg border border-border bg-surface px-2 text-body-sm text-text"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
