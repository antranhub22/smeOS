"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, SlidersHorizontal, Layers, CheckCircle2, ArrowRight } from "lucide-react"
import { INDUSTRY_JOURNEYS } from "@/modules/journey/domain/journey-catalog"
import type { JourneyDefinition } from "@/modules/journey/domain/journey-model"
import { createJourneyState } from "@/modules/journey/domain/journey-state"
import { ChoiceGrid } from "@/components/journey/choice-grid"
import { JourneyShell } from "@/components/journey/journey-shell"
import { IndustryEcosystemBoard } from "./industry-ecosystem-board"
import { INDUSTRY_REGISTRY } from "@/modules/organization/domain/industries"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY_EXPERT_MODE = "smeos_expert_mode_industry"

export function IndustryJourneyHome() {
  const router = useRouter()
  const [isExpertMode, setIsExpertMode] = useState<boolean>(false)
  const [activeJourney, setActiveJourney] = useState<JourneyDefinition | null>(null)
  const [journeyState, setJourneyState] = useState(() =>
    activeJourney ? createJourneyState(activeJourney) : null
  )

  const [selectedIndustryKey, setSelectedIndustryKey] = useState<string>("FLORAL")
  const selectedPlugin = INDUSTRY_REGISTRY[selectedIndustryKey] ?? INDUSTRY_REGISTRY.FLORAL!

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPERT_MODE)
      if (saved === "true") {
        setIsExpertMode(true)
      }
    } catch {
      // Bỏ qua lỗi storage
    }
  }, [])

  const handleToggleExpertMode = (enabled: boolean) => {
    setIsExpertMode(enabled)
    try {
      localStorage.setItem(STORAGE_KEY_EXPERT_MODE, String(enabled))
    } catch {
      // Bỏ qua
    }
  }

  const handleSelectJourney = (journey: JourneyDefinition) => {
    if (journey.id === "industry-ecosystem-overview") {
      setIsExpertMode(true)
      return
    }

    if (journey.primaryHref) {
      router.push(journey.primaryHref as never)
      return
    }

    setActiveJourney(journey)
    setJourneyState(createJourneyState(journey))
  }

  const handleBackToHome = () => {
    setActiveJourney(null)
    setJourneyState(null)
  }

  // 1. Chế độ Chuyên gia: Hiển thị Bảng điều phối hệ sinh thái đa ngành
  if (isExpertMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 py-2 bg-selected border border-border rounded-xl">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-body-sm font-semibold text-text">
              Bạn đang ở Chế độ chuyên gia (Bảng điều hành Hệ sinh thái Đa Ngành)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggleExpertMode(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border hover:bg-surface-alt text-caption font-bold text-primary transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Chuyển sang Chế độ hành trình tác vụ</span>
          </button>
        </div>
        <IndustryEcosystemBoard />
      </div>
    )
  }

  // 2. Chế độ Thực hiện Hành trình
  if (activeJourney && journeyState) {
    return (
      <JourneyShell
        journey={activeJourney}
        state={journeyState}
        onBackToHome={handleBackToHome}
      >
        <IndustryEcosystemBoard />
      </JourneyShell>
    )
  }

  // 3. Chế độ Mặc định: ChoiceGrid + Spotlight Card + Thanh chọn 7 Ngành
  return (
    <div className="space-y-6">
      {/* Thanh chọn nhanh 7 Ngành hàng */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-caption font-bold text-text uppercase tracking-wider">
              Chọn ngành hàng để kiểm tra hồ sơ chuẩn hóa:
            </span>
          </div>
          <Badge tone="accent" className="text-caption font-medium border border-primary/30 text-primary">
            7 Ngành Hàng Đã Kích Hoạt
          </Badge>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(INDUSTRY_REGISTRY).map(([key, plugin]) => {
            const isSelected = key === selectedIndustryKey
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedIndustryKey(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caption font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-alt border border-border text-text hover:bg-surface"
                }`}
              >
                <span>{plugin.identity.name}</span>
              </button>
            )
          })}
        </div>

        {/* Khối tóm tắt nhanh ngành được chọn */}
        <div className="p-3.5 rounded-xl bg-surface-alt/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-caption">
          <div className="space-y-1">
            <div className="font-bold text-text text-body-sm flex items-center gap-2">
              <span>{selectedPlugin.identity.name}</span>
              <span className="text-caption font-mono text-text-muted">({selectedPlugin.identity.key})</span>
            </div>
            <div className="text-text-muted flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Người làm: <strong className="text-text font-semibold">{selectedPlugin.terminology.makerTitle}</strong></span>
              <span>Sản phẩm mẫu: <strong className="text-text font-semibold">{selectedPlugin.terminology.sampleProduct}</strong></span>
              <span>BOM: <strong className="text-text font-semibold">{selectedPlugin.bomSpec.measurementUnits.slice(0, 3).join(", ")}</strong></span>
              <span>Mẫu in: <strong className="text-text font-semibold">{selectedPlugin.templates.printables.length} loại</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/van-hanh/nganh" as never)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-alt font-bold text-primary transition-colors cursor-pointer text-caption"
            >
              <span>Xem ma trận ngành</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ChoiceGrid
        title="BẠN MUỐN LÀM GÌ VỚI HỆ SINH THÁI SAAS ĐA NGÀNH?"
        subtitle="Trung tâm quản trị hợp đồng plugin, cấu hình AI Studio, mẫu ấn phẩm A6 và chuẩn hóa BOM cho 7 ngành hàng."
        journeys={INDUSTRY_JOURNEYS}
        onSelectJourney={handleSelectJourney}
        onSwitchToExpertMode={() => handleToggleExpertMode(true)}
        featuredJourneyId="industry-ecosystem-overview"
      />
    </div>
  )
}
