"use client"

import { useState, useEffect, useContext, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreativeStudioContext } from "@/app/(app)/creative-studio/page"
import type { PublishRatio } from "@/modules/creative-production/domain/publishing-rules"
import type { VariantDirection } from "@/modules/media/domain/variant-direction-rules"
import {
  directionFromRecord,
  directionRequestFields,
  renderOptionsPayload,
  variantUnitCostCredit,
  type VariantRenderOptions,
} from "@/modules/media/domain/variant-candidates"
import { promoteToMaster, resolveApprovedMaster } from "./package-client"
import {
  findScenePlan,
  loadRulePlan,
  RULE_PLAN_REF,
  writeScenePlan,
  type LoadedScenePlan,
  type ScenePlanContext,
  type ScenePlanScene,
} from "./scene-plan-client"
import { describeIntegrity, type M04bIntegrity } from "./types"
import type { UseCreativeStudioReturn } from "./use-creative-studio-data"
import {
  BEAT_COLORS,
  MAX_CANDIDATES_SHOWN,
  metaOf,
  formatIntegrity,
  type SceneMeta,
  type SceneCandidate,
  type VariantJobPoll,
  type NarrativeScene,
} from "./variant-scene-types"

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 6 * 60 * 1000

function sceneUsesCloud(_scene: ScenePlanScene, _mode: string, engine: string): boolean {
  return engine === "cloud_provider"
}

async function waitForVariantJob(jobId: string): Promise<VariantJobPoll> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const res = await fetch(`/api/v1/media/variants/${encodeURIComponent(jobId)}`)
    if (res.ok) {
      const detail = (await res.json()) as VariantJobPoll
      if (detail.status === "COMPLETED" || detail.status === "FAILED" || detail.status === "CANCELLED") return detail
    } else if (res.status !== 404 && res.status < 500) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
      throw new Error(err.error?.message || `Không đọc được trạng thái job (HTTP ${res.status})`)
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw new Error("Quá thời gian chờ worker — kiểm tra worker media (npm run worker:media) đang chạy.")
}

