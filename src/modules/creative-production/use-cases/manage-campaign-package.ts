/**
 * Use-cases: Gói chiến dịch Creative Studio (Khu vực F — Chặng 07, 08, 09, 10).
 *
 * 23/09/2026 — thay cho giao diện dựng sẵn (QA luôn PASSED, duyệt không ghi gì):
 *
 *   createCampaignPackage / updateCampaignPackage — Chặng 07 PACKAGE
 *   runCampaignQa                                 — Chặng 08 QA (chạy phía máy chủ, xem qa-and-approve-package.ts)
 *   approveCampaignPackage                        — Chặng 09 APPROVE (+ audit_logs, xem qa-and-approve-package.ts)
 *   saveLaunchPlan                                — Chặng 10 LAUNCH (kế hoạch + mã bài đã đăng)
 *
 * Gói chỉ giữ ĐỊNH DANH tới tài sản thật; mọi định danh được kiểm thuộc đúng
 * tổ chức và đúng Master trước khi ghi.
 */

import { conflict, notFound, validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { getAssetRepository } from "@/modules/assets/infra/asset-repository"
import type { IAssetRepository } from "@/modules/assets/domain/repositories/asset-repository.interface"
import { getAudioJobRepository } from "@/modules/audio-studio/infra/audio-job-repository"
import type { IAudioJobRepository } from "@/modules/audio-studio/domain/repositories/audio-job-repository.interface"
import { getVideoJobRepository } from "@/modules/video-studio/infra/video-job-repository"
import type { IVideoJobRepository } from "@/modules/video-studio/domain/repositories/video-job-repository.interface"
import { videoViewUrl } from "@/modules/video-studio/use-cases/get-video-job"

import {
  canEditPackage,
  type CampaignPackageStatus,
  type LaunchPlan,
  type PackagePost,
  type QaReport,
} from "../domain/campaign-package-rules"
import {
  getCampaignPackageRepository,
  type campaign_packages,
} from "../infra/campaign-package-repository"
import type { ICampaignPackageRepository } from "../domain/repositories/campaign-package-repository.interface"

// Re-export Chặng 08 & 09 từ qa-and-approve-package.ts
export { runCampaignQa, approveCampaignPackage } from "./qa-and-approve-package"

const PREVIEW_EXPIRES_IN = 3600

export interface CampaignTopicSnapshot {
  readonly id: string
  readonly title: string
  readonly angleCategory?: string | undefined
  readonly hook?: string | undefined
  readonly cta?: string | undefined
  /** Preset Cảnh 2 (Khu vực D) — một chiều so sánh của Chặng 13. */
  readonly scene2Preset?: string | undefined
  /** Kịch bản sản xuất tổng của gói + phiên bản lúc tạo gói (Đợt 5). */
  readonly scenePlanId?: string | undefined
  readonly scenePlanRevision?: number | undefined
}

export interface CreateCampaignPackageInput {
  readonly name: string
  readonly mode: "CREATIVE" | "AUTHENTIC"
  readonly masterAssetId: string
  readonly topic?: CampaignTopicSnapshot | undefined
  readonly posts?: readonly PackagePost[] | undefined
  readonly variantAssetIds?: readonly string[] | undefined
  readonly videoJobId?: string | null | undefined
  /** Mọi video của gói (mỗi khung một video, 24/09/2026). */
  readonly videoJobIds?: readonly string[] | undefined
  readonly audioJobId?: string | null | undefined
}

export interface UpdateCampaignPackageInput {
  readonly name?: string | undefined
  readonly posts?: readonly PackagePost[] | undefined
  readonly variantAssetIds?: readonly string[] | undefined
  readonly videoJobId?: string | null | undefined
  readonly videoJobIds?: readonly string[] | undefined
  readonly audioJobId?: string | null | undefined
}

/**
 * Hợp `video_job_id` (video chính, API cũ) + `video_job_ids` thành một danh sách
 * không trùng; phần tử đầu là video chính. `undefined` = không đổi.
 */
export function mergeVideoIds(
  primary: string | null | undefined,
  list: readonly string[] | undefined
): { videoJobId: string | null; videoJobIds: string[] } | undefined {
  if (primary === undefined && list === undefined) return undefined
  const ids = Array.from(new Set([...(primary ? [primary] : []), ...(list ?? [])]))
  return { videoJobId: ids[0] ?? null, videoJobIds: ids }
}

// ─── Kiểm định danh ──────────────────────────────────────────────────────────

async function assertMaster(
  ctx: TenantContext,
  masterAssetId: string,
  assetRepo: IAssetRepository
) {
  const master = await assetRepo.findById(ctx, masterAssetId)
  if (!master) throw notFound()
  if (master.kind !== "MASTER" || master.approval_state !== "APPROVED") {
    throw conflict("Gói chiến dịch phải neo vào một Master Image đã duyệt (cổng 2, I2).")
  }
  return master
}

async function assertVariants(
  ctx: TenantContext,
  masterAssetId: string,
  ids: readonly string[],
  assetRepo: IAssetRepository
) {
  const unique = Array.from(new Set(ids))
  for (const id of unique) {
    const a = await assetRepo.findById(ctx, id)
    if (!a || a.kind !== "MARKETING" || a.parent_asset_id !== masterAssetId) {
      throw validationFailed({
        variant_asset_ids: `Asset ${id} không phải biến thể marketing của Master ${masterAssetId}.`,
      })
    }
  }
  return unique
}

async function assertVideos(
  ctx: TenantContext,
  ids: readonly string[] | undefined,
  videoRepo: IVideoJobRepository
) {
  for (const id of ids ?? []) {
    if (!(await videoRepo.findById(ctx, id))) {
      throw validationFailed({ video_job_id: `Video job ${id} không tồn tại trong tổ chức.` })
    }
  }
}

async function assertAudio(
  ctx: TenantContext,
  id: string | null | undefined,
  audioRepo: IAudioJobRepository
) {
  if (!id) return
  if (!(await audioRepo.findById(ctx, id))) {
    throw validationFailed({ audio_job_id: "Audio job không tồn tại trong tổ chức." })
  }
}

// ─── Chặng 07 ────────────────────────────────────────────────────────────────

export async function createCampaignPackage(
  ctx: TenantContext,
  input: CreateCampaignPackageInput,
  repo: ICampaignPackageRepository = getCampaignPackageRepository(),
  assetRepo: IAssetRepository = getAssetRepository(),
  videoRepo: IVideoJobRepository = getVideoJobRepository(),
  audioRepo: IAudioJobRepository = getAudioJobRepository()
) {
  const master = await assertMaster(ctx, input.masterAssetId, assetRepo)
  const variantIds = await assertVariants(ctx, master.id, input.variantAssetIds ?? [], assetRepo)
  const vids = mergeVideoIds(input.videoJobId ?? null, input.videoJobIds ?? []) ?? { videoJobId: null, videoJobIds: [] }
  await assertVideos(ctx, vids.videoJobIds, videoRepo)
  await assertAudio(ctx, input.audioJobId, audioRepo)

  const row = await repo.create(ctx, {
    productId: master.product_id,
    masterAssetId: master.id,
    name: input.name.trim(),
    mode: input.mode,
    topic: input.topic ?? null,
    content: { posts: input.posts ?? [] },
    variantAssetIds: variantIds,
    videoJobId: vids.videoJobId,
    videoJobIds: vids.videoJobIds,
    audioJobId: input.audioJobId ?? null,
  })
  return getCampaignPackage(ctx, row.id, repo, assetRepo, videoRepo, audioRepo)
}

export async function updateCampaignPackage(
  ctx: TenantContext,
  id: string,
  input: UpdateCampaignPackageInput,
  repo: ICampaignPackageRepository = getCampaignPackageRepository(),
  assetRepo: IAssetRepository = getAssetRepository(),
  videoRepo: IVideoJobRepository = getVideoJobRepository(),
  audioRepo: IAudioJobRepository = getAudioJobRepository()
) {
  const current = await repo.findById(ctx, id)
  if (!current) throw notFound()
  if (!canEditPackage(current.status as CampaignPackageStatus)) {
    throw conflict("Gói đã duyệt không sửa được — tạo gói mới cho chiến dịch khác.")
  }
  const variantIds =
    input.variantAssetIds !== undefined
      ? await assertVariants(ctx, current.master_asset_id, input.variantAssetIds, assetRepo)
      : undefined
  const vids = mergeVideoIds(input.videoJobId, input.videoJobIds)
  await assertVideos(ctx, vids?.videoJobIds, videoRepo)
  await assertAudio(ctx, input.audioJobId, audioRepo)

  const updated = await repo.updateDraft(ctx, id, {
    name: input.name?.trim(),
    content: input.posts !== undefined ? { posts: input.posts } : undefined,
    variantAssetIds: variantIds,
    videoJobId: vids?.videoJobId,
    videoJobIds: vids?.videoJobIds,
    audioJobId: input.audioJobId,
  })
  if (!updated) throw conflict("Gói vừa được duyệt ở nơi khác — tải lại để xem.")
  return getCampaignPackage(ctx, id, repo, assetRepo, videoRepo, audioRepo)
}

// ─── Đọc ─────────────────────────────────────────────────────────────────────

export function postsOf(row: Pick<campaign_packages, "content">): PackagePost[] {
  const content = row.content as { posts?: PackagePost[] } | null
  return Array.isArray(content?.posts) ? content!.posts : []
}

/** Mọi video của gói — gói cũ chỉ có `video_job_id`. */
export function videoIdsOf(row: Pick<campaign_packages, "video_job_id" | "video_job_ids">): string[] {
  const list = row.video_job_ids ?? []
  if (list.length > 0) return [...list]
  return row.video_job_id ? [row.video_job_id] : []
}

export function launchPlanOf(row: Pick<campaign_packages, "launch_plan">): LaunchPlan | null {
  const plan = row.launch_plan as LaunchPlan | null
  return plan && Array.isArray(plan.channels) ? plan : null
}

export async function getCampaignPackage(
  ctx: TenantContext,
  id: string,
  repo: ICampaignPackageRepository = getCampaignPackageRepository(),
  assetRepo: IAssetRepository = getAssetRepository(),
  videoRepo: IVideoJobRepository = getVideoJobRepository(),
  audioRepo: IAudioJobRepository = getAudioJobRepository()
) {
  const row = await repo.findById(ctx, id)
  if (!row) throw notFound()

  const storage = getStorageProvider()
  const variants = []
  for (const assetId of row.variant_asset_ids) {
    const a = await assetRepo.findById(ctx, assetId)
    if (!a) continue
    const meta = (a.metadata && typeof a.metadata === "object" ? a.metadata : {}) as Record<string, unknown>
    variants.push({
      asset_id: a.id,
      url: await storage.signedUrl(a.storage_key, PREVIEW_EXPIRES_IN),
      aspect_ratio: a.aspect_ratio,
      identity_score: a.identity_score,
      approval_state: a.approval_state,
      scene_index: typeof meta.scene_index === "number" ? meta.scene_index : null,
      watermark: meta.watermark === true,
    })
  }

  const videos = []
  for (const vid of videoIdsOf(row)) {
    const v = await videoRepo.findById(ctx, vid)
    if (!v) continue
    videos.push({
      id: v.id,
      title: v.title,
      stage: v.stage,
      video_approval: v.video_approval,
      aspect_ratio: v.aspect_ratio,
      final_video_url: v.final_video_url,
      script_approval: v.script_approval,
      view_url: await videoViewUrl(ctx, v.final_video_url),
    })
  }
  const video = videos[0] ?? null

  let audio = null
  if (row.audio_job_id) {
    const a = await audioRepo.findById(ctx, row.audio_job_id)
    if (a) {
      audio = {
        job_id: a.id,
        stage: a.stage,
        audio_url: a.mixedAudioStorageKey
          ? await storage.signedUrl(a.mixedAudioStorageKey, PREVIEW_EXPIRES_IN)
          : null,
      }
    }
  }

  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    status: row.status,
    master_asset_id: row.master_asset_id,
    product_id: row.product_id,
    topic: row.topic,
    posts: postsOf(row),
    variant_asset_ids: row.variant_asset_ids,
    video_job_id: row.video_job_id,
    video_job_ids: videoIdsOf(row),
    audio_job_id: row.audio_job_id,
    variants,
    video,
    videos,
    audio,
    qa_report: row.qa_report as QaReport | null,
    qa_checked_at: row.qa_checked_at?.toISOString() ?? null,
    approved_by: row.approved_by,
    approved_at: row.approved_at?.toISOString() ?? null,
    launch_plan: launchPlanOf(row),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

export async function listCampaignPackages(
  ctx: TenantContext,
  options: { masterAssetId?: string | undefined; limit?: number | undefined },
  repo: ICampaignPackageRepository = getCampaignPackageRepository()
) {
  const limit = Math.min(options.limit ?? 20, 100)
  const rows = await repo.list(ctx, { masterAssetId: options.masterAssetId, limit })
  return {
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      master_asset_id: r.master_asset_id,
      approved_at: r.approved_at?.toISOString() ?? null,
      created_at: r.created_at.toISOString(),
    })),
  }
}

// ─── Chặng 10 ────────────────────────────────────────────────────────────────

export async function saveLaunchPlan(
  ctx: TenantContext,
  id: string,
  plan: LaunchPlan,
  repo: ICampaignPackageRepository = getCampaignPackageRepository()
) {
  const row = await repo.findById(ctx, id)
  if (!row) throw notFound()
  if (row.status !== "APPROVED") throw conflict("Chỉ lập kế hoạch đăng cho gói đã duyệt (Chặng 09).")
  const saved = await repo.saveLaunchPlan(ctx, id, plan)
  if (!saved) throw conflict("Không lưu được kế hoạch đăng.")
  return getCampaignPackage(ctx, id, repo)
}
