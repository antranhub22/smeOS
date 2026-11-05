"use client"

import { useState } from "react"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { Mic } from "@/components/ui/icon-set/mic"
import { Wand2 } from "@/components/ui/icon-set/wand2"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AudioQualityTier, AudioTaskType, TtsProviderKey } from "@/modules/audio-studio/domain/audio-types"
import { audioJobCreditCost, estimateSpeechSeconds } from "@/modules/audio-studio/domain/audio-task-rules"
import { postJson } from "./revise-client"

const MOODS = [
  { id: "keep", label: "Giữ nhạc của bản cũ" },
  { id: "none", label: "Không nhạc" },
  { id: "romantic", label: "Lãng mạn" },
  { id: "upbeat", label: "Tươi vui" },
  { id: "chill", label: "Thư giãn" },
  { id: "warm", label: "Ấm áp" },
  { id: "luxury", label: "Sang trọng" },
]

interface OriginalAudioJob {
  task_type: AudioTaskType
  voice_id: string | null
  voice_clone_id: string | null
  provider_key: string | null
  quality_tier: string | null
  music_track_id: string | null
  music_provider_used?: string | null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))


export function AudioRevisePanel(props: {
  initialLines: Array<{ sceneIndex: number; voiceScript: string }>
  angleCategory?: string | undefined
  audioJobId?: string | null | undefined
  onDone: (audioJobId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState(props.initialLines)
  const [mood, setMood] = useState("keep")
  const [original, setOriginal] = useState<OriginalAudioJob | null>(null)
  const [stage, setStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openPanel = async () => {
    setOpen(true)
    if (!props.audioJobId || original) return
    const res = await fetch(`/api/v1/audio/jobs/${encodeURIComponent(props.audioJobId)}`).catch(() => null)
    if (res?.ok) setOriginal((await res.json()) as OriginalAudioJob)
  }

  const scenes = lines
    .filter((l) => l.voiceScript.trim())
    .map((l) => ({
      sceneIndex: l.sceneIndex,
      voiceScript: l.voiceScript.trim(),
      targetDurationSeconds: Math.max(3, Math.ceil(estimateSpeechSeconds(l.voiceScript) + 0.5)),
    }))
  const isClone = original?.task_type === "VOICE_CLONE" && Boolean(original.voice_clone_id)
  const keepMusic = mood === "keep" ? original?.music_track_id ?? null : null
  const hasMusic = mood === "keep" ? Boolean(keepMusic) : mood !== "none"
  const taskType: AudioTaskType = isClone ? "VOICE_CLONE" : hasMusic ? "AUDIO_MIX" : "VOICEOVER"
  const providerKey = ((original?.provider_key as TtsProviderKey | null) ?? "openai") as TtsProviderKey
  const qualityTier = ((original?.quality_tier as AudioQualityTier | null) ?? "hd") as AudioQualityTier
  const musicLibraryOnly = mood === "keep" && Boolean(keepMusic) && !original?.music_provider_used
  const credit = audioJobCreditCost({
    taskType,
    providerKey,
    qualityTier,
    scenes,
    musicProvider: hasMusic && !musicLibraryOnly ? "elevenlabs_music" : null,
    musicSeconds: scenes.reduce((a, s) => a + s.targetDurationSeconds, 0),
  })

  const run = async () => {
    setError(null)
    setStage("Đang gửi yêu cầu phối...")
    try {
      if (scenes.length === 0) throw new Error("Cần ít nhất một câu lời thoại")
      const created = await postJson<{ jobId: string }>(
        "/api/v1/audio/jobs",
        {
          taskType,
          scenes,
          voiceId: isClone ? undefined : original?.voice_id ?? undefined,
          voiceCloneId: isClone ? original?.voice_clone_id ?? undefined : undefined,
          providerKey: isClone ? undefined : providerKey,
          qualityTier,
          ...(mood === "keep"
            ? keepMusic
              ? { musicTrackId: keepMusic }
              : { musicMood: "none" }
            : { musicMood: mood }),
          ...(musicLibraryOnly ? { musicProvider: "library" } : {}),
          topicAngleCategory: props.angleCategory,
        },
        `audio-${crypto.randomUUID()}`
      )
      const deadline = Date.now() + 6 * 60 * 1000
      while (Date.now() < deadline) {
        setStage("Hệ thống đang đọc lời thoại và phối nhạc...")
        await sleep(3000)
        const res = await fetch(`/api/v1/audio/jobs/${encodeURIComponent(created.jobId)}`)
        if (!res.ok) continue
        const j = (await res.json()) as { stage: string; audio_url: string | null; error: string | null; refunded?: boolean }
        if (j.stage === "FAILED") throw new Error((j.error || "Phối âm thanh lỗi") + (j.refunded ? " — đã hoàn credit" : ""))
        if (j.stage === "COMPLETED" && j.audio_url) {
          setStage(null)
          setOpen(false)
          props.onDone(created.jobId)
          return
        }
      }
      throw new Error("Quá thời gian chờ phối âm thanh")
    } catch (e) {
      setStage(null)
      setError(e instanceof Error ? e.message : "Không phối được")
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="h-7 text-caption gap-1" onClick={() => void openPanel()}>
        <Mic size={11} /> Sửa âm thanh
      </Button>
    )
  }
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2 text-meta">
      <div className="font-bold text-text">
        Sửa lời thoại / nhạc rồi phối lại ({credit === 0 ? "miễn phí" : `${credit} credit`}
        {isClone ? " · giọng nhân bản" : ""})
      </div>
      {lines.map((l, i) => (
        <div key={l.sceneIndex} className="flex gap-2 items-start">
          <span className="w-14 shrink-0 pt-1.5 text-text-muted">Cảnh {l.sceneIndex}</span>
          <Textarea
            rows={2}
            value={l.voiceScript}
            disabled={stage !== null}
            onChange={(e) => setLines((prev) => prev.map((x, k) => (k === i ? { ...x, voiceScript: e.target.value } : x)))}
            className="flex-1 text-caption"
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-text-muted">Nhạc nền</label>
        <div className="min-w-[160px]">
          <Select value={mood} disabled={stage !== null} onValueChange={(val) => setMood(val)}>
            <SelectTrigger className="h-7 text-caption">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOODS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="h-7 text-caption gap-1" disabled={stage !== null} onClick={() => void run()}>
          {stage ? <Loader2 size={11} className="animate-spin motion-reduce:animate-none" /> : <Wand2 size={11} />} Sửa & phối lại
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-text-muted underline p-0 h-auto text-caption"
          disabled={stage !== null}
          onClick={() => setOpen(false)}
        >
          Đóng
        </Button>
      </div>
      {stage && <div className="text-primary">{stage}</div>}
      {error && <div className="text-danger">{error}</div>}
    </div>
  )
}
