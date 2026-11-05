"use client"

import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { variantUnitCostCredit, type VariantRenderOptions } from "@/modules/media/domain/variant-candidates"
import type { ScenePlan } from "@/modules/creative-production/domain/scene-plan-rules"
import type { CreativeStudioContextType } from "@/app/(app)/creative-studio/page"
import type { NarrativeScene } from "./variant-scene-types"

export type ScenePlanSectionProps = {
  context: CreativeStudioContextType | null
  scenePlan: ScenePlan | null
  planLoading: boolean
  planWriting: boolean
  planError: string | null
  planCtx: unknown
  renderOpts: VariantRenderOptions
  narrativeResultScenes: NarrativeScene[]
  handleWritePlan: (rewrite: boolean) => Promise<void>
  handleUseRulePlan: () => void
}

export function ScenePlanSection({
  context,
  scenePlan,
  planLoading,
  planWriting,
  planError,
  planCtx,
  renderOpts,
  narrativeResultScenes,
  handleWritePlan,
  handleUseRulePlan,
}: ScenePlanSectionProps) {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-caption font-bold text-text uppercase tracking-wider">Kịch bản bối cảnh hình ảnh theo chủ đề</span>
        </div>
        <span className="text-caption text-text-muted">
          Chủ đề:{" "}
          <strong>{context?.selectedTopic?.title || "chưa chọn ở Chặng 05 — dùng tên sản phẩm"}</strong>
          {" · "}
          {context?.mode ?? "CREATIVE"} ({context?.mode === "AUTHENTIC" ? 3 : 5} cảnh)
        </span>
      </div>

      {planLoading && (
        <div className="rounded-xl border border-border bg-surface-alt px-4 py-3 text-caption text-text-muted">
          Đang tra kịch bản đã có cho chủ đề này...
        </div>
      )}

      {!planLoading && !scenePlan && (
        <Card className="w-full p-4 border border-primary/30 bg-primary/5 flex flex-col gap-3">
          <div className="text-body-sm text-text">
            <span className="font-bold">Chưa tìm thấy kịch bản bối cảnh của chủ đề này.</span> Kịch bản được AI
            viết khi bấm &quot;Bắt đầu sáng tạo&quot; ở Chặng 05; phiên này mở Creative Studio mà chưa qua bước đó
            (hoặc lượt viết đã lỗi). Viết ngay tại đây — AI đọc chủ đề và thông tin sản phẩm để viết từng cảnh.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void handleWritePlan(false)} disabled={planWriting || !planCtx} className="gap-1.5">
              <Sparkles size={14} className={planWriting ? "animate-spin motion-reduce:animate-none" : ""} />
              {planWriting ? "AI đang viết kịch bản..." : "AI viết kịch bản bối cảnh (1 credit)"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleUseRulePlan} disabled={planWriting || !planCtx}>
              Dùng kịch bản cơ bản (miễn phí, không AI)
            </Button>
          </div>
        </Card>
      )}

      {planError && (
        <div className="w-full rounded-xl border border-danger bg-danger-bg px-4 py-3 text-caption text-danger">{planError}</div>
      )}

      {scenePlan && (
        <>
          <div className="rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-caption text-text-muted flex flex-wrap items-center justify-between gap-2">
            <span>
              <Badge tone={scenePlan.source === "ai" ? "success" : "neutral"} className="text-caption mr-2">
                {scenePlan.source === "ai" ? "AI viết" : "Kịch bản cơ bản"}
              </Badge>
              {scenePlan.emotionalTone && <strong className="text-text">{scenePlan.emotionalTone}. </strong>}
              {scenePlan.reasoning}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void handleWritePlan(true)} disabled={planWriting}
              className="text-caption font-bold text-primary hover:underline p-0 h-auto">
              {planWriting ? "Đang viết lại..." : "↻ AI viết lại kịch bản (1 credit)"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {narrativeResultScenes.map((scene) => (
              <div key={scene.sceneIndex} className="p-3.5 rounded-xl border-2 border-border bg-surface">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className={`text-caption font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${scene.beatColor}`}>
                    Cảnh {scene.sceneIndex} · {scene.beat}
                  </span>
                  {scene.purpose && (
                    <Badge tone="neutral" className="text-caption px-1.5 py-0 max-w-[55%] truncate">{scene.purpose}</Badge>
                  )}
                </div>
                <h5 className="text-caption font-bold text-text mt-1">{scene.title}</h5>
                <p className="text-caption text-text-muted mt-1 leading-relaxed">{scene.setting}</p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-border text-caption gap-2">
                  <span className="text-text-muted font-medium truncate">
                    {[scene.lighting, scene.palette.join(", ")].filter(Boolean).join(" · ")}
                  </span>
                  <span className="font-bold text-text-muted shrink-0">
                    {scene.usesCloud
                      ? `Nhà cung cấp AI · ${variantUnitCostCredit("cloud_provider", renderOpts)} credit`
                      : `Studio cục bộ · ${variantUnitCostCredit("local_studio", renderOpts)} credit`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
