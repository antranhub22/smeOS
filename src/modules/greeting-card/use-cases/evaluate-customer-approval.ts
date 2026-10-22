/**
 * evaluate-customer-approval.ts
 *
 * Phase 3 — M2b Customer Auto-Approve Timer.
 *
 * Sau khi cửa hàng upload ảnh thành phẩm thành công (production_status = READY),
 * hệ thống gửi ảnh cho khách và đặt deadline "customerApprovalDeadlineMs".
 * Nếu sau T phút khách không phản hồi → auto-approve (pass) để không chặn quy trình.
 *
 * Hai luồng song song (Dual-Stream):
 *  - Auto-Stream: sweep đọc customerApprovalDeadlineMs, nếu quá hạn → auto-approve
 *  - Coordinator-Stream: coordinator duyệt thay khách qua API /coordinator/orders/[id]/approve-customer-photo
 *
 * First-Wins Mutex: Ai approve trước (khách thật, coordinator, hay auto) → khóa ngay lập tức.
 */

import { SubcontractStepStore } from "@/modules/greeting-card/infra/subcontract-step-store"
import { log } from "@/core/observability/log"

export interface CustomerApprovalState {
  /** Timestamp gửi ảnh cho khách (ISO) */
  sentToCustomerAt: string | null
  /** Deadline khách xác nhận — sau đó tự động pass (epoch ms) */
  approvalDeadlineMs: number | null
  /** Kết quả xác nhận */
  approvedAt: string | null
  approvedBy: "customer" | "coordinator" | "auto_timeout" | null
  /** Khách đã reject? */
  rejectedAt: string | null
  rejectedReason: string | null
}

export interface EvaluateCustomerApprovalInput {
  organizationId: string
  orderId: string
  orderCode: string
  productionStatus: string
  /** Thời gian tự động pass nếu khách không phản hồi (phút, mặc định: 30) */
  autoApproveAfterMinutes?: number
}

export interface EvaluateCustomerApprovalResult {
  action: "no_op" | "sent_to_customer" | "auto_approved" | "already_approved"
  approvalState?: CustomerApprovalState
}

/**
 * Đánh giá trạng thái xác nhận ảnh của khách hàng.
 * Gọi từ sweep mỗi chu kỳ để phát hiện timeout → auto-approve.
 */
export async function evaluateCustomerApproval(
  input: EvaluateCustomerApprovalInput,
  now = new Date()
): Promise<EvaluateCustomerApprovalResult> {
  const { organizationId, orderId, productionStatus, autoApproveAfterMinutes = 30 } = input

  // Chỉ đánh giá khi ảnh đã pass QC (READY)
  if (productionStatus !== "READY") {
    return { action: "no_op" }
  }

  const nowMs = now.getTime()
  // Đọc–sửa–ghi dưới khoá dòng: cron và người duyệt không ghi đè nhau
  const outcome = await new SubcontractStepStore().mutateMetadata<EvaluateCustomerApprovalResult & { approvalState: CustomerApprovalState }>(organizationId, orderId, (current) => {
    const approvalState = (current.customer_photo_approval as CustomerApprovalState | undefined) ?? {
      sentToCustomerAt: null,
      approvalDeadlineMs: null,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedReason: null,
    }
    if (approvalState.approvedAt) {
      return { next: null, result: { action: "already_approved" as const, approvalState } }
    }
    if (!approvalState.sentToCustomerAt) {
      const sent: CustomerApprovalState = {
        ...approvalState,
        sentToCustomerAt: now.toISOString(),
        approvalDeadlineMs: nowMs + autoApproveAfterMinutes * 60 * 1000,
      }
      return { next: { ...current, customer_photo_approval: sent }, result: { action: "sent_to_customer" as const, approvalState: sent } }
    }
    if (approvalState.approvalDeadlineMs && nowMs >= approvalState.approvalDeadlineMs) {
      const approved: CustomerApprovalState = { ...approvalState, approvedAt: now.toISOString(), approvedBy: "auto_timeout" }
      return { next: { ...current, customer_photo_approval: approved }, result: { action: "auto_approved" as const, approvalState: approved } }
    }
    return { next: null, result: { action: "no_op" as const, approvalState } }
  })

  if (outcome.action === "sent_to_customer") {
    log.info("customer_approval.deadline_set", { orderId, approveAfterMinutes: autoApproveAfterMinutes, deadlineMs: outcome.approvalState.approvalDeadlineMs })
  } else if (outcome.action === "auto_approved") {
    log.info("customer_approval.auto_approved", { orderId, orderCode: input.orderCode, autoAfterMinutes: autoApproveAfterMinutes })
  }
  return outcome
}

/**
 * Coordinator hoặc khách approve ảnh thành phẩm trực tiếp.
 * First-Wins Mutex: chỉ approve 1 lần, lần sau trả alreadyApproved.
 */
export async function approveCustomerPhoto(
  organizationId: string,
  orderId: string,
  approvedBy: "customer" | "coordinator",
  actorId: string,
  now = new Date()
): Promise<{ success: boolean; alreadyApproved: boolean }> {
  const outcome = await new SubcontractStepStore().mutateMetadata(organizationId, orderId, (current) => {
    const approvalState = current.customer_photo_approval as CustomerApprovalState | undefined
    if (approvalState?.approvedAt) return { next: null, result: "already" as const }
    const approved: CustomerApprovalState = {
      sentToCustomerAt: approvalState?.sentToCustomerAt ?? now.toISOString(),
      approvalDeadlineMs: approvalState?.approvalDeadlineMs ?? null,
      approvedAt: now.toISOString(),
      approvedBy,
      rejectedAt: null,
      rejectedReason: null,
    }
    return { next: { ...current, customer_photo_approval: approved }, result: "approved" as const }
  })
  if (outcome === "already") return { success: true, alreadyApproved: true }

  log.info("customer_approval.approved", { orderId, approvedBy, actorId })
  return { success: true, alreadyApproved: false }
}
