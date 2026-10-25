/**
 * Use-cases: QA và Phê duyệt Gói chiến dịch Creative Studio (Chặng 08 & 09).
 *
 * Tách từ manage-campaign-package.ts để tuân thủ giới hạn 350 dòng (SRP Limit).
 * Áp dụng Clean Architecture: sử dụng Port Interfaces và Dependency Injection.
 */

import { conflict, notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { getAssetRepository } from "@/modules/assets/infra/asset-repository"
import type { IAssetRepository } from "@/modules/assets/domain/repositories/asset-repository.interface"
import { recordAuditLog } from "@/modules/audit/use-cases/record-audit-log"
import { getAudioJobRepository } from "@/modules/audio-studio/infra/audio-job-repository"
import type { IAudioJobRepository } from "@/modules/audio-studio/domain/repositories/audio-job-repository.interface"
import { getGenerationJobRepository } from "@/modules/jobs/infra/generation-job-repository"
import type { IGenerationJobRepository } from "@/modules/jobs/domain/repositories/generation-job-repository.interface"
import { runInTransaction } from "@/modules/jobs/infra/transaction"
import { BrandProfileRepository } from "@/modules/profiles/infra/brand-profile-repository"
import { getVideoJobRepository } from "@/modules/video-studio/infra/video-job-repository"
import type { IVideoJobRepository } from "@/modules/video-studio/domain/repositories/video-job-repository.interface"
import {
  canApprovePackage,
  evaluateCampaignQa,
  statusFromQa,
  type CampaignPackageStatus,
  type QaReport,
  type QaScope,
} from "../domain/campaign-package-rules"
import { SCENE_PLAN_FEATURE, parseStoredScenePlan } from "../domain/scene-plan-rules"
import { resolvePublishing } from "../domain/publishing-rules"
import { getCampaignPackageRepository, CampaignPackageRepository } from "../infra/campaign-package-repository"
import type { ICampaignPackageRepository } from "../domain/repositories/campaign-package-repository.interface"
import type { campaign_packages } from "../infra/entities"
import {
  getCampaignPackage,
  postsOf,
  videoIdsOf,
  type CampaignTopicSnapshot,
} from "./manage-campaign-package"

// ─── Đợt 5 (24/09/2026): đồng nhất kịch bản sản xuất tổng ────────────────────

async function audioPlanLink(
  ctx: TenantContext,
  audioJobId: string,
  jobRepo: IGenerationJobRepository
) {
  const j = await jobRepo.findById(ctx, audioJobId)
  const p = (j?.payload ?? {}) as Record<string, unknown>
  return {
    scenePlanId: typeof p.scenePlanId === "string" ? p.scenePlanId : null,
    scenePlanRevision: typeof p.scenePlanRevision === "number" ? p.scenePlanRevision : null,
  }
}

/** Kịch bản hiện hành của gói: đọc phiên bản mới nhất từ job kịch bản; kịch bản cơ bản dùng số lưu trong gói. */
async function currentPlanOf(
  ctx: TenantContext,
  row: campaign_packages,
  jobRepo: IGenerationJobRepository
): Promise<{ scenePlanId: string; revision: number; scope?: QaScope | undefined } | null> {
  const topic = (row.topic ?? null) as CampaignTopicSnapshot | null
  const id = topic?.scenePlanId
  if (!id) return null
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const j = await jobRepo.findById(ctx, id)
    const plan = j && j.feature === SCENE_PLAN_FEATURE && j.status === "COMPLETED" ? parseStoredScenePlan(j.output) : null
    if (plan) {
      const pub = resolvePublishing(
        plan.publishing.allPlatforms ? "all" : plan.publishing.platforms,
        plan.publishing.allOutputs ? "all" : plan.publishing.outputs
      )
      return {
        scenePlanId: id,
        revision: plan.revision,
        scope: { produce: pub.produce, ratios: pub.ratios, postChannels: pub.postChannels },
      }
    }
  }
  return { scenePlanId: id, revision: topic?.scenePlanRevision ?? 1 }
}

// ─── Chặng 08: QA Gói chiến dịch ─────────────────────────────────────────────

