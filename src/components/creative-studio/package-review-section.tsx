"use client"
/**
 * Chặng 07 — xem lại, sửa nhẹ và làm lại toàn bộ tài sản của gói.
 */
import { useEffect, useState } from "react"
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { Headphones } from "@/components/ui/icon-set/headphones"
import { Button } from "@/components/ui/button"
import type { CampaignPackageDto } from "./package-client"
import type { ScenePlan, ScenePlanScene } from "./scene-plan-client"
import { AudioRevisePanel, propagateSceneToVideo, reviseSceneAndRender } from "./package-revise-panels"
import { PackageReviewImages, type ReviewImageScene } from "./package-review-images"
import { PackageReviewVideo, type VideoDetail } from "./package-review-video"

export interface ReviewAsset {
  id: string
  url: string | null
  aspect_ratio: string | null
  identity_score: number | null
  approval_state: string
  created_at?: string
  metadata?: Record<string, unknown> | null
}

export interface ReviewVideoJob {
  id: string
  title: string
  stage: string
  video_approval: string
  aspect_ratio: string
}

type AudioDetail = { job_id: string; stage: string; audio_url: string | null; error: string | null }

/**
 * Đọc thẳng video/âm thanh ĐANG CHỌN (chưa cần lưu gói) từ cùng API mà Khu vực
 * E/C dùng để phát — 24/09/2026: trước đây Chặng 07 chỉ đọc `pkg.video`/`pkg.audio`
 * nên hiện "chưa dựng xong"/"chưa sẵn sàng" dù video đã duyệt.
 */
function useJobDetail<T>(path: string | null, nonce: number): { data: T | null; error: string | null } {
  const [state, setState] = useState<{ data: T | null; error: string | null }>({ data: null, error: null })
  useEffect(() => {
    if (!path) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bỏ chọn thì xoá dữ liệu cũ
      setState({ data: null, error: null })
      return
    }
    let cancelled = false
    fetch(path)
      .then(async (r) => {
        if (!r.ok) {
          const b = (await r.json().catch(() => ({}))) as { error?: { message?: string } }
          throw new Error(b.error?.message || `HTTP ${r.status}`)
        }
        return (await r.json()) as T
      })
      .then((data) => {
        if (!cancelled) setState({ data, error: null })
      })
      .catch((e) => {
        if (!cancelled) setState({ data: null, error: e instanceof Error ? e.message : "Không đọc được" })
      })
    return () => {
      cancelled = true
    }
  }, [path, nonce])
  return state
}

type Rework = (area: "b" | "c" | "d" | "e", extra?: Record<string, string>) => void

async function post(path: string, body?: unknown): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(b.error?.message || `HTTP ${res.status}`)
  }
}

const pct = (v: number | null) => (typeof v === "number" ? `${(v * 100).toFixed(2)}%` : "chưa đo")