export function useVariantWorkspace(data: UseCreativeStudioReturn) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const context = useContext(CreativeStudioContext)
  const [showManualSourcePicker, setShowManualSourcePicker] = useState(false)
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(2)
  const [sceneImageMap, setSceneImageMap] = useState<Record<number, string>>({})
  const [sceneMeta, setSceneMeta] = useState<Record<number, SceneMeta>>({})
  const [sceneCandidates, setSceneCandidates] = useState<Record<number, SceneCandidate[]>>({})
  const [sceneErrors, setSceneErrors] = useState<Record<number, string>>({})
  const [generatingSceneIndex, setGeneratingSceneIndex] = useState<number | null>(null)
  const [generatingAllScenes, setGeneratingAllScenes] = useState<boolean>(false)
  const [sceneEngine, setSceneEngine] = useState<"cloud_provider" | "local_studio">("cloud_provider")
  const [sceneProvider, setSceneProvider] = useState<string>("")
  const [renderOpts, setRenderOpts] = useState<VariantRenderOptions>({ quality: "standard", upscale: "none" })
  const [loadedPlan, setLoadedPlan] = useState<LoadedScenePlan | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [planWriting, setPlanWriting] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)
  const [planFailedBefore, setPlanFailedBefore] = useState(false)
  const [promotingMaster, setPromotingMaster] = useState(false)
  const [masterError, setMasterError] = useState<string | null>(null)
  const [approvingSceneIndex, setApprovingSceneIndex] = useState<number | null>(null)
  const [ratioCounts, setRatioCounts] = useState<Record<string, number>>({})
  const [scenesReload, setScenesReload] = useState(0)

  const {
    phase, setPhase, approvedMasters, selectedMasterId, setSelectedMasterId, assets,
    promoteOriginalToMaster, loadingMasters, loadingAssets, canApprove, variantRatio,
    setVariantRatio, watermarkEnabled, setWatermarkEnabled, jobPhase, jobStatus, setJobStatus,
    judgmentB, variantIntegrity, canApproveVariantCap, errorMsg, setErrorMsg,
  } = data

  const navigateToArea = (area: "a" | "b" | "c" | "d" | "e" | "f") => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("area", area)
    router.push(`/creative-studio?${params.toString()}` as never)
  }

  useEffect(() => {
    if (!context?.assetId || selectedMasterId) return
    let cancelled = false
    resolveApprovedMaster(context.assetId).then((id) => { if (!cancelled && id) setSelectedMasterId(id) }).catch(() => undefined)
    return () => { cancelled = true }
  }, [context?.assetId, selectedMasterId, setSelectedMasterId])

  const activeMasterId = selectedMasterId || (context?.assetId ? "" : approvedMasters[0]?.id || "")

  const ensureMaster = async (): Promise<string | null> => {
    if (activeMasterId) return activeMasterId
    if (!context?.assetId) return null
    setPromotingMaster(true)
    setMasterError(null)
    try {
      const existing = await resolveApprovedMaster(context.assetId)
      const id = existing ?? (await promoteToMaster(context.assetId))
      setSelectedMasterId(id)
      return id
    } catch (e) {
      setMasterError(e instanceof Error ? `Không nâng được ảnh gốc thành Master: ${e.message}` : "Không nâng được ảnh gốc thành Master")
      return null
    } finally { setPromotingMaster(false) }
  }

  const planCtx: ScenePlanContext | null = useMemo(
    () => context ? { mode: context.mode, productName: context.productName, productId: context.productId, assetId: context.assetId, selectedTopic: context.selectedTopic, commercialPassport: context.commercialPassport, platforms: context.platforms, outputs: context.outputs } : null,
    [context]
  )
  const urlPlanId = searchParams?.get("scenePlanId") ?? null

  const rememberPlan = (loaded: LoadedScenePlan) => {
    setLoadedPlan(loaded)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("scenePlanId", loaded.jobId ?? RULE_PLAN_REF)
    router.replace(`/creative-studio?${params.toString()}` as never)
  }

  useEffect(() => {
    if (!planCtx) return
    let cancelled = false
    setPlanLoading(true); setPlanError(null)
    findScenePlan(planCtx, urlPlanId)
      .then(({ loaded, failedJob }) => { if (cancelled) return; setLoadedPlan(loaded); setPlanFailedBefore(failedJob) })
      .catch((e) => { if (!cancelled) setPlanError(e instanceof Error ? e.message : "Không tra được kịch bản bối cảnh") })
      .finally(() => { if (!cancelled) setPlanLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planCtx?.assetId, planCtx?.selectedTopic?.id, planCtx?.mode, urlPlanId])

  const handleWritePlan = async (fresh: boolean) => {
    if (!planCtx) return
    setPlanWriting(true); setPlanError(null)
    try {
      const loaded = await writeScenePlan(planCtx, fresh || planFailedBefore)
      setPlanFailedBefore(false); setSceneImageMap({}); setSceneMeta({}); rememberPlan(loaded)
    } catch (e) {
      setPlanFailedBefore(true); setPlanError(e instanceof Error ? e.message : "AI chưa viết được kịch bản bối cảnh")
    } finally { setPlanWriting(false) }
  }

  const handleUseRulePlan = () => {
    if (!planCtx) return
    setPlanError(null); setSceneImageMap({}); setSceneMeta({}); rememberPlan(loadRulePlan(planCtx))
  }

  const scenePlan = loadedPlan?.plan ?? null
  const focusScene = Number(searchParams?.get("focusScene") ?? "") || null
  useEffect(() => {
    if (!focusScene || !scenePlan) return
    if (!scenePlan.scenes.some((sc) => sc.sceneIndex === focusScene)) return
    setSelectedSceneIndex(focusScene); setPhase("result-b")
  }, [focusScene, scenePlan, setPhase])

  const planRef = loadedPlan?.ref ?? null
  const planRatio = scenePlan?.publishing?.aspectRatio ?? null
  const planRatiosKey = (scenePlan?.publishing?.ratios?.length ? scenePlan.publishing.ratios : planRatio ? [planRatio] : []).join(",")
  const planRatios: PublishRatio[] = useMemo(() => (planRatiosKey ? (planRatiosKey.split(",") as PublishRatio[]) : []), [planRatiosKey])
  const focusRatio = searchParams?.get("focusRatio") ?? null
  useEffect(() => {
    if (planRatios.length === 0) return
    const want = planRatios.find((r) => r === focusRatio) ?? planRatios[0]!
    setVariantRatio(want)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planRatiosKey, focusRatio])

  const activeRatioRef = useRef(variantRatio)
  useEffect(() => { activeRatioRef.current = variantRatio }, [variantRatio])
  const viewRatio = variantRatio || planRatio || ""
  const planScenes: readonly ScenePlanScene[] = useMemo(() => scenePlan?.scenes ?? [], [scenePlan])

  useEffect(() => {
    if (!activeMasterId || !planRef || !viewRatio) return
    let cancelled = false
    async function loadExistingScenes() {
      try {
        const res = await fetch(`/api/v1/assets?kind=MARKETING&parent_asset_id=${encodeURIComponent(activeMasterId)}&limit=100`)
        if (!res.ok) return
        const body = (await res.json()) as { data?: Array<{ id: string; url?: string | null; identity_score?: number | null; approval_state?: string; metadata?: Record<string, unknown> | null }> }
        const urls: Record<number, string> = {}; const metas: Record<number, SceneMeta> = {}
        const candidates: Record<number, SceneCandidate[]> = {}; const jobsSeen = new Set<string>()
        const pngByJob: Record<string, string> = {}; const seenByRatio: Record<string, Set<number>> = {}
        const primary = planRatio ?? "9:16"
        for (const item of body.data ?? []) {
          const meta = item.metadata ?? {}; const idx = typeof meta.scene_index === "number" ? meta.scene_index : null
          if (!idx || !item.url || meta.scene_plan_id !== planRef) continue
          const jobId = typeof meta.job_id === "string" ? meta.job_id : ""
          if (meta.variant_key === "transparent") { if (jobId) pngByJob[jobId] = item.url; continue }
          if (meta.variant_key !== "styled" && meta.variant_key !== "branded") continue
          const itemRatio = typeof meta.ratio === "string" ? meta.ratio : primary
          ;(seenByRatio[itemRatio] ??= new Set()).add(idx)
          if (itemRatio !== viewRatio) continue
          if (jobId && jobsSeen.has(jobId)) continue; if (jobId) jobsSeen.add(jobId)
          const candidate: SceneCandidate = {
            url: item.url, assetId: item.id, jobId,
            integrity: typeof item.identity_score === "number" ? item.identity_score : null,
            engine: meta.engine === "cloud_provider" ? "cloud_provider" : "local_studio",
            cloudFallback: meta.cloud_fallback === true,
            cloudFallbackReason: typeof meta.cloud_fallback_reason === "string" ? meta.cloud_fallback_reason : null,
            approved: item.approval_state === "APPROVED",
            planRevision: typeof meta.scene_plan_revision === "number" ? meta.scene_plan_revision : null,
            ratio: typeof meta.ratio === "string" ? meta.ratio : null,
            direction: directionFromRecord(meta),
            aestheticScore: meta.aesthetic && typeof meta.aesthetic === "object" && typeof (meta.aesthetic as { score?: unknown }).score === "number" ? ((meta.aesthetic as { score: number }).score) : null,
            aiRelit: meta.ai_relit === true,
            integrityDetail: meta.integrity_method === "perceptual" && typeof item.identity_score === "number" ? `Giữ nguyên sản phẩm (đo hình dáng + cấu trúc + màu) · cấu trúc ${(item.identity_score * 100).toFixed(1)}% · đã chỉnh sáng bằng AI` : null,
          }
          const list = (candidates[idx] ??= []); if (list.length < MAX_CANDIDATES_SHOWN) list.push(candidate)
          if (urls[idx]) continue; urls[idx] = item.url; metas[idx] = metaOf(candidate)
        }
        if (cancelled) return
        for (const m of Object.values(metas)) m.transparentUrl = pngByJob[m.jobId] ?? null
        for (const list of Object.values(candidates)) for (const c of list) c.transparentUrl = pngByJob[c.jobId] ?? null
        setSceneImageMap(urls); setSceneMeta(metas); setSceneCandidates(candidates)
        setRatioCounts(Object.fromEntries(Object.entries(seenByRatio).map(([r, set]) => [r, set.size])))
      } catch { /* non-critical */ }
    }
    void loadExistingScenes(); return () => { cancelled = true }
  }, [activeMasterId, planRef, viewRatio, planRatio, scenesReload])

  const handleGenerateSingleScene = async (targetIndex: number, ratioArg?: string, opts?: { direction?: VariantDirection; count?: number }): Promise<void> => {
    const ratio = ratioArg || variantRatio || "1:1"
    const isActive = () => ratio === activeRatioRef.current
    const scene = planScenes.find((s) => s.sceneIndex === targetIndex)
    if (!scene || !scenePlan || !planRef) return
    const masterForScene = await ensureMaster()
    if (!masterForScene) { setSceneErrors((prev) => ({ ...prev, [targetIndex]: masterError ?? "Chưa có Master Image đã duyệt và không có ảnh gốc từ Khu vực A để dùng." })); return }
    const useCloud = sceneUsesCloud(scene, scenePlan.mode, sceneEngine)
    setGeneratingSceneIndex(targetIndex); setSceneErrors((prev) => { const next = { ...prev }; delete next[targetIndex]; return next })
    try {
      const res = await fetch("/api/v1/media/variants", { method: "POST", headers: { "Content-Type": "application/json", "idempotency-key": `scene-${masterForScene}-${targetIndex}-${crypto.randomUUID()}` },
        body: JSON.stringify({ master_asset_id: masterForScene, engine: useCloud ? "cloud_provider" : "local_studio", preset: scene.localBackdrop, ratio, watermark: watermarkEnabled, scene_index: targetIndex, scene_plan_id: planRef, scene_plan_revision: scenePlan?.revision ?? 1, ...(useCloud ? { scene_prompt: scene.backgroundPrompt } : {}), ...(useCloud && sceneProvider ? { provider_key: sceneProvider } : {}), ...(opts?.direction ? directionRequestFields(opts.direction) : {}), ...(opts?.count && opts.count > 1 ? { variant_count: opts.count } : {}), ...renderOptionsPayload(useCloud ? renderOpts : { ...renderOpts, quality: "standard", composeMode: renderOpts.composeMode === "harmonize" ? "harmonize" : undefined }) }) })
      if (!res.ok) { const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }; throw new Error(err.error?.message || `Lỗi API HTTP ${res.status}`) }
      const created = (await res.json()) as { job_id: string; candidates?: Array<{ job_id: string }> }
      const jobIds = created.candidates?.map((c) => c.job_id) ?? [created.job_id]
      const settled = await Promise.allSettled(jobIds.map((id) => waitForVariantJob(id)))
      const made: SceneCandidate[] = []; const failures: string[] = []
      settled.forEach((r, i) => {
        const jobId = jobIds[i]!
        if (r.status === "rejected") { failures.push(r.reason instanceof Error ? r.reason.message : "Không đọc được job"); return }
        const detail = r.value
        if (detail.status !== "COMPLETED") { failures.push(detail.error || "Worker không dựng được phân cảnh này"); return }
        if (detail.result === "REJECTED") { const si = detail.subject_integrity; failures.push(`Cổng Subject Integrity từ chối${si ? ` (${describeIntegrity(si as M04bIntegrity)})` : ""}`); return }
        const wantKeys = watermarkEnabled ? ["branded", "styled"] : ["styled"]
        const variant = wantKeys.map((k) => detail.variants.find((v) => v.variant_key === k)).find(Boolean) ?? detail.variants[0]
        if (!variant) { failures.push("Job hoàn tất nhưng không có ảnh nào được ghi."); return }
        made.push({ url: variant.url, assetId: variant.asset_id, jobId, integrity: detail.subject_integrity?.subject_pixel_identity ?? null, engine: detail.source.engine, cloudFallback: detail.source.cloud_fallback, cloudFallbackReason: detail.source.cloud_fallback_reason ?? null, transparentUrl: detail.variants.find((v) => v.variant_key === "transparent")?.url ?? null, planRevision: scenePlan?.revision ?? null, ratio, direction: detail.source.direction ? directionFromRecord(detail.source.direction) : null, aestheticScore: detail.quality_report?.aesthetic?.score ?? null, aiRelit: detail.subject_integrity?.ai_relit === true || detail.quality_report?.ai_relit === true, integrityResult: detail.subject_integrity?.result ?? null, integrityDetail: detail.subject_integrity ? describeIntegrity(detail.subject_integrity as M04bIntegrity) : null })
      })
      if (made.length === 0) throw new Error(failures[0] ?? "Không sinh được phân cảnh")
      if (!isActive()) { setScenesReload((n) => n + 1); return }
      const [chosen] = made; const { url: chosenUrl, ...chosenMeta } = chosen!
      setSceneImageMap((prev) => ({ ...prev, [targetIndex]: chosenUrl }))
      setSceneMeta((prev) => ({ ...prev, [targetIndex]: chosenMeta }))
      setSceneCandidates((prev) => ({ ...prev, [targetIndex]: [...made, ...(prev[targetIndex] ?? [])].slice(0, MAX_CANDIDATES_SHOWN) }))
      if (failures.length > 0) setSceneErrors((prev) => ({ ...prev, [targetIndex]: `${failures.length}/${jobIds.length} phương án không dựng được: ${failures[0]}` }))
      setSelectedSceneIndex(targetIndex)
    } catch (err) { setSceneErrors((prev) => ({ ...prev, [targetIndex]: err instanceof Error ? err.message : "Không sinh được phân cảnh" }))
    } finally { setGeneratingSceneIndex(null) }
  }

  const handleApproveScene = async (targetIndex: number) => {
    const meta = sceneMeta[targetIndex]; if (!meta?.jobId || !meta.assetId) return
    setApprovingSceneIndex(targetIndex)
    try {
      const res = await fetch(`/api/v1/media/variants/${encodeURIComponent(meta.jobId)}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ asset_id: meta.assetId }) })
      if (!res.ok) { const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }; throw new Error(err.error?.message || `Không duyệt được (HTTP ${res.status})`) }
      setSceneMeta((prev) => ({ ...prev, [targetIndex]: { ...meta, approved: true } }))
      setSceneCandidates((prev) => ({ ...prev, [targetIndex]: (prev[targetIndex] ?? []).map((c) => (c.jobId === meta.jobId ? { ...c, approved: true } : c)) }))
    } catch (err) { setSceneErrors((prev) => ({ ...prev, [targetIndex]: err instanceof Error ? err.message : "Không duyệt được phân cảnh" }))
    } finally { setApprovingSceneIndex(null) }
  }

  const handleSelectCandidate = (targetIndex: number, candidate: SceneCandidate) => {
    const { url, ...meta } = candidate
    setSceneImageMap((prev) => ({ ...prev, [targetIndex]: url })); setSceneMeta((prev) => ({ ...prev, [targetIndex]: meta }))
  }

  const handleGenerateAllScenes = async () => {
    setGeneratingAllScenes(true)
    try { for (const idx of planScenes.map((sc) => sc.sceneIndex)) await handleGenerateSingleScene(idx) }
    finally { setGeneratingAllScenes(false) }
  }

  const handleGenerateAllRatios = async () => {
    setGeneratingAllScenes(true)
    try { for (const r of planRatios) for (const idx of planScenes.map((sc) => sc.sceneIndex)) await handleGenerateSingleScene(idx, r) }
    finally { setGeneratingAllScenes(false); setScenesReload((n) => n + 1) }
  }

  const narrativeResultScenes: NarrativeScene[] = useMemo(() => planScenes.map((scene) => {
    const meta = sceneMeta[scene.sceneIndex]; const url = sceneImageMap[scene.sceneIndex] || ""; const hasGenerated = Boolean(url)
    return {
      sceneIndex: scene.sceneIndex, beat: scene.beat, beatColor: BEAT_COLORS[scene.beat] ?? "", title: scene.title, setting: scene.setting, lighting: scene.lighting, palette: scene.palette, purpose: scene.purpose, imageUrl: url, transparentUrl: meta?.transparentUrl ?? null, isOriginal: false,
      tag: !hasGenerated ? "Chưa sinh" : scenePlan && meta?.planRevision != null && meta.planRevision < scenePlan.revision ? "Kịch bản đã sửa — nên sinh lại" : viewRatio && meta?.ratio && meta.ratio !== viewRatio ? `Khung ${meta.ratio} ≠ ${viewRatio} — nên sinh lại` : meta?.engine === "cloud_provider" && !meta.cloudFallback ? (meta.aiRelit ? "Nhà cung cấp AI · đã chỉnh sáng bằng AI" : "Hậu cảnh nhà cung cấp AI") : meta?.cloudFallback ? "Studio cục bộ (nhà cung cấp lỗi)" : "Studio cục bộ",
      ratio: variantRatio || "1:1", integrityText: formatIntegrity(meta?.integrity ?? null, hasGenerated, meta?.integrityDetail), hasGenerated,
      usesCloud: scenePlan ? sceneUsesCloud(scene, scenePlan.mode, sceneEngine) : false, approved: meta?.approved === true,
      error: sceneErrors[scene.sceneIndex] ?? null, fallbackReason: meta?.cloudFallback ? (meta.cloudFallbackReason ?? "không rõ lý do") : null,
    }
  }), [planScenes, scenePlan, sceneEngine, sceneImageMap, sceneMeta, sceneErrors, variantRatio, viewRatio])

  const sceneCount = planScenes.length
  const sceneCreditTotal = narrativeResultScenes.reduce((sum, sc) => sum + variantUnitCostCredit(sc.usesCloud ? "cloud_provider" : "local_studio", renderOpts), 0)
  const cloudAvailable = Boolean(scenePlan)
  const generatedSceneCount = narrativeResultScenes.filter((s) => s.hasGenerated).length
  const measuredIntegrities = narrativeResultScenes.map((s) => sceneMeta[s.sceneIndex]?.integrity).filter((v): v is number => typeof v === "number")
  const minSceneIntegrity = measuredIntegrities.length > 0 ? Math.min(...measuredIntegrities) : null
  const hasImageSource = Boolean(selectedMasterId || context?.assetId || context?.sourceImageUrl)

  const openSceneBoard = async (generateAll: boolean) => {
    if (!scenePlan) return
    const id = await ensureMaster(); if (!id) return
    setPhase("result-b"); if (generateAll) await handleGenerateAllScenes()
  }

  return {
    context, phase, setPhase, approvedMasters, selectedMasterId, setSelectedMasterId, assets,
    promoteOriginalToMaster, loadingMasters, loadingAssets, canApprove, variantRatio, setVariantRatio,
    watermarkEnabled, setWatermarkEnabled, jobPhase, jobStatus, setJobStatus, judgmentB, variantIntegrity,
    canApproveVariantCap, errorMsg, setErrorMsg, showManualSourcePicker, setShowManualSourcePicker,
    selectedSceneIndex, setSelectedSceneIndex, sceneCandidates, sceneMeta, generatingSceneIndex,
    generatingAllScenes, sceneEngine, setSceneEngine, sceneProvider, setSceneProvider, renderOpts,
    setRenderOpts, scenePlan, planLoading, planWriting, planError, planCtx, promotingMaster, masterError,
    activeMasterId, approvingSceneIndex, ratioCounts, viewRatio, planScenes, planRatios, narrativeResultScenes,
    sceneCount, sceneCreditTotal, cloudAvailable, generatedSceneCount, minSceneIntegrity, hasImageSource,
    openSceneBoard, handleWritePlan, handleUseRulePlan, handleGenerateAllScenes, handleGenerateAllRatios,
    handleGenerateSingleScene, handleApproveScene, handleSelectCandidate, navigateToArea,
  }
}
