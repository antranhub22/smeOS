/**
 * handle-subcontract-claim.ts
 *
 * Use-case: Tiếp nhận hoặc Hủy nhận Thẻ Gia Công (Claim / Cancel Subcontract Order).
 * Clean Architecture — Đảm bảo khóa đồng thời 1-chạm và tự động bắn lại khi hủy trong hạn.
 */

import { publicAppUrl } from "@/lib/public-url"
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
import type { IDispatchNotifier, ISubcontractClaimStore, ISubcontractStateStore } from "./dispatch-subcontract-order"
import type { BranchCandidate } from "../domain/chain-dispatch-engine"
import { subcontractBranchUrl } from "@/modules/greeting-card/infra/subcontract-link-token"
import { closeCardsAfterClaim, reopenCardsAfterCancel } from "./invite-cards"

export interface ClaimSubcontractInput {
  orderId: string
  branchId: string
  branchName: string
  shopSettings: unknown
  baseUrl?: string | undefined
  productImageUrl?: string | null | undefined
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
  store: ISubcontractClaimStore,
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
    if (claimResult.reason === "NOT_INVITED") {
      throw unprocessable("Lời mời nhận đơn này không còn dành cho chi nhánh của bạn.")
    }
    throw conflict("Đơn hàng hiện không ở trạng thái sẵn sàng để nhận.")
  }

  // Thẻ tiến độ của đơn = thẻ mời đã gửi cho chính chi nhánh nhận (không phải thẻ của chi nhánh khác)
  const ownCard = state.inviteCards?.[input.branchId]
  if (state.inviteCards) {
    claimResult.nextState.telegramMsgId = ownCard?.msgId ?? null
    claimResult.nextState.telegramChatId = ownCard?.chatId ?? null
    claimResult.nextState.isCaption = ownCard?.isCaption ?? false
  }

  // 1. Lưu trạng thái mới (CLAIMED_GRACE) — chỉ thắng nếu đơn vẫn OPEN lúc ghi
  const won = await store.saveSubcontractStateIfStatus(ctx, claimResult.nextState, "OPEN")
  if (!won) {
    throw conflict(`Đơn hàng này đã được một chi nhánh khác tiếp nhận trước đó. Cảm ơn bạn!`)
  }

  // Thẻ mời của các chi nhánh khác: báo đã có chi nhánh nhận, gỡ nút
  await closeCardsAfterClaim(ctx, claimResult.nextState, input.branchId, notifier)

  // 2. Bắn tin nhắn xác nhận tiếp nhận thành công cho chi nhánh vừa nhận
  const claimingBranch = branches.find((b) => b.branchId === input.branchId)
  if (claimingBranch) {
    const successMsg = renderDispatchMessage(policy.messageTemplates.claimSuccess, {
      orderCode: state.orderCode,
      branchName: input.branchName,
      graceMinutes: policy.cancellationGraceMinutes,
    })

    const claimUrl = subcontractBranchUrl({
      baseUrl: input.baseUrl || publicAppUrl(),
      organizationId: ctx.organizationId,
      orderCode: state.orderCode,
      branchId: claimingBranch.branchId,
    })

    // Truyền existingTelegramCard nếu đã có thẻ từ lần gửi trước (grace period re-use)
    const existingCard =
      claimResult.nextState.telegramMsgId && claimResult.nextState.telegramChatId
        ? {
            msgId: claimResult.nextState.telegramMsgId,
            chatId: claimResult.nextState.telegramChatId,
            isCaption: claimResult.nextState.isCaption ?? false,
          }
        : null

    const notifyRes = await notifier.sendSubcontractInvite(ctx, {
      branch: claimingBranch,
      orderCode: state.orderCode,
      messageText: successMsg,
      claimUrl,
      title: `🔔 [BẮT ĐẦU CHẾ TÁC #${state.orderCode}]`,
      actions: [{ text: "🔍 Xem Thẻ Chế Tác", url: claimUrl }],
      imageUrl: input.productImageUrl,
      existingTelegramCard: existingCard,
    })

    // Lưu telegramMsgId vào state nếu đây là lần gửi đầu tiên (card mới tạo)
    if (notifyRes.sent && notifyRes.telegramMsgId) {
      const stateWithCard: SubcontractOrderState = {
        ...claimResult.nextState,
        telegramMsgId: notifyRes.telegramMsgId,
        telegramChatId: notifyRes.telegramChatId ?? null,
        isCaption: notifyRes.isCaption ?? false,
      }
      await store.saveSubcontractState(ctx, stateWithCard)
    }
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
  now = new Date(),
  notifier?: IDispatchNotifier
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

  // Lưu trạng thái quay lại OPEN, loại trừ chi nhánh vừa hủy. Thẻ tiến độ cũ thuộc chi nhánh vừa huỷ → bỏ.
  const reopened: SubcontractOrderState = state.inviteCards
    ? { ...cancelResult.nextState, telegramMsgId: null, telegramChatId: null, isCaption: false }
    : cancelResult.nextState
  await store.saveSubcontractState(ctx, reopened)

  if (notifier) {
    const ownCard = state.inviteCards?.[input.branchId]
    if (ownCard && notifier.editInviteCard) {
      await notifier.editInviteCard(ctx, ownCard, `<b>↩️ [ĐÃ HUỶ NHẬN ĐƠN #${state.orderCode}]</b>\n\nChi nhánh đã huỷ nhận đơn #${state.orderCode}. Đơn được mở lại cho chi nhánh khác.`, [])
    }
    // Thẻ của các chi nhánh còn lại trong vòng: trở về lời mời có nút "Nhận đơn ngay"
    await reopenCardsAfterCancel(ctx, reopened, input.branchId, notifier)
  }

  return {
    success: true,
    reopened: true,
  }
}
