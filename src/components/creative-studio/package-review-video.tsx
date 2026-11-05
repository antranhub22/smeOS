"use client"

import { Film } from "@/components/ui/icon-set/film"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { RefreshCw } from "@/components/ui/icon-set/refresh-cw"
import { ShieldCheck } from "@/components/ui/icon-set/shield-check"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReviewAsset, ReviewVideoJob } from "./package-review-section"
import { VideoRevisePanel, type EditableVideoScene } from "./package-revise-panels"

export type VideoDetail = {
  id: string
  title: string
  format: string
  aspect_ratio: string
  has_subtitle?: boolean
  caption_style?: string
  has_watermark?: boolean
  voice_code?: string | null
  product_id?: string | null
  stage: string
  video_approval: string
  script_approval?: string
  final_video_view_url?: string | null
  error_message?: string | null
  scenes?: Array<{
    scene_index: number
    duration_seconds: number
    text_overlay: string | null
    voice_script: string | null
    image_asset_id: string | null
    motion_effect: string | null
  }>
}

export function PackageReviewVideo({
  video,
  videoJobId,
  setVideoJobId,
  newerVideo,
  approved,
  videoDetail,
  busy,
  act,
  post,
  setJobNonce,
  onPackageRefresh,
  styled,
  selectedVariants,
  videoJobs,
  onRework,
  onApply,
}: {
  video: VideoDetail | null
  videoJobId: string | null
  setVideoJobId: (id: string | null) => void
  newerVideo: string | null
  approved: boolean
  videoDetail: { data: VideoDetail | null; error: string | null }
  busy: string | null
  act: (key: string, fn: () => Promise<void>) => Promise<void>
  post: (path: string, body?: unknown) => Promise<void>
  setJobNonce: React.Dispatch<React.SetStateAction<number>>
  onPackageRefresh: () => Promise<void>
  styled: ReviewAsset[]
  selectedVariants: string[]
  videoJobs: ReviewVideoJob[]
  onRework: (area: "b" | "c" | "d" | "e", extra?: Record<string, string>) => void
  onApply: (change: { videoJobId?: string }) => Promise<void>
}) {
  return (
    <section className="space-y-2">
      <div className="text-meta font-bold text-text flex items-center gap-1.5">
        <Film size={13} /> Video
      </div>
      {newerVideo && !approved && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-meta text-primary font-bold hover:underline p-0 h-auto"
          onClick={() => setVideoJobId(newerVideo)}
        >
          ↻ Có video mới (tác vụ {newerVideo.slice(0, 8)}) — dùng video này
        </Button>
      )}
      {videoJobId && !video && !videoDetail.error && (
        <p className="text-meta text-text-muted flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin motion-reduce:animate-none" /> Đang đọc video...
        </p>
      )}
      {videoDetail.error && <p className="text-meta text-danger">Không đọc được video: {videoDetail.error}</p>}
      {!videoJobId && <p className="text-meta text-text-muted">Chưa kèm video.</p>}
      {video && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            {video.final_video_view_url ? (
              <video
                key={video.final_video_view_url}
                src={video.final_video_view_url}
                controls
                playsInline
                className="w-full max-h-[460px] rounded-xl border border-border bg-black"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-meta text-text-muted">
                {video.stage === "RENDERING"
                  ? "Đang dựng video..."
                  : video.stage === "FAILED"
                  ? `Lỗi dựng video${video.error_message ? `: ${video.error_message}` : ""}`
                  : "Chưa dựng — duyệt kịch bản và dựng video ở Khu vực E."}
              </div>
            )}
            {video.final_video_view_url && (
              <a
                href={video.final_video_view_url}
                download
                className="mt-1 block text-center text-caption font-bold text-primary hover:underline"
              >
                Tải video
              </a>
            )}
          </div>
          <div className="md:col-span-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-meta">
              <Badge tone={video.video_approval === "APPROVED" ? "success" : "neutral"} className="text-caption">
                {video.video_approval === "APPROVED"
                  ? "Đã duyệt video"
                  : video.stage === "RENDER_COMPLETED"
                  ? "Đã dựng xong — chờ duyệt video"
                  : video.stage}
              </Badge>
              {!approved && video.stage === "RENDER_COMPLETED" && video.video_approval !== "APPROVED" && (
                <Button
                  size="sm"
                  className="h-7 text-caption gap-1"
                  disabled={busy !== null}
                  onClick={() =>
                    void act("video", async () => {
                      await post(`/api/v1/video/jobs/${encodeURIComponent(video.id)}/approve-video`)
                      setJobNonce((n) => n + 1)
                      await onPackageRefresh()
                    })
                  }
                >
                  {busy === "video" ? (
                    <Loader2 size={11} className="animate-spin motion-reduce:animate-none" />
                  ) : (
                    <ShieldCheck size={11} />
                  )}{" "}
                  Duyệt video
                </Button>
              )}
            </div>
            {video.scenes && video.scenes.length > 0 && (
              <ol className="space-y-1.5 text-caption">
                {[...video.scenes]
                  .sort((x, y) => x.scene_index - y.scene_index)
                  .map((sc) => (
                    <li key={sc.scene_index} className="rounded-lg border border-border p-2">
                      <div className="font-bold text-text">
                        Cảnh {sc.scene_index} · {sc.duration_seconds}s
                      </div>
                      {sc.text_overlay && <div className="text-text">Phụ đề: {sc.text_overlay}</div>}
                      {sc.voice_script && <div className="text-text-muted">Lời thoại: {sc.voice_script}</div>}
                    </li>
                  ))}
              </ol>
            )}
            {!approved && (
              <VideoRevisePanel
                key={video.id}
                base={video}
                initialScenes={[...(video.scenes ?? [])]
                  .sort((x, y) => x.scene_index - y.scene_index)
                  .map(
                    (sc): EditableVideoScene => ({
                      sceneIndex: sc.scene_index,
                      durationSeconds: sc.duration_seconds,
                      textOverlay: sc.text_overlay ?? "",
                      voiceScript: sc.voice_script ?? "",
                      motionEffect: sc.motion_effect ?? "ZOOM_IN",
                      imageAssetId: sc.image_asset_id && !sc.image_asset_id.includes("/") ? sc.image_asset_id : null,
                    })
                  )}
                imageChoices={styled.map((a) => ({
                  assetId: a.id,
                  label: `Cảnh ${String(a.metadata?.scene_index ?? "?")} · ${a.id.slice(0, 6)}${selectedVariants.includes(a.id) ? " (trong gói)" : ""}`,
                }))}
                onReady={(id) => {
                  if (id !== videoJobId) void onApply({ videoJobId: id })
                }}
              />
            )}
          </div>
        </div>
      )}
      {!approved && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px]">
            <Select
              value={videoJobId ?? "none"}
              onValueChange={(val) => setVideoJobId(val === "none" ? null : val)}
            >
              <SelectTrigger className="w-full h-8 text-caption">
                <SelectValue placeholder="— Không kèm video —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không kèm video —</SelectItem>
                {videoJobs.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title} · {v.aspect_ratio} · {v.stage} · Duyệt video: {v.video_approval}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-caption gap-1"
            onClick={() => onRework("e", videoJobId ? { videoJobId } : {})}
          >
            <RefreshCw size={11} /> Sửa storyboard / dựng lại
          </Button>
        </div>
      )}
    </section>
  )
}
