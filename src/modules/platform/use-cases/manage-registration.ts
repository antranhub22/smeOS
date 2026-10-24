import { AppError, notFound } from "@/core/http/errors"
import { prisma } from "@/core/tenancy/infra/prisma"
import { RegistrationRequestRepository } from "@/modules/organization/infra/registration-request-repository"
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
  input: ApproveRegistrationInput
): Promise<void> {
  const repo = new RegistrationRequestRepository()
  const req = await repo.findById(input.registrationId)
  if (!req) throw notFound()
  if (req.status !== "PENDING") {
    throw new AppError("UNPROCESSABLE_ENTITY", "Đơn này đã được xử lý rồi")
  }

  // Cập nhật đơn → APPROVED + kích hoạt membership của Founder.
  await prisma.$transaction([
    prisma.registration_requests.update({
      where: { id: req.id },
      data: {
        status: "APPROVED",
        reviewer_id: pctx.userId,
        review_note: input.reviewNote ?? null,
        reviewed_at: new Date(),
      },
    }),
    prisma.memberships.updateMany({
      where: {
        organization_id: req.organization_id,
        user_id: req.user_id,
        status: "INVITED",
      },
      data: {
        status: "ACTIVE",
        joined_at: new Date(),
      },
    }),
  ])
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
  const repo = new RegistrationRequestRepository()
  const req = await repo.findById(input.registrationId)
  if (!req) throw notFound()
  if (req.status !== "PENDING") {
    throw new AppError("UNPROCESSABLE_ENTITY", "Đơn này đã được xử lý rồi")
  }

  await repo.updateStatus(req.id, "REJECTED", pctx.userId, input.reviewNote)
}
