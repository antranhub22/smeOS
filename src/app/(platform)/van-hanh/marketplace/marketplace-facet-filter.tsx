"use client"

// Bộ lọc nhiều tiêu chí dạng dropdown (PO 31/10/2026). Trong một nhóm: HOẶC; giữa các nhóm: VÀ.
import React, { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Filter, Search, X } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import type { FacetGroup, FacetSelection } from "@/modules/platform/domain/partner-marketplace-facets"

interface MarketplaceFacetFilterProps {
  groups: FacetGroup[]
  selection: FacetSelection
  onChange: (next: FacetSelection) => void
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").toLowerCase()

function toggle(selection: FacetSelection, key: string, value: string): FacetSelection {
  const current = selection[key] ?? []
  const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  const next = { ...selection, [key]: nextValues }
  if (nextValues.length === 0) delete (next as Record<string, readonly string[]>)[key]
  return next
}

export function MarketplaceFacetFilter({ groups, selection, onChange }: MarketplaceFacetFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const labelOf = useMemo(() => new Map(groups.map((g) => [g.key, g.label])), [groups])
  const chosen = Object.entries(selection).flatMap(([key, values]) => values.map((value) => ({ key, value })))

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Tìm không dấu trên cả tên nhóm lẫn tên tiêu chí
  const visible = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return groups
    return groups
      .map((g) => (fold(g.label).includes(q) ? g : { ...g, options: g.options.filter((o) => fold(o.value).includes(q)) }))
      .filter((g) => g.options.length > 0)
  }, [groups, query])

  return (
    <div className="space-y-2" ref={rootRef}>
      <div className="relative inline-block">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog">
          <Filter className="mr-1.5 h-4 w-4 text-primary" />
          Bộ lọc tiêu chí{chosen.length > 0 ? ` (${chosen.length})` : ""}
          <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>

        {open && (
          <div
            role="dialog"
            aria-label="Chọn tiêu chí lọc"
            className="absolute left-0 z-40 mt-2 flex max-h-[70vh] w-[min(92vw,30rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
          >
            <div className="relative border-b border-border p-2">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tiêu chí: quận, tủ mát, marketing…"
                className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-2 text-xs text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {visible.length === 0 && <p className="p-4 text-center text-xs text-text-muted">Không có tiêu chí phù hợp.</p>}
              {visible.map((g) => (
                <fieldset key={g.key} className="mb-3">
                  <legend className="px-1 pb-1 text-caption font-bold uppercase tracking-wide text-text-muted">{g.label}</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {g.options.map((o) => {
                      const active = selection[g.key]?.includes(o.value) ?? false
                      return (
                        <label
                          key={o.value}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors ${
                            active ? "border-primary bg-primary-muted font-semibold text-primary" : "border-border text-text hover:bg-surface-alt"
                          } ${o.count === 0 && !active ? "opacity-50" : ""}`}
                        >
                          <input type="checkbox" className="accent-primary" checked={active} onChange={() => onChange(toggle(selection, g.key, o.value))} />
                          {o.value}
                          <span className="text-text-muted">({o.count})</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border p-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange({})} disabled={chosen.length === 0}>
                Bỏ chọn tất cả
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Xong
              </Button>
            </div>
          </div>
        )}
      </div>

      {chosen.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chosen.map(({ key, value }) => (
            <span key={`${key}:${value}`} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-muted px-2.5 py-0.5 text-xs text-primary">
              <span className="text-text-muted">{labelOf.get(key)}:</span> {value}
              <button type="button" onClick={() => onChange(toggle(selection, key, value))} aria-label={`Bỏ tiêu chí ${value}`} className="rounded-full p-0.5 hover:bg-surface">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => onChange({})} className="text-xs font-medium text-text-muted underline hover:text-text">
            Xoá hết
          </button>
        </div>
      )}
    </div>
  )
}
