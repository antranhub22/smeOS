import { AppError, notFound } from "@/core/http/errors"
import { RegistrationRequestRepository, getRegistrationRequestRepository } from "@/modules/organization/infra/registration-request-repository"
import type { PlatformContext } from "@/core/platform/platform-context"

export type ApproveRegistrationInput = {
  registrationId: string
  reviewNote?: string | null
}

/**
 * Duyệt đơn đăng ký — chuyển membership của Founder từ INVITED → ACTIVE.
 * Chỉ Platform Operator (N1 trở lên) mới gọi được.
 */
export async function approveRegistration(
  pctx: PlatformContext,
  input: ApproveRegistrationInput,
  repo: RegistrationRequestRepository = getRegistrationRequestRepository()
): Promise<void> {
  const req = await repo.findById(input.registrationId)
  if (!req) throw notFound()
  if (req.status !== "PENDING") {
    throw new AppError("UNPROCESSABLE_ENTITY", "Đơn này đã được xử lý rồi")
  }

  // Cập nhật đơn → APPROVED + kích hoạt membership của Founder qua repo.
  await repo.approveAndActivateFounder(
    req.id,
    pctx.userId,
    input.reviewNote ?? null,
    req.organization_id,
    req.user_id
  )
}

export type RejectRegistrationInput = {
  registrationId: string
  reviewNote: string
}

/**
 * Từ chối đơn đăng ký — membership vẫn INVITED, org tồn tại nhưng bị chặn.
 */
export async function rejectRegistration(
  pctx: PlatformContext,
  input: RejectRegistrationInput
): Promise<void> {
  const repo = getRegistrationRequestRepository()
  const req = await repo.findById(input.registrationId)
  if (!req) throw notFound()
  if (req.status !== "PENDING") {
    throw new AppError("UNPROCESSABLE_ENTITY", "Đơn này đã được xử lý rồi")
  }

  await repo.updateStatus(req.id, "REJECTED", pctx.userId, input.reviewNote)
}
