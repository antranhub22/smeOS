/**
 * handle-subcontract-claim.ts
 *
 * Use-case: Tiếp nhận hoặc Hủy nhận Thẻ Gia Công (Claim / Cancel Subcontract Order).
 * Clean Architecture — Đảm bảo khóa đồng thời 1-chạm và tự động bắn lại khi hủy trong hạn.
 */

import type { TenantContext } from "@/core/tenancy"
import { conflict, notFound, unprocessable } from "@/core/http/errors"
import {
  cancelClaimSubcontractOrder,
  claimSubcontractOrder,
  type CancelClaimResult,
  type ClaimResult,
  type SubcontractOrderState,
} from "../domain/subcontract-order"
import {
  parseChainDispatchPolicy,
  renderDispatchMessage,
  type ChainDispatchPolicy,
} from "../domain/chain-dispatch-policy"
import type { IDispatchNotifier, ISubcontractStateStore } from "./dispatch-subcontract-order"
import type { BranchCandidate } from "../domain/chain-dispatch-engine"

export interface ClaimSubcontractInput {
  orderId: string
  branchId: string
  branchName: string
  shopSettings: unknown
}

export interface ClaimSubcontractResponse {
  success: boolean
  orderId: string
  claimedBranchId: string
  graceMinutes: number
  graceExpiresAt: string
}

/**
 * Xử lý khi chi nhánh bấm [TIẾP NHẬN ĐƠN] trên Thẻ Gia Công trực tuyến.
 */
export async function claimSubcontractUseCase(
  ctx: TenantContext,
  input: ClaimSubcontractInput,
  store: ISubcontractStateStore,
  notifier: IDispatchNotifier,
  branches: BranchCandidate[],
  now = new Date()
): Promise<ClaimSubcontractResponse> {
  const policy: ChainDispatchPolicy = parseChainDispatchPolicy(input.shopSettings)
  const state = await store.loadSubcontractState(ctx, input.orderId)

  if (!state) {
    throw notFound()
  }

  const claimResult: ClaimResult = claimSubcontractOrder(
    state,
    input.branchId,
    input.branchName,
    policy.cancellationGraceMinutes,
    now
  )

  if (!claimResult.success) {
    if (claimResult.reason === "ALREADY_CLAIMED") {
      throw conflict(`Đơn hàng này đã được một chi nhánh khác tiếp nhận trước đó. Cảm ơn bạn!`)
    }
    if (claimResult.reason === "DECLINED_PREVIOUSLY") {
      throw unprocessable("Chi nhánh của bạn đã từ chối hoặc hủy đơn này trước đó.")
    }
    throw conflict("Đơn hàng hiện không ở trạng thái sẵn sàng để nhận.")
  }

  // 1. Lưu trạng thái mới (CLAIMED_GRACE)
  await store.saveSubcontractState(ctx, claimResult.nextState)

  // 2. Bắn tin nhắn xác nhận tiếp nhận thành công cho chi nhánh vừa nhận
  const claimingBranch = branches.find((b) => b.branchId === input.branchId)
  if (claimingBranch) {
    const successMsg = renderDispatchMessage(policy.messageTemplates.claimSuccess, {
      orderCode: state.orderCode,
      branchName: input.branchName,
      graceMinutes: policy.cancellationGraceMinutes,
    })

    await notifier.sendSubcontractInvite(ctx, {
      branch: claimingBranch,
      orderCode: state.orderCode,
      messageText: successMsg,
      claimUrl: "",
    })
  }

  return {
    success: true,
    orderId: input.orderId,
    claimedBranchId: input.branchId,
    graceMinutes: policy.cancellationGraceMinutes,
    graceExpiresAt: claimResult.nextState.graceExpiresAt!,
  }
}

/**
 * Xử lý khi chi nhánh bấm [HỦY NHẬN ĐƠN] trong thời gian kiểm tra kho (Grace Period).
 */
export async function cancelClaimSubcontractUseCase(
  ctx: TenantContext,
  input: { orderId: string; branchId: string },
  store: ISubcontractStateStore,
  now = new Date()
): Promise<{ success: boolean; reopened: boolean }> {
  const state = await store.loadSubcontractState(ctx, input.orderId)
  if (!state) throw notFound()

  const cancelResult: CancelClaimResult = cancelClaimSubcontractOrder(state, input.branchId, now)

  if (!cancelResult.success) {
    if (cancelResult.reason === "GRACE_EXPIRED") {
      throw unprocessable("Đã hết thời hạn hủy cho phép. Đơn hàng đã chính thức vào sản xuất!")
    }
    if (cancelResult.reason === "UNAUTHORIZED_BRANCH") {
      throw unprocessable("Bạn không phải chi nhánh đang tiếp nhận đơn này.")
    }
    throw conflict("Đơn hàng không ở trạng thái có thể hủy nhận.")
  }

  // Lưu trạng thái quay lại OPEN, loại trừ chi nhánh vừa hủy
  await store.saveSubcontractState(ctx, cancelResult.nextState)

  return {
    success: true,
    reopened: true,
  }
}
