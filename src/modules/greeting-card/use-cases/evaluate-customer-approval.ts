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

import { getSubcontractOrderRepository } from "../infra/subcontract-order-repository"
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

  const repo = getSubcontractOrderRepository() as import("../infra/subcontract-order-repository").SubcontractOrderRepository
  const coord = await repo.findCoordinationScoped(orderId, organizationId)

  if (!coord) return { action: "no_op" }

  const existingMeta = (coord.metadata as Record<string, unknown> | null) ?? {}
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
    await repo.upsertCoordinationMeta(orderId, organizationId, {
      customer_photo_approval: newApprovalState,
    })
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
    await repo.upsertCoordinationMeta(orderId, organizationId, {
      customer_photo_approval: autoApprovedState,
    })
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
  const repo2 = getSubcontractOrderRepository() as import("../infra/subcontract-order-repository").SubcontractOrderRepository
  const coord = await repo2.findCoordinationScoped(orderId, organizationId)
  if (!coord) return { success: false, alreadyApproved: false }

  const existingMeta = (coord.metadata as Record<string, unknown> | null) ?? {}
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

  await repo2.upsertCoordinationMeta(orderId, organizationId, {
    customer_photo_approval: newApprovalState,
  })

  log.info("customer_approval.approved", { orderId, approvedBy, actorId })
  return { success: true, alreadyApproved: false }
}
