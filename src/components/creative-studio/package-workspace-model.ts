/** Hằng số, kiểu và phép chọn thuần của màn Gói chiến dịch (Chặng 09) — tách khỏi `use-package-workspace.ts`. */
import { samePosts, type CampaignPackageDto, type PackageChannel, type PackagePostDto } from "./package-client"

export const CHANNELS: { id: PackageChannel; label: string }[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "zalo", label: "Zalo OA" },
]

export const STATUS_LABEL: Record<CampaignPackageDto["status"], string> = {
  DRAFT: "Nháp — chưa chạy QA",
  QA_PASSED: "QA đạt",
  QA_NEEDS_REVIEW: "QA cần xem lại",
  QA_REJECTED: "QA từ chối",
  APPROVED: "Đã duyệt (Chặng 09)",
}

export interface MarketingAsset {
  id: string
  url: string | null
  aspect_ratio: string | null
  identity_score: number | null
  approval_state: string
  metadata?: Record<string, unknown> | null
}

export interface VideoJobSummary {
  id: string
  title: string
  stage: string
  video_approval: string
  aspect_ratio: string
}

export function parseHashtags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
}

/** Ảnh cảnh đã dựng (styled/branded) của đúng kịch bản, mỗi cặp khung × cảnh lấy một ảnh, theo thứ tự cảnh. */
export function selectProducedScenes(input: {
  marketing: MarketingAsset[]
  urlPlanId: string | null
  primaryRatio: string | null
  planRatios: string[]
}): MarketingAsset[] {
  const { marketing, urlPlanId, primaryRatio: primary, planRatios } = input
  const samePlan = (v: unknown) =>
    !urlPlanId ? true : urlPlanId === "rule" ? typeof v === "string" && v.startsWith("rule:") : v === urlPlanId
  const seen = new Set<string>()
  return marketing
    .filter((a) => {
      const m = a.metadata ?? {}
      if (m.variant_key !== "styled" && m.variant_key !== "branded") return false
      if (!samePlan(m.scene_plan_id)) return false
      const idx = typeof m.scene_index === "number" ? m.scene_index : null
      const ratio = typeof m.ratio === "string" ? m.ratio : primary
      if (planRatios.length > 0 && ratio && !planRatios.includes(ratio)) return false
      const key = `${ratio}:${idx}`
      if (idx === null || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => Number(a.metadata?.scene_index ?? 0) - Number(b.metadata?.scene_index ?? 0))
}

const pickVideo = (pool: VideoJobSummary[]): VideoJobSummary | null =>
  pool.find((v) => v.video_approval === "APPROVED") ?? pool.find((v) => v.stage === "RENDER_COMPLETED") ?? null

/** Video gợi ý cho gói: video trên URL nếu có, không thì video đã duyệt/đã dựng xong — mỗi khung một video. */
export function selectSuggestedVideos(input: {
  videoJobs: VideoJobSummary[]
  urlVideoJobId: string | null
  multiRatio: boolean
  planRatios: string[]
}): VideoJobSummary[] {
  const { videoJobs, urlVideoJobId, multiRatio, planRatios } = input
  const fromUrl = urlVideoJobId
    ? (videoJobs.find((v) => v.id === urlVideoJobId) ?? { id: urlVideoJobId, title: "", stage: "?", video_approval: "?", aspect_ratio: "" })
    : null
  if (!multiRatio) {
    const one = fromUrl ?? pickVideo(videoJobs)
    return one ? [one] : []
  }
  return planRatios
    .map((r) => (fromUrl && fromUrl.aspect_ratio === r ? fromUrl : pickVideo(videoJobs.filter((v) => v.aspect_ratio === r))))
    .filter((v): v is VideoJobSummary => v !== null)
}

/** Gói nháp có thay đổi chưa lưu (bài đăng, ảnh, video, âm thanh) so với bản trên máy chủ; gói đã duyệt không tính. */
export function isPackageDirty(input: {
  pkg: CampaignPackageDto | null
  approved: boolean
  draftPosts: PackagePostDto[]
  selectedVariants: string[]
  videoJobIds: string[]
  audioJobId: string | null
}): boolean {
  const { pkg, approved, draftPosts, selectedVariants, videoJobIds, audioJobId } = input
  return (
    !!pkg &&
    !approved &&
    (!samePosts(draftPosts, pkg.posts) ||
      JSON.stringify([...selectedVariants].sort()) !== JSON.stringify([...pkg.variant_asset_ids].sort()) ||
      JSON.stringify(videoJobIds) !== JSON.stringify(pkg.video_job_ids?.length ? pkg.video_job_ids : pkg.video_job_id ? [pkg.video_job_id] : []) ||
      audioJobId !== pkg.audio_job_id)
  )
}
