"use client"

import React from "react"
import { MapPin, Star, Layers } from "lucide-react"
export interface DispatchedCandidateBranch {
  branchId: string
  branchName: string
  distanceKm: number
  qualityScore: number
  activeJobsCount: number
  totalScore?: number
  rank: number
  channels?: {
    hasTelegram?: boolean
    hasZalo?: boolean
    phone?: string | null
  }
}

export interface ChainBranchCardProps {
  branch: DispatchedCandidateBranch
  isSelected: boolean
  onToggle: (branchId: string) => void
}

export function ChainBranchCard({ branch, isSelected, onToggle }: ChainBranchCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(branch.branchId)}
      className={`p-2.5 rounded-xl border text-caption text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
        isSelected
          ? "border-primary bg-surface shadow-xs"
          : "border-border/70 bg-surface/60 opacity-60 hover:opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-1.5 w-full">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-caption text-foreground truncate">
              {branch.branchName}
            </span>
            {branch.rank <= 3 && (
              <span className="text-caption font-bold px-1 rounded bg-warning/10 text-warning">
                #{branch.rank}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-caption text-text-muted mt-0.5">
            <span className="flex items-center gap-0.5">
              <MapPin size={10} className="text-primary" />
              <strong>{branch.distanceKm > 0 ? `${branch.distanceKm} km` : "Tại chỗ"}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-warning" />
              {branch.qualityScore}/100
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Layers size={10} />
              {branch.activeJobsCount} đơn
            </span>
          </div>
        </div>

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(branch.branchId)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0 mt-0.5"
        />
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-caption w-full">
        <div className="flex items-center gap-1">
          {branch.channels?.hasTelegram && (
            <span className="px-1 py-0.5 rounded bg-info/10 text-info font-bold">
              Telegram riêng
            </span>
          )}
          {branch.channels?.hasZalo && (
            <span className="px-1 py-0.5 rounded bg-primary/10 text-primary font-bold">
              Zalo
            </span>
          )}
        </div>
        <span className="text-text-muted font-mono">{branch.channels?.phone || "—"}</span>
      </div>
    </button>
  )
}
