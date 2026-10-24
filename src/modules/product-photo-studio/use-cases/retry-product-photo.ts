import { notFound, validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { GenerationJobRepository } from "@/modules/jobs/infra/generation-job-repository"
import { canRetry } from "../domain/photo-enhance-rules"
import { createProductPhotoJob } from "./create-product-photo-job"
import { getProductPhotoResult } from "./get-product-photo-result"

export interface RetryProductPhotoInput {
  jobId: string
  retryHint?: string | undefined
  idempotencyKey: string
}

export async function retryProductPhoto(
  ctx: TenantContext,
  input: RetryProductPhotoInput
) {
  const currentResult = await getProductPhotoResult(ctx, input.jobId)
  if (!currentResult) {
    throw notFound()
  }

  const jobRepo = new GenerationJobRepository()
  const previousJob = await jobRepo.findById(ctx, input.jobId)
  if (!previousJob) throw notFound()

  const payload = (previousJob.payload as Record<string, unknown>) ?? {}
  const config = (payload.config as Record<string, unknown>) ?? {}
  const currentRetryCount = typeof config.retry_count === "number" ? config.retry_count : 0

  if (!canRetry(currentRetryCount, currentResult.qcEvaluation)) {
    throw validationFailed({
      retry: "Đã đạt số lần thử lại tối đa (2 lần) hoặc ảnh đã đạt chuẩn.",
    })
  }

  const assetId = payload.asset_id as string
  const failedCriteria = [...currentResult.qcEvaluation.failedCriteria]

  return createProductPhotoJob(ctx, {
    assetId,
    presetId: (config.preset_id as string) ?? "auto",
    aspectRatio: (config.aspect_ratio as string) ?? "auto",
    customNote: config.custom_note as string,
    retryHint: input.retryHint ?? currentResult.qcEvaluation.retryHint ?? undefined,
    failedCriteria,
    idempotencyKey: input.idempotencyKey,
  })
}