export function PackageReviewSection(props: {
  pkg: CampaignPackageDto
  approved: boolean
  scenePlan: ScenePlan | null
  planRef: string | null
  marketing: ReviewAsset[]
  selectedVariants: string[]
  setSelectedVariants: (fn: (prev: string[]) => string[]) => void
  videoJobs: ReviewVideoJob[]
  videoJobId: string | null
  setVideoJobId: (id: string | null) => void
  audioJobId: string | null
  setAudioJobId: (id: string | null) => void
  urlVideoJobId: string | null
  urlAudioJobId: string | null
  onAssetsChanged: () => void
  onPackageRefresh: () => Promise<void>
  onRework: Rework
  /** Sửa tại chỗ (24/09/2026). */
  masterAssetId: string
  productName: string
  colors: string[]
  topicTitle: string
  angleCategory?: string | undefined
  mode: "CREATIVE" | "AUTHENTIC"
  onSceneRevised: (scene: ScenePlanScene, revision?: number | null) => void
  onApply: (change: { replaceScene?: { index: number; assetId: string }; videoJobId?: string; audioJobId?: string }) => Promise<void>
}) {
  const {
    approved, scenePlan, planRef, marketing, selectedVariants, setSelectedVariants,
    videoJobs, videoJobId, setVideoJobId, audioJobId, setAudioJobId, urlVideoJobId, urlAudioJobId,
    onAssetsChanged, onPackageRefresh, onRework,
    masterAssetId, productName, colors, topicTitle, angleCategory, mode, onSceneRevised, onApply,
  } = props
  const [instructions, setInstructions] = useState<Record<number, string>>({})
  const [sceneStage, setSceneStage] = useState<Record<number, string | null>>({})
  const [sceneError, setSceneError] = useState<Record<number, string | null>>({})
  const [sceneNote, setSceneNote] = useState<Record<number, string | null>>({})

  const runSceneRevise = async (idx: number, current: ScenePlanScene, ratio: string) => {
    const instruction = (instructions[idx] ?? "").trim()
    if (instruction.length < 3) {
      setSceneError((p) => ({ ...p, [idx]: "Gõ yêu cầu sửa (ít nhất vài chữ)" }))
      return
    }
    setSceneError((p) => ({ ...p, [idx]: null }))
    try {
      const r = await reviseSceneAndRender({
        instruction,
        scenePlanRef: planRef,
        scene: current,
        mode: scenePlan?.mode ?? mode,
        topicTitle: scenePlan?.topicTitle ?? topicTitle,
        productName,
        colors,
        masterAssetId,
        ratio,
        onStage: (st) => setSceneStage((p) => ({ ...p, [idx]: st })),
      })
      onSceneRevised(r.scene, r.revision)
      setSceneStage((p) => ({ ...p, [idx]: "Đang thay ảnh mới vào gói..." }))
      await onApply({ replaceScene: { index: idx, assetId: r.assetId } })
      // Đợt 5: đồng bộ sang video của gói (ảnh + phụ đề cảnh này).
      setSceneStage((p) => ({ ...p, [idx]: "Đang cập nhật cảnh vào video..." }))
      const note = await propagateSceneToVideo({
        videoJobId,
        sceneIndex: current.sceneIndex,
        assetId: r.assetId,
        scene: r.scene,
        voiceChanged: r.scene.voiceScript !== current.voiceScript,
      }).catch(() => null)
      setSceneNote((p) => ({ ...p, [idx]: note }))
      onAssetsChanged()
      setInstructions((p) => ({ ...p, [idx]: "" }))
    } catch (e) {
      setSceneError((p) => ({ ...p, [idx]: e instanceof Error ? e.message : "Không sửa được cảnh" }))
    } finally {
      setSceneStage((p) => ({ ...p, [idx]: null }))
    }
  }
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobNonce, setJobNonce] = useState(0)
  const videoDetail = useJobDetail<VideoDetail>(
    videoJobId ? `/api/v1/video/jobs/${encodeURIComponent(videoJobId)}` : null,
    jobNonce
  )
  const audioDetail = useJobDetail<AudioDetail>(
    audioJobId ? `/api/v1/audio/jobs/${encodeURIComponent(audioJobId)}` : null,
    jobNonce
  )

  const act = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thao tác không thành công")
    } finally {
      setBusy(null)
    }
  }

  const byId = new Map(marketing.map((a) => [a.id, a]))
  const styled = marketing.filter((a) => a.metadata?.variant_key === "styled" || a.metadata?.variant_key === "branded")
  const samePlan = (a: ReviewAsset) => {
    const v = a.metadata?.scene_plan_id
    if (!planRef) return true
    return planRef.startsWith("rule:") ? typeof v === "string" && v.startsWith("rule:") : v === planRef
  }
  // Bản MỚI NHẤT mỗi cảnh của kịch bản đang mở (`marketing` sắp mới → cũ).
  const latestByScene = new Map<number, ReviewAsset>()
  for (const a of styled) {
    const idx = a.metadata?.scene_index
    if (typeof idx === "number" && samePlan(a) && !latestByScene.has(idx)) latestByScene.set(idx, a)
  }
  const selectedByScene = new Map<number, ReviewAsset>()
  for (const id of selectedVariants) {
    const a = byId.get(id)
    const idx = a?.metadata?.scene_index
    if (a && typeof idx === "number" && !selectedByScene.has(idx)) selectedByScene.set(idx, a)
  }

  const scenes: ReviewImageScene[] =
    scenePlan?.scenes.map((s) => ({ index: s.sceneIndex, beat: s.beat, title: s.title, setting: s.setting, plan: s as ScenePlanScene | null })) ??
    [...new Set([...latestByScene.keys(), ...selectedByScene.keys()])]
      .sort((a, b) => a - b)
      .map((i) => ({ index: i, beat: "", title: `Cảnh ${i}`, setting: "", plan: null as ScenePlanScene | null }))

  const swapIn = (idx: number, next: ReviewAsset) =>
    setSelectedVariants((prev) => {
      const old = selectedByScene.get(idx)
      return [...prev.filter((x) => x !== old?.id), next.id]
    })

  const approveImage = (a: ReviewAsset) =>
    act(`img-${a.id}`, async () => {
      const jobId = a.metadata?.job_id
      if (typeof jobId !== "string" || !jobId) throw new Error("Ảnh này không gắn tác vụ biến thể — duyệt ở Khu vực D.")
      await post(`/api/v1/media/variants/${encodeURIComponent(jobId)}/approve`, { asset_id: a.id })
      onAssetsChanged()
    })

  const video = videoDetail.data
  const newerVideo = urlVideoJobId && urlVideoJobId !== videoJobId ? urlVideoJobId : null
  const newerAudio = urlAudioJobId && urlAudioJobId !== audioJobId ? urlAudioJobId : null

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg border border-danger bg-danger-bg px-3 py-2 text-meta text-danger">{error}</div>}

      {/* Kịch bản — để đối chiếu ảnh/video/lời thoại có kể cùng một câu chuyện */}
      {scenePlan && (
        <section className="rounded-lg border border-border bg-surface-alt p-3 text-meta text-text-muted">
          <span className="font-bold text-text">Kịch bản bối cảnh: </span>
          {scenePlan.topicTitle} — {scenePlan.scenes.map((s) => `${s.sceneIndex}. ${s.title}`).join(" → ")}
        </section>
      )}

      {/* ẢNH theo cảnh */}
      <PackageReviewImages
        scenes={scenes}
        selectedByScene={selectedByScene}
        latestByScene={latestByScene}
        approved={approved}
        swapIn={swapIn}
        setSelectedVariants={setSelectedVariants}
        approveImage={approveImage}
        busy={busy}
        onRework={onRework}
        instructions={instructions}
        setInstructions={setInstructions}
        sceneStage={sceneStage}
        sceneError={sceneError}
        sceneNote={sceneNote}
        runSceneRevise={runSceneRevise}
        styled={styled}
        selectedVariants={selectedVariants}
        scenePlan={scenePlan}
        mode={mode}
        pct={pct}
      />

      {/* VIDEO */}
      <PackageReviewVideo
        video={video}
        videoJobId={videoJobId}
        setVideoJobId={setVideoJobId}
        newerVideo={newerVideo}
        approved={approved}
        videoDetail={videoDetail}
        busy={busy}
        act={act}
        post={post}
        setJobNonce={setJobNonce}
        onPackageRefresh={onPackageRefresh}
        styled={styled}
        selectedVariants={selectedVariants}
        videoJobs={videoJobs}
        onRework={onRework}
        onApply={onApply}
      />

      {/* ÂM THANH */}
      <section className="space-y-2">
        <div className="text-meta font-bold text-text flex items-center gap-1.5">
          <Headphones size={13} /> Âm thanh
        </div>
        {newerAudio && !approved && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-meta text-primary font-bold hover:underline p-0 h-auto"
            onClick={() => setAudioJobId(newerAudio)}
          >
            ↻ Có bản phối mới (tác vụ {newerAudio.slice(0, 8)}) — dùng bản này
          </Button>
        )}
        {audioDetail.data?.audio_url ? (
          <audio controls src={audioDetail.data.audio_url} className="w-full" />
        ) : audioJobId ? (
          <p className="text-meta text-text-muted">
            {audioDetail.error
              ? `Không đọc được bản phối: ${audioDetail.error}`
              : audioDetail.data
              ? audioDetail.data.stage === "FAILED"
                ? `Phối lỗi${audioDetail.data.error ? `: ${audioDetail.data.error}` : ""}`
                : "Bản phối chưa xong."
              : "Đang đọc bản phối..."}
          </p>
        ) : (
          <p className="text-meta text-text-muted">Chưa kèm âm thanh.</p>
        )}
        {!approved && (
          <div className="flex flex-wrap gap-2">
            {audioJobId && (
              <Button size="sm" variant="ghost" className="h-7 text-caption" onClick={() => setAudioJobId(null)}>
                Bỏ khỏi gói
              </Button>
            )}
            <AudioRevisePanel
              initialLines={(scenePlan?.scenes ?? []).map((s) => ({ sceneIndex: s.sceneIndex, voiceScript: s.voiceScript }))}
              angleCategory={angleCategory}
              audioJobId={audioJobId}
              onDone={(id) => void onApply({ audioJobId: id })}
            />
          </div>
        )}
      </section>

      {approved && (
        <p className="text-meta text-success flex items-center gap-1.5">
          <CheckCircle2 size={13} /> Gói đã duyệt — không đổi tài sản được nữa.
        </p>
      )}
    </div>
  )
}
