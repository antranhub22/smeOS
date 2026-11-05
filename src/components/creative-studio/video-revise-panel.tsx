"use client"

import { useState } from "react"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { Wand2 } from "@/components/ui/icon-set/wand2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { costCreditForFeature } from "@/modules/usage/domain/pricing"
import { VideoJobLifecycle, type VideoJobDetail } from "./video-job-lifecycle"
import { postJson } from "./revise-client"

export type EditableVideoScene = {
  sceneIndex: number
  durationSeconds: number
  textOverlay: string
  voiceScript: string
  motionEffect: string
  imageAssetId: string | null
}

const MOTIONS = [
  { id: "ZOOM_IN", label: "Zoom in" },
  { id: "ZOOM_OUT", label: "Zoom out" },
  { id: "PAN_RIGHT", label: "Lia ngang" },
  { id: "PAN_UP", label: "Lia lên" },
  { id: "STATIC", label: "Tĩnh" },
]

const VOICES = [
  { code: "vi-VN-Standard-A", label: "Nữ truyền cảm" },
  { code: "vi-VN-Standard-C", label: "Nữ trẻ trung" },
  { code: "vi-VN-Standard-B", label: "Nam ấm áp" },
  { code: "none", label: "Không lồng tiếng" },
]


export function VideoRevisePanel(props: {
  base: {
    title: string
    format: string
    aspect_ratio: string
    has_subtitle?: boolean
    caption_style?: string
    has_watermark?: boolean
    voice_code?: string | null
    product_id?: string | null
  }
  initialScenes: EditableVideoScene[]
  imageChoices: Array<{ assetId: string; label: string }>
  onReady: (videoJobId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [scenes, setScenes] = useState(props.initialScenes)
  const [voice, setVoice] = useState(props.base.voice_code || "vi-VN-Standard-A")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newJobId, setNewJobId] = useState<string | null>(null)
  const renderCredit = costCreditForFeature("video.render")

  const create = async () => {
    setCreating(true)
    setError(null)
    try {
      if (scenes.some((s) => !s.imageAssetId)) throw new Error("Mỗi cảnh cần một ảnh sản phẩm")
      const created = await postJson<{ id: string }>("/api/v1/video/jobs", {
        productId: props.base.product_id ?? null,
        title: `${props.base.title} (bản sửa)`.slice(0, 200),
        format: props.base.format,
        aspectRatio: props.base.aspect_ratio,
        hasSubtitle: props.base.has_subtitle ?? true,
        captionStyle: props.base.caption_style ?? "MODERN_BADGE",
        hasWatermark: props.base.has_watermark ?? true,
        voiceCode: voice === "none" ? null : voice,
        scenes: scenes.map((s, i) => ({
          sceneIndex: i + 1,
          durationSeconds: s.durationSeconds,
          imageAssetId: s.imageAssetId,
          textOverlay: s.voiceScript || null,
          voiceScript: s.voiceScript || null,
          transitionEffect: "fade",
          motionEffect: s.motionEffect,
        })),
      })
      setNewJobId(created.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tạo được bản sửa")
    } finally {
      setCreating(false)
    }
  }

  const onJob = (j: VideoJobDetail) => {
    if (j.stage === "RENDER_COMPLETED" || j.stage === "APPROVED") props.onReady(j.id)
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="h-8 text-caption gap-1" onClick={() => setOpen(true)}>
        <Wand2 size={11} /> Sửa video
      </Button>
    )
  }
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3 text-meta">
      <div className="flex items-center justify-between">
        <div className="font-bold text-text">Sửa storyboard → tạo bản sửa → duyệt kịch bản → dựng video ({renderCredit} credit)</div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-text-muted underline p-0 h-auto text-caption"
          onClick={() => setOpen(false)}
        >
          Đóng
        </Button>
      </div>
      {!newJobId && (
        <>
          {scenes.map((s, i) => (
            <div key={i} className="rounded border border-border bg-surface p-2 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">Cảnh {i + 1}</span>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  step={0.5}
                  value={s.durationSeconds}
                  onChange={(e) => setScenes((p) => p.map((x, k) => (k === i ? { ...x, durationSeconds: Number(e.target.value) || 1 } : x)))}
                  className="w-16 text-caption py-0.5 h-7"
                />
                <span className="text-text-muted">giây</span>
                <div className="min-w-[120px]">
                  <Select
                    value={s.motionEffect}
                    onValueChange={(val) => setScenes((p) => p.map((x, k) => (k === i ? { ...x, motionEffect: val } : x)))}
                  >
                    <SelectTrigger className="h-7 text-caption">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTIONS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[150px] max-w-[220px]">
                  <Select
                    value={s.imageAssetId ?? "none"}
                    onValueChange={(val) => setScenes((p) => p.map((x, k) => (k === i ? { ...x, imageAssetId: val === "none" ? null : val } : x)))}
                  >
                    <SelectTrigger className="h-7 text-caption">
                      <SelectValue placeholder="— chọn ảnh —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— chọn ảnh —</SelectItem>
                      {props.imageChoices.map((c) => (
                        <SelectItem key={c.assetId} value={c.assetId}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                rows={2}
                value={s.voiceScript}
                placeholder="Lời thoại (cũng là phụ đề)"
                onChange={(e) => setScenes((p) => p.map((x, k) => (k === i ? { ...x, voiceScript: e.target.value } : x)))}
                className="w-full text-caption"
              />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-text-muted">Giọng đọc</label>
            <div className="min-w-[160px]">
              <Select value={voice} onValueChange={(val) => setVoice(val)}>
                <SelectTrigger className="h-7 text-caption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.code} value={v.code}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-7 text-caption gap-1" disabled={creating} onClick={() => void create()}>
              {creating ? <Loader2 size={11} className="animate-spin motion-reduce:animate-none" /> : <Wand2 size={11} />} Tạo bản sửa
            </Button>
          </div>
        </>
      )}
      {error && <div className="text-danger">{error}</div>}
      {newJobId && (
        <>
          <p className="text-text-muted">
            Bản sửa đã lập. Duyệt kịch bản rồi bấm Dựng video — xong sẽ tự thay vào gói; duyệt video ở đây hoặc ở khung video phía trên.
          </p>
          <VideoJobLifecycle key={newJobId} jobId={newJobId} renderCredit={renderCredit} onChange={onJob} />
        </>
      )}
    </div>
  )
}
