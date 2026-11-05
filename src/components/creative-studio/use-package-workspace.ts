"use client"

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreativeStudioContext } from "@/app/(app)/creative-studio/page"
import {
  apiJson,
  findLatestPackage,
  promoteToMaster,
  resolveApprovedMaster,
  sceneTwoPresetFor,
  type CampaignPackageDto,
  type PackageChannel,
  type PackagePostDto,
} from "./package-client"
import type { ScenePlan } from "./scene-plan-client"
import {
  CHANNELS,
  parseHashtags,
  selectProducedScenes,
  selectSuggestedVideos,
  isPackageDirty,
} from "./package-workspace-model"
import { usePostRewrite } from "./use-post-rewrite"
import { usePackageSources } from "./use-package-sources"
import { useVideoRatio } from "./use-video-ratio"

export function usePackageWorkspace() {
  const ctx = useContext(CreativeStudioContext)
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlVideoJobId = searchParams?.get("videoJobId") ?? null
  const urlAudioJobId = searchParams?.get("audioJobId") ?? null
  const urlPlanId = searchParams?.get("scenePlanId") ?? null

  const [masterId, setMasterId] = useState<string | null>(null)
  const [resolving, setResolving] = useState(true)
  const [pkg, setPkg] = useState<CampaignPackageDto | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledge, setAcknowledge] = useState(false)
  const [assetsNonce, setAssetsNonce] = useState(0)

  const [selectedVariants, setSelectedVariants] = useState<string[]>([])
  const [videoJobIds, setVideoJobIds] = useState<string[]>([])
  const videoJobId = videoJobIds[0] ?? null
  const [audioJobId, setAudioJobId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Record<PackageChannel, { on: boolean; text: string; tags: string }>>({
    facebook: { on: false, text: "", tags: "" },
    instagram: { on: false, text: "", tags: "" },
    tiktok: { on: false, text: "", tags: "" },
    zalo: { on: false, text: "", tags: "" },
  })

  const { marketing, videoJobs, scenePlan, setScenePlan, planRef, bDraft } = usePackageSources({
    ctx,
    urlPlanId,
    masterId,
    assetsNonce,
    packageProductId: pkg?.product_id,
  })

  const loadDraftFrom = useCallback((p: CampaignPackageDto) => {
    setPkg(p)
    setSelectedVariants(p.variant_asset_ids)
    setVideoJobIds(p.video_job_ids?.length ? p.video_job_ids : p.video_job_id ? [p.video_job_id] : [])
    setAudioJobId(p.audio_job_id)
    setPosts((prev) => {
      const next = { ...prev }
      for (const c of CHANNELS) next[c.id] = { on: false, text: "", tags: "" }
      for (const post of p.posts) next[post.channel] = { on: true, text: post.text, tags: post.hashtags.join(" ") }
      return next
    })
  }, [setPkg, setSelectedVariants, setVideoJobIds, setAudioJobId, setPosts])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setResolving(true)
      setError(null)
      try {
        const id = await resolveApprovedMaster(ctx?.assetId)
        if (cancelled) return
        setMasterId(id)
        if (id) {
          const latest = await findLatestPackage(id)
          if (!cancelled && latest) loadDraftFrom(latest)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Không tải được gói chiến dịch")
      } finally {
        if (!cancelled) setResolving(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ctx?.assetId, loadDraftFrom])

  const applyBDraft = () => {
    if (!bDraft) return
    setPosts(() => {
      const next = {} as Record<PackageChannel, { on: boolean; text: string; tags: string }>
      for (const c of CHANNELS) next[c.id] = { on: false, text: "", tags: "" }
      for (const post of bDraft.posts) next[post.channel] = { on: true, text: post.text, tags: post.hashtags.join(" ") }
      return next
    })
  }

  const goRework = (area: "b" | "c" | "d" | "e", extra: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("area", area)
    params.set("returnTo", "f")
    for (const [k, v] of Object.entries(extra)) params.set(k, v)
    router.push(`/creative-studio?${params.toString()}` as never)
  }

  const refreshPackage = async () => {
    if (!pkg) return
    setPkg(await apiJson<CampaignPackageDto>(`/api/v1/creative-production/packages/${pkg.id}`))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ state từ nguồn ngoài (URL/API), chủ đích
    if (urlVideoJobId && !videoJobId && pkg?.status !== "APPROVED") setVideoJobIds([urlVideoJobId])
    if (urlAudioJobId && !audioJobId && pkg?.status !== "APPROVED") setAudioJobId(urlAudioJobId)
  }, [urlVideoJobId, urlAudioJobId, videoJobId, audioJobId, pkg?.status])

  const { planRatios, multiRatio, videoRatioTab, setVideoRatioTab, activeRatio, ratioOfVideo, activeVideoId, withVideoFor, setActiveVideo } =
    useVideoRatio({ scenePlan, videoJobs, pkgVideos: pkg?.videos, videoJobIds, videoJobId, setVideoJobIds })

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thao tác thất bại")
    } finally {
      setBusy(null)
    }
  }

  const handlePromote = () =>
    run("promote", async () => {
      if (!ctx?.assetId) throw new Error("Chưa có ảnh từ Khu vực A.")
      setMasterId(await promoteToMaster(ctx.assetId))
    })

  const producedScenes = selectProducedScenes({
    marketing,
    urlPlanId,
    primaryRatio: scenePlan?.publishing?.aspectRatio ?? null,
    planRatios,
  })
  const suggestedVideos = selectSuggestedVideos({ videoJobs, urlVideoJobId, multiRatio, planRatios })

  const handleCreate = () =>
    run("create", async () => {
      if (!masterId) return
      const topic = ctx?.selectedTopic
      const created = await apiJson<CampaignPackageDto>("/api/v1/creative-production/packages", {
        method: "POST",
        body: JSON.stringify({
          name: `${ctx?.productName || "Sản phẩm"}${topic ? ` — ${topic.title}` : ""}`.slice(0, 200),
          mode: ctx?.mode ?? "CREATIVE",
          master_asset_id: masterId,
          ...(topic
            ? {
                topic: {
                  id: topic.id,
                  title: topic.title,
                  angleCategory: topic.angleCategory,
                  hook: topic.hook,
                  cta: topic.cta,
                  scene2Preset: sceneTwoPresetFor(topic.angleCategory),
                  ...(planRef ? { scenePlanId: planRef, scenePlanRevision: scenePlan?.revision ?? 1 } : {}),
                },
              }
            : {}),
          ...(producedScenes.length > 0 ? { variant_asset_ids: producedScenes.map((a) => a.id) } : {}),
          ...(bDraft && bDraft.posts.length > 0 ? { posts: bDraft.posts } : {}),
          ...(suggestedVideos.length > 0 ? { video_job_ids: suggestedVideos.map((v) => v.id) } : {}),
          ...(urlAudioJobId ? { audio_job_id: urlAudioJobId } : {}),
        }),
      })
      loadDraftFrom(created)
    })

  const draftPosts: PackagePostDto[] = useMemo(
    () =>
      CHANNELS.filter((c) => posts[c.id].on).map((c) => ({
        channel: c.id,
        text: posts[c.id].text,
        hashtags: parseHashtags(posts[c.id].tags),
      })),
    [posts]
  )

  const handleSave = () =>
    run("save", async () => {
      if (!pkg) return
      loadDraftFrom(
        await apiJson<CampaignPackageDto>(`/api/v1/creative-production/packages/${pkg.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            posts: draftPosts,
            variant_asset_ids: selectedVariants,
            video_job_ids: videoJobIds,
            audio_job_id: audioJobId,
          }),
        })
      )
    })

  const latestDraft = useRef({ selectedVariants, videoJobIds, audioJobId, draftPosts, pkgId: pkg?.id ?? null })
  useEffect(() => {
    latestDraft.current = { selectedVariants, videoJobIds, audioJobId, draftPosts, pkgId: pkg?.id ?? null }
  }, [selectedVariants, videoJobIds, audioJobId, draftPosts, pkg?.id])

  const saveNow = async (o: {
    variantIds?: string[]
    videoJobIds?: string[]
    audioJobId?: string | null
    posts?: PackagePostDto[]
  }) => {
    const cur = latestDraft.current
    if (!cur.pkgId) return
    loadDraftFrom(
      await apiJson<CampaignPackageDto>(`/api/v1/creative-production/packages/${cur.pkgId}`, {
        method: "PATCH",
        body: JSON.stringify({
          posts: o.posts ?? cur.draftPosts,
          variant_asset_ids: o.variantIds ?? cur.selectedVariants,
          video_job_ids: o.videoJobIds ?? cur.videoJobIds,
          audio_job_id: o.audioJobId !== undefined ? o.audioJobId : cur.audioJobId,
        }),
      })
    )
  }

  const applyRevision = async (change: {
    replaceScene?: { index: number; assetId: string }
    videoJobId?: string
    audioJobId?: string
  }) => {
    if (change.replaceScene) {
      const { index, assetId } = change.replaceScene
      const sameScene = new Set(
        marketing.filter((a) => a.metadata?.scene_index === index).map((a) => a.id)
      )
      const next = [...latestDraft.current.selectedVariants.filter((id) => !sameScene.has(id)), assetId]
      await saveNow({ variantIds: next })
    }
    if (change.videoJobId) await saveNow({ videoJobIds: withVideoFor(latestDraft.current.videoJobIds, change.videoJobId, activeRatio) })
    if (change.audioJobId) await saveNow({ audioJobId: change.audioJobId })
  }

  const onSceneRevised = (scene: ScenePlan["scenes"][number], revision?: number | null) =>
    setScenePlan((prev) =>
      prev
        ? {
            ...prev,
            ...(revision ? { revision } : {}),
            scenes: prev.scenes.map((s) => (s.sceneIndex === scene.sceneIndex ? scene : s)),
          }
        : prev
    )

  const { rewriteText, setRewriteText, rewriteBusy, rewriteMsg, rewritePost } = usePostRewrite({
    posts,
    setPosts,
    saveNow,
    productName: ctx?.productName ?? "",
    topicTitle: ctx?.selectedTopic?.title ?? pkg?.topic?.title ?? "",
    priceRange: ctx?.commercialPassport?.priceRange,
  })

  const handleQa = () =>
    run("qa", async () => {
      if (!pkg) return
      loadDraftFrom(await apiJson<CampaignPackageDto>(`/api/v1/creative-production/packages/${pkg.id}/qa`, { method: "POST" }))
    })

  const handleApprove = () =>
    run("approve", async () => {
      if (!pkg) return
      loadDraftFrom(
        await apiJson<CampaignPackageDto>(`/api/v1/creative-production/packages/${pkg.id}/approve`, {
          method: "POST",
          body: JSON.stringify({ acknowledge_warnings: acknowledge }),
        })
      )
    })

  const approved = pkg?.status === "APPROVED"
  const dirty = isPackageDirty({ pkg, approved, draftPosts, selectedVariants, videoJobIds, audioJobId })

  return {
    ctx, masterId, resolving, pkg, loadDraftFrom, marketing, videoJobs, busy, error, acknowledge, setAcknowledge,
    scenePlan, planRef, setAssetsNonce, bDraft, selectedVariants, setSelectedVariants, videoJobIds, videoJobId,
    audioJobId, setAudioJobId, posts, setPosts, draftPosts, planRatios, multiRatio, videoRatioTab, setVideoRatioTab,
    activeRatio, activeVideoId, setActiveVideo, ratioOfVideo, handlePromote, producedScenes, suggestedVideos,
    urlVideoJobId, urlAudioJobId, handleCreate, handleSave, applyRevision, onSceneRevised, rewriteText,
    setRewriteText, rewriteBusy, rewriteMsg, rewritePost, handleQa, handleApprove, approved, dirty, applyBDraft,
    goRework, refreshPackage,
  }
}
