"use client"

import { useEffect, useState, type ContextType } from "react"
import type { CreativeStudioContext } from "@/app/(app)/creative-studio/page"
import { contentDraftKey, getContentDraft, type ContentDraftDto } from "./package-client"
import { findScenePlan, type ScenePlan } from "./scene-plan-client"
import type { MarketingAsset, VideoJobSummary } from "./package-workspace-model"

/**
 * Nguồn dữ liệu chỉ đọc của màn Gói chiến dịch: kịch bản Chặng 05, bản nháp bài (Khu vực B),
 * ảnh cảnh đã dựng của Master, video của sản phẩm. Tách khỏi `use-package-workspace.ts`.
 */
export function usePackageSources(input: {
  ctx: ContextType<typeof CreativeStudioContext>
  urlPlanId: string | null
  masterId: string | null
  assetsNonce: number
  packageProductId: string | null | undefined
}) {
  const { ctx, urlPlanId, masterId, assetsNonce, packageProductId } = input
  const [marketing, setMarketing] = useState<MarketingAsset[]>([])
  const [videoJobs, setVideoJobs] = useState<VideoJobSummary[]>([])
  const [scenePlan, setScenePlan] = useState<ScenePlan | null>(null)
  const [planRef, setPlanRef] = useState<string | null>(null)
  const [bDraft, setBDraft] = useState<ContentDraftDto | null>(null)

  useEffect(() => {
    if (!ctx) return
    let cancelled = false
    findScenePlan(
      {
        mode: ctx.mode,
        productName: ctx.productName,
        productId: ctx.productId,
        assetId: ctx.assetId,
        selectedTopic: ctx.selectedTopic,
        commercialPassport: ctx.commercialPassport,
      },
      urlPlanId
    )
      .then(({ loaded }) => {
        if (cancelled) return
        setScenePlan(loaded?.plan ?? null)
        setPlanRef(loaded?.ref ?? null)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.assetId, ctx?.selectedTopic?.id, ctx?.mode, urlPlanId])

  useEffect(() => {
    const key = ctx ? contentDraftKey({ assetId: ctx.assetId, selectedTopic: ctx.selectedTopic, mode: ctx.mode }) : null
    if (!key) return
    let cancelled = false
    getContentDraft(key)
      .then((d) => {
        if (!cancelled) setBDraft(d)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.assetId, ctx?.selectedTopic?.id, ctx?.mode])

  useEffect(() => {
    if (!masterId) return
    fetch(`/api/v1/assets?kind=MARKETING&parent_asset_id=${encodeURIComponent(masterId)}&limit=100`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b: { data?: MarketingAsset[] }) => setMarketing(b.data ?? []))
      .catch(() => setMarketing([]))
  }, [masterId, assetsNonce])

  useEffect(() => {
    const productId = packageProductId ?? ctx?.productId
    const q = productId ? `productId=${encodeURIComponent(productId)}&` : ""
    fetch(`/api/v1/video/jobs?${q}limit=20`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b: { data?: VideoJobSummary[] }) => setVideoJobs(b.data ?? []))
      .catch(() => setVideoJobs([]))
  }, [packageProductId, ctx?.productId])

  return { marketing, videoJobs, scenePlan, setScenePlan, planRef, bDraft }
}