export async function runCampaignQa(
  ctx: TenantContext,
  id: string,
  now: Date = new Date(),
  repo: ICampaignPackageRepository = getCampaignPackageRepository(),
  assetRepo: IAssetRepository = getAssetRepository(),
  videoRepo: IVideoJobRepository = getVideoJobRepository(),
  audioRepo: IAudioJobRepository = getAudioJobRepository(),
  jobRepo: IGenerationJobRepository = getGenerationJobRepository()
) {
  const row = await repo.findById(ctx, id)
  if (!row) throw notFound()
  if (row.status === "APPROVED") throw conflict("Gói đã duyệt — không chạy lại QA.")

  const variants = []
  for (const assetId of row.variant_asset_ids) {
    const a = await assetRepo.findById(ctx, assetId)
    if (!a) continue
    const meta = (a.metadata && typeof a.metadata === "object" ? a.metadata : {}) as Record<string, unknown>
    variants.push({
      assetId: a.id,
      approvalState: a.approval_state,
      identityScore: typeof a.identity_score === "number" ? a.identity_score : null,
      aspectRatio: typeof meta.ratio === "string" ? meta.ratio : a.aspect_ratio,
      watermark: meta.watermark === true,
      scenePlanId: typeof meta.scene_plan_id === "string" ? meta.scene_plan_id : null,
      scenePlanRevision: typeof meta.scene_plan_revision === "number" ? meta.scene_plan_revision : null,
    })
  }

  const videoRows = []
  for (const vid of videoIdsOf(row)) {
    const v = await videoRepo.findById(ctx, vid)
    if (v) videoRows.push(v)
  }
  const audioRow = row.audio_job_id ? await audioRepo.findById(ctx, row.audio_job_id) : null
  const brand = await new BrandProfileRepository().current(ctx)
  const forbidden = brand?.forbidden_styles
  const forbiddenStyles =
    typeof forbidden === "string"
      ? forbidden
      : Array.isArray(forbidden)
      ? forbidden.join(", ")
      : forbidden
      ? JSON.stringify(forbidden)
      : null

  const report = evaluateCampaignQa({
    posts: postsOf(row),
    variants,
    video: null,
    videos: videoRows.map((v) => ({
      stage: v.stage,
      approval: v.video_approval,
      aspectRatio: v.aspect_ratio,
      scenePlanId: v.scene_plan_id,
      scenePlanRevision: v.scene_plan_revision,
      usesPlanAudio: Boolean(v.audio_storage_key),
    })),
    audio: audioRow ? { stage: audioRow.stage, ...(await audioPlanLink(ctx, audioRow.id, jobRepo)) } : null,
    plan: await currentPlanOf(ctx, row, jobRepo),
    brand: { hasLogo: Boolean(brand?.logo_asset_id), forbiddenStyles },
    now,
  })

  const saved = await repo.saveQa(ctx, id, statusFromQa(report.verdict), report, now)
  if (!saved) throw conflict("Gói vừa được duyệt ở nơi khác — tải lại để xem.")
  return getCampaignPackage(ctx, id, repo)
}

// ─── Chặng 09: Duyệt Gói chiến dịch ──────────────────────────────────────────

export async function approveCampaignPackage(
  ctx: TenantContext,
  id: string,
  input: { acknowledgeWarnings: boolean },
  now: Date = new Date(),
  repo: ICampaignPackageRepository = getCampaignPackageRepository()
) {
  const row = await repo.findById(ctx, id)
  if (!row) throw notFound()

  const status = row.status as CampaignPackageStatus
  const decision = canApprovePackage(status, input.acknowledgeWarnings)
  if (!decision.ok) throw conflict(decision.reason)

  await runInTransaction(async (tx) => {
    const ok = await new CampaignPackageRepository(tx).approve(ctx, id, status, now)
    if (!ok) throw conflict("Trạng thái gói vừa thay đổi — tải lại rồi duyệt lại.")
    await recordAuditLog(
      ctx,
      {
        action: "campaign_package.approve",
        entityType: "campaign_packages",
        entityId: id,
        before: { status },
        after: {
          status: "APPROVED",
          acknowledged_warnings: input.acknowledgeWarnings,
          qa_verdict: (row.qa_report as QaReport | null)?.verdict ?? null,
        },
      },
      tx
    )
  })
  return getCampaignPackage(ctx, id, repo)
}
