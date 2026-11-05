"use client"

import { useState, useCallback, useContext, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreativeStudioContext } from "@/app/(app)/creative-studio/page"
import type { AudioQualityTier, AudioTaskType, TtsProviderKey } from "@/modules/audio-studio/domain/audio-types"
import {
  AUDIO_TASK_SPECS,
  estimateSpeechSeconds,
  audioJobCreditCost,
  validateAudioTask,
  MAX_VOICE_SCRIPT_LENGTH,
} from "@/modules/audio-studio/domain/audio-task-rules"
import { suggestMoodForTopicAngle } from "@/modules/audio-studio/domain/music-catalog"
import { VOICE_CATALOG } from "@/modules/audio-studio/domain/voice-catalog"
import { findScenePlan, type ScenePlan } from "./scene-plan-client"
import { readAudioApiError } from "./audio-library-client"
import { useProviderKind } from "./provider-select"
import type { AudioScene } from "./audio-scenes-card"
import type { AudioJobDetail } from "./audio-result-card"

export function useAudioWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const context = useContext(CreativeStudioContext)
  const ctx = context ?? {
    topicId: "",
    productId: undefined,
    voiceId: undefined,
    musicMood: undefined,
    productName: "",
    selectedTopic: null,
    mode: "CREATIVE" as const,
  }
  const [taskType, setTaskType] = useState<AudioTaskType>("AUDIO_MIX")
  const spec = AUDIO_TASK_SPECS[taskType]

  const navigateToArea = (area: "b" | "c" | "d" | "e" | "f") => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("area", area)
    router.push(`/creative-studio?${params.toString()}` as never)
  }

  const buildInitialScenes = (): AudioScene[] => {
    const topic = ctx.selectedTopic
    if (!topic) {
      return ctx.topicId
        ? [
            { sceneIndex: 1, voiceScript: "", targetDurationSeconds: 8 },
            { sceneIndex: 2, voiceScript: "", targetDurationSeconds: 8 },
          ]
        : []
    }
    return [
      { sceneIndex: 1, voiceScript: topic.hook || `Giới thiệu ${ctx.productName}`, targetDurationSeconds: 5 },
      { sceneIndex: 2, voiceScript: `${ctx.productName} — ${topic.title}`, targetDurationSeconds: 8 },
      { sceneIndex: 3, voiceScript: topic.cta || "Đặt hàng ngay hôm nay!", targetDurationSeconds: 4 },
    ]
  }

  const [scenes, setScenes] = useState<AudioScene[]>(buildInitialScenes)
  const [scenesEdited, setScenesEdited] = useState(false)

  const [scenePlan, setScenePlan] = useState<ScenePlan | null>(null)
  const [scenePlanRef, setScenePlanRef] = useState<string | null>(null)
  const urlPlanId = searchParams?.get("scenePlanId") ?? null

  useEffect(() => {
    if (!context) return
    let cancelled = false
    findScenePlan(
      {
        mode: context.mode,
        productName: context.productName,
        productId: context.productId,
        assetId: context.assetId,
        selectedTopic: context.selectedTopic,
        commercialPassport: context.commercialPassport,
        platforms: context.platforms,
        outputs: context.outputs,
      },
      urlPlanId
    )
      .then(({ loaded }) => {
        if (!cancelled) {
          setScenePlan(loaded?.plan ?? null)
          setScenePlanRef(loaded?.ref ?? null)
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.assetId, context?.selectedTopic?.id, context?.mode, urlPlanId])

  const scenesFromPlan = (plan: ScenePlan): AudioScene[] =>
    plan.scenes.map((sc) => {
      const script = sc.voiceScript || sc.textOverlay || sc.title
      const base = sc.durationSeconds ?? (sc.beat === "CTA" ? 4 : sc.beat === "CLIMAX" ? 7 : 5)
      return {
        sceneIndex: sc.sceneIndex,
        voiceScript: script,
        targetDurationSeconds: Math.max(base, Math.round((estimateSpeechSeconds(script) + 0.3) * 10) / 10),
      }
    })

  const [voiceId, setVoiceId] = useState(ctx.voiceId ?? "flora-nu-truyen-cam")
  const [providerKey, setProviderKey] = useState<TtsProviderKey | "">("")
  const voiceKind = useProviderKind("voice")
  const effectiveProvider = (providerKey || voiceKind?.order[0] || "openai") as TtsProviderKey
  const [musicProvider, setMusicProvider] = useState<string>("")
  const musicKind = useProviderKind("music")
  const [qualityTier, setQualityTier] = useState<AudioQualityTier>("hd")
  const [musicTrackId, setMusicTrackId] = useState<string | null>(null)
  const [userPickedMusic, setUserPickedMusic] = useState(false)
  const [musicLicenseOk, setMusicLicenseOk] = useState<boolean | null>(null)
  const [voiceCloneId, setVoiceCloneId] = useState<string | null>(null)
  const [musicDuration, setMusicDuration] = useState(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preferredMood =
    scenePlan?.audio && scenePlan.audio.musicMood !== "none"
      ? scenePlan.audio.musicMood
      : ctx.musicMood && ctx.musicMood !== "none"
      ? ctx.musicMood
      : ctx.selectedTopic?.angleCategory
      ? suggestMoodForTopicAngle(ctx.selectedTopic.angleCategory)
      : undefined

  useEffect(() => {
    if (!scenePlan) return
    /* eslint-disable react-hooks/set-state-in-effect -- nạp cấu hình từ kịch bản đã tra được */
    if (!scenesEdited) setScenes(scenesFromPlan(scenePlan))
    if (scenePlan.audio) {
      setVoiceId(scenePlan.audio.voiceId)
      setQualityTier(scenePlan.audio.qualityTier)
      if (scenePlan.audio.musicMood === "none") setTaskType("VOICEOVER")
      if (!userPickedMusic) setMusicTrackId(null)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenePlan])

  const updateScene = useCallback((index: number, field: "targetDurationSeconds" | "voiceScript", value: string | number) => {
    setScenesEdited(true)
    setScenes((prev) => prev.map((s) => (s.sceneIndex === index ? { ...s, [field]: value } : s)))
  }, [])

  const addScene = useCallback(() => {
    setScenesEdited(true)
    setScenes((prev) => [...prev, { sceneIndex: prev.length + 1, voiceScript: "", targetDurationSeconds: 5 }])
  }, [])

  const removeScene = useCallback((index: number) => {
    setScenesEdited(true)
    setScenes((prev) => prev.filter((s) => s.sceneIndex !== index).map((s, i) => ({ ...s, sceneIndex: i + 1 })))
  }, [])

  const totalDuration = spec.needsVoice
    ? scenes.reduce((a, s) => a + Math.max(s.targetDurationSeconds, estimateSpeechSeconds(s.voiceScript) + 0.3), 0)
    : musicDuration
  const effectiveMusic = spec.music === "none" ? null : musicTrackId
  const musicAiProvider =
    spec.music === "none" || !effectiveMusic || musicProvider === "library"
      ? null
      : musicProvider || musicKind?.order[0] || null
  const credit = audioJobCreditCost({
    taskType,
    providerKey: effectiveProvider,
    qualityTier,
    scenes,
    musicProvider: musicAiProvider,
    musicSeconds: totalDuration,
  })
  const validation = validateAudioTask({ taskType, scenes, musicTrackId: effectiveMusic, voiceCloneId })
  const firstProblem = Object.values(validation)[0] ?? null

  const [audioJob, setAudioJob] = useState<AudioJobDetail | null>(null)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [waitSeconds, setWaitSeconds] = useState(0)
  const [polling, setPolling] = useState(false)
  const pollToken = useRef(0)

  const pollAudioJob = useCallback(
    async (jobId: string, opts?: { updateUrl?: boolean }) => {
      const token = ++pollToken.current
      setPolling(true)
      setError(null)
      const startedAt = Date.now()
      const deadline = startedAt + 10 * 60 * 1000
      try {
        while (Date.now() < deadline && token === pollToken.current) {
          const poll = await fetch(`/api/v1/audio/jobs/${encodeURIComponent(jobId)}`)
          if (poll.ok) {
            const detail = (await poll.json()) as AudioJobDetail
            if (token !== pollToken.current) return
            setAudioJob(detail)
            setWaitSeconds(Math.round((Date.now() - startedAt) / 1000))
            if (detail.stage === "COMPLETED") {
              if (opts?.updateUrl) {
                const params = new URLSearchParams(searchParams?.toString() || "")
                params.set("audioJobId", jobId)
                router.replace(`/creative-studio?${params.toString()}` as never)
              }
              return
            }
            if (detail.stage === "FAILED") {
              setError(detail.error || "Hệ thống không phối được âm thanh")
              return
            }
          } else if (poll.status === 404) {
            setError("Không tìm thấy tác vụ âm thanh này trong tổ chức.")
            return
          }
          await new Promise((r) => setTimeout(r, 2000))
        }
        if (token === pollToken.current) {
          setError(
            "Chưa có kết quả sau 10 phút. Tác vụ vẫn nằm trong hàng đợi — bấm “Kiểm tra lại” sau khi hệ thống xử lý chạy."
          )
        }
      } finally {
        if (token === pollToken.current) setPolling(false)
      }
    },
    [router, searchParams]
  )

  const urlAudioJobId = searchParams?.get("audioJobId") ?? null
  useEffect(() => {
    if (!urlAudioJobId || audioJob?.job_id === urlAudioJobId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- nạp kết quả job từ API theo định danh trên URL
    setCurrentJobId(urlAudioJobId)
    void pollAudioJob(urlAudioJobId, { updateUrl: false })
    return () => {
      pollToken.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAudioJobId])

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    setAudioJob(null)
    setWaitSeconds(0)
    try {
      const res = await fetch("/api/v1/audio/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "idempotency-key": `audio-${crypto.randomUUID()}` },
        body: JSON.stringify({
          taskType,
          scenes: spec.needsVoice
            ? scenes.map((s) => ({
                sceneIndex: s.sceneIndex,
                voiceScript: s.voiceScript,
                targetDurationSeconds: s.targetDurationSeconds,
              }))
            : [],
          totalDurationSeconds: Math.max(1, Math.round(totalDuration)),
          voiceId: taskType === "VOICE_CLONE" ? undefined : voiceId,
          voiceCloneId: taskType === "VOICE_CLONE" ? voiceCloneId ?? undefined : undefined,
          providerKey: taskType === "VOICE_CLONE" || !providerKey ? undefined : providerKey,
          ...(effectiveMusic && musicProvider ? { musicProvider } : {}),
          qualityTier,
          musicTrackId: effectiveMusic ?? undefined,
          musicMood: effectiveMusic ? undefined : "none",
          ...(scenePlanRef ? { scenePlanId: scenePlanRef, scenePlanRevision: scenePlan?.revision ?? 1 } : {}),
        }),
      })
      if (!res.ok) throw new Error(await readAudioApiError(res))
      const created = (await res.json()) as { jobId: string }
      setCurrentJobId(created.jobId)
      setLoading(false)
      await pollAudioJob(created.jobId, { updateUrl: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi")
    } finally {
      setLoading(false)
    }
  }

  const stage = audioJob?.stage ?? "DRAFT"
  const queuedTooLong = polling && stage === "DRAFT" && waitSeconds >= 20
  const selectedVoice = VOICE_CATALOG.find((v) => v.voiceId === voiceId)

  return {
    taskType,
    setTaskType,
    spec,
    voiceId,
    setVoiceId,
    providerKey,
    setProviderKey,
    qualityTier,
    setQualityTier,
    voiceCloneId,
    setVoiceCloneId,
    musicTrackId,
    setMusicTrackId,
    preferredMood,
    setUserPickedMusic,
    setMusicLicenseOk,
    effectiveMusic,
    musicProvider,
    setMusicProvider,
    musicDuration,
    setMusicDuration,
    scenes,
    setScenes,
    addScene,
    removeScene,
    updateScene,
    scenePlan,
    scenesEdited,
    setScenesEdited,
    scenesFromPlan,
    maxVoiceScriptLength: MAX_VOICE_SCRIPT_LENGTH,
    estimateSpeechSeconds,
    totalDuration,
    firstProblem,
    loading,
    polling,
    credit,
    handleCreate,
    musicLicenseOk,
    error,
    audioJob,
    currentJobId,
    stage,
    waitSeconds,
    queuedTooLong,
    pollAudioJob,
    navigateToArea,
    selectedVoice,
  }
}
