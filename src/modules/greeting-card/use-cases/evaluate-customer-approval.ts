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

  const store = new SubcontractStepStore()
  const coordMeta = await store.findMetadata(organizationId, orderId)

  if (!coordMeta) return { action: "no_op" }

  const existingMeta = coordMeta
  const approvalState = (existingMeta.customer_photo_approval as CustomerApprovalState | undefined) ?? {
    sentToCustomerAt: null,
    approvalDeadlineMs: null,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedReason: null,
  }

  // Đã approve rồi → no_op
  if (approvalState.approvedAt) {
    return { action: "already_approved", approvalState }
  }

  const nowMs = now.getTime()

  // Chưa gửi cho khách → đặt deadline và ghi nhận
  if (!approvalState.sentToCustomerAt) {
    const deadlineMs = nowMs + autoApproveAfterMinutes * 60 * 1000
    const newApprovalState: CustomerApprovalState = {
      ...approvalState,
      sentToCustomerAt: now.toISOString(),
      approvalDeadlineMs: deadlineMs,
    }
    await store.writeMetadata(organizationId, orderId, { ...existingMeta, customer_photo_approval: newApprovalState })
    log.info("customer_approval.deadline_set", {
      orderId,
      approveAfterMinutes: autoApproveAfterMinutes,
      deadlineMs,
    })
    return { action: "sent_to_customer", approvalState: newApprovalState }
  }

  // Đã gửi → kiểm tra timeout
  if (approvalState.approvalDeadlineMs && nowMs >= approvalState.approvalDeadlineMs) {
    const autoApprovedState: CustomerApprovalState = {
      ...approvalState,
      approvedAt: now.toISOString(),
      approvedBy: "auto_timeout",
    }
    await store.writeMetadata(organizationId, orderId, { ...existingMeta, customer_photo_approval: autoApprovedState })
    log.info("customer_approval.auto_approved", {
      orderId,
      orderCode: input.orderCode,
      autoAfterMinutes: autoApproveAfterMinutes,
    })
    return { action: "auto_approved", approvalState: autoApprovedState }
  }

  return { action: "no_op", approvalState }
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
  const store = new SubcontractStepStore()
  const coordMeta = await store.findMetadata(organizationId, orderId)
  if (!coordMeta) return { success: false, alreadyApproved: false }

  const existingMeta = coordMeta
  const approvalState = existingMeta.customer_photo_approval as CustomerApprovalState | undefined

  // Đã approve → trả alreadyApproved
  if (approvalState?.approvedAt) {
    return { success: true, alreadyApproved: true }
  }

  const newApprovalState: CustomerApprovalState = {
    sentToCustomerAt: approvalState?.sentToCustomerAt ?? now.toISOString(),
    approvalDeadlineMs: approvalState?.approvalDeadlineMs ?? null,
    approvedAt: now.toISOString(),
    approvedBy,
    rejectedAt: null,
    rejectedReason: null,
  }

  await store.writeMetadata(organizationId, orderId, { ...existingMeta, customer_photo_approval: newApprovalState })

  log.info("customer_approval.approved", { orderId, approvedBy, actorId })
  return { success: true, alreadyApproved: false }
}
