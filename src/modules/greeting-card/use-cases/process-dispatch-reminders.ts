/**
 * process-dispatch-reminders.ts
 *
 * Use-case: Đánh giá và Gửi tin nhắn nhắc việc theo mốc tiến độ (M1 Chế tác, M2 QC, M3 Bàn giao Shipper, M4 Quá hạn).
 * Clean Architecture — Pure Logic kết hợp với IDispatchNotifier & ISubcontractStateStore.
 */

import type { TenantContext } from "@/core/tenancy"
import {
  parseChainDispatchPolicy,
  renderDispatchMessage,
  type ChainDispatchPolicy,
} from "../domain/chain-dispatch-policy"
import type { SubcontractOrderState } from "../domain/subcontract-order"
import type { BranchCandidate } from "../domain/chain-dispatch-engine"
import type { IDispatchNotifier, ISubcontractStateStore } from "./dispatch-subcontract-order"
import { evaluateShipperMilestones } from "./dispatch-shipper-reminders"

export type ReminderStep =
  | "M1_PREP"
  | "M2_QC"
  | "M2_QC_RETRY"
  | "M2_QC_ESCALATED"
  | "M3_SHIPPER"
  | "M3_SHIPPER_RETRY"
  | "M3_SHIPPER_ESCALATED"
  | "M3_DISPATCH"
  | "M4_OVERDUE"

export interface ProcessOrderReminderInput {
  orderId: string
  orderCode: string
  deliveryTimeStr: string
  deliveryDateStr?: string | null | undefined
  deliveryTimestampMs: number // Timestamp thời hạn giao hàng (UTC/Epoch ms)
  state: SubcontractOrderState
  branch: BranchCandidate
  shopSettings: unknown
  hasQcPhoto?: boolean | undefined
  hasShipperInfo?: boolean | undefined
  coordinatorChannel?: { phone?: string; telegramChatId?: string } | undefined
  baseUrl?: string | undefined
  forceStep?: ReminderStep | undefined
}

export interface ReminderStepExecutionResult {
  step: ReminderStep
  triggered: boolean
  sent: boolean
  message?: string | undefined
}

/**
 * Xử lý đánh giá và phát các tin nhắn nhắc việc theo mốc tiến độ kèm leo thang giám sát QC ảnh.
 * Chống gửi trùng thông qua trường remindersSent trong state.
 */
export async function processOrderDispatchReminders(
  ctx: TenantContext,
  input: ProcessOrderReminderInput,
  store: ISubcontractStateStore,
  notifier: IDispatchNotifier,
  now = new Date()
): Promise<ReminderStepExecutionResult[]> {
  const policy: ChainDispatchPolicy = parseChainDispatchPolicy(input.shopSettings)
  const state = input.state
  const branch = input.branch

  // Chỉ nhắc việc khi đơn đã ở trạng thái chính thức: COMMITTED hoặc CLAIMED_GRACE
  if (state.dispatchStatus !== "COMMITTED" && state.dispatchStatus !== "CLAIMED_GRACE") {
    return []
  }

  const results: ReminderStepExecutionResult[] = []
  const remindersSent: Record<string, string> = { ...(state.remindersSent ?? {}) }
  const nowMs = now.getTime()
  const deliveryMs = input.deliveryTimestampMs
  const minutesUntilDelivery = Math.round((deliveryMs - nowMs) / (60 * 1000))

  // Telegram Bot API bắt buộc inline_keyboard URL phải là https:// hợp lệ
  const base = input.baseUrl?.startsWith("https://") ? input.baseUrl : "https://app.smeos.vn"
  const claimUrl = `${base}/subcontract/${input.orderCode}?branch=${encodeURIComponent(branch.branchId)}`
  const uploadQcUrl = `${claimUrl}&action=upload_qc`
  const submitShipperUrl = `${claimUrl}&action=submit_shipper`

  // 1. Mốc M1: Nhắc bắt đầu chế tác (ngay khi đơn chốt COMMITTED)
  const isPrepDue = input.forceStep
    ? input.forceStep === "M1_PREP"
    : Boolean(policy.milestoneReminders.prepAlert && state.dispatchStatus === "COMMITTED")
  if (isPrepDue && !remindersSent["M1_PREP"]) {
    const text = renderDispatchMessage(policy.messageTemplates.prepReminder, {
      orderCode: input.orderCode,
      branchName: branch.branchName,
      deliveryTime: input.deliveryTimeStr,
      claimUrl,
    })

    const sendRes = await notifier.sendSubcontractInvite(ctx, {
      branch,
      orderCode: input.orderCode,
      messageText: text,
      claimUrl,
      title: `🔔 [BẮT ĐẦU CHẾ TÁC #${input.orderCode}]`,
      actions: [{ text: "📋 Xem Thẻ Gia Công", url: claimUrl }],
    })

    if (sendRes.sent) {
      remindersSent["M1_PREP"] = now.toISOString()
      results.push({ step: "M1_PREP", triggered: true, sent: true, message: text })
    }
  }

  // 2. Mốc M2: Nhắc chụp ảnh QC lần 1 (trước giờ giao X phút)
  const qcThresholdMinutes = policy.milestoneReminders.qcReminderMinutesBefore
  const isQcDue = input.forceStep
    ? input.forceStep === "M2_QC"
    : (qcThresholdMinutes > 0 &&
      minutesUntilDelivery <= qcThresholdMinutes &&
      minutesUntilDelivery > 0)
  if (isQcDue && !remindersSent["M2_QC"] && !input.hasQcPhoto) {
    const text = renderDispatchMessage(policy.messageTemplates.qcReminder, {
      orderCode: input.orderCode,
      branchName: branch.branchName,
      deliveryTime: input.deliveryTimeStr,
      qcTime: `${qcThresholdMinutes} phút trước giờ giao`,
      claimUrl,
    })

    const sendRes = await notifier.sendSubcontractInvite(ctx, {
      branch,
      orderCode: input.orderCode,
      messageText: text,
      claimUrl,
      title: `📸 [NHẮC CHỤP ẢNH THÀNH PHẨM #${input.orderCode}]`,
      actions: [{ text: "📸 Chụp & Tải ảnh thành phẩm", url: uploadQcUrl }],
    })

    if (sendRes.sent) {
      remindersSent["M2_QC"] = now.toISOString()
      results.push({ step: "M2_QC", triggered: true, sent: true, message: text })
    }
  }

  // 2b. Mốc M2_QC_RETRY: Nhắc chụp ảnh QC lần 2 (Sau N phút nếu cửa hàng chưa gửi ảnh)
  const m2SentIso = remindersSent["M2_QC"]
  const m2RetrySentIso = remindersSent["M2_QC_RETRY"]
  if (m2SentIso && !m2RetrySentIso && !input.hasQcPhoto) {
    const m2SentTime = new Date(m2SentIso).getTime()
    const minutesSinceM2 = Math.round((nowMs - m2SentTime) / (60 * 1000))
    const isRetryDue = input.forceStep
      ? input.forceStep === "M2_QC_RETRY"
      : minutesSinceM2 >= policy.milestoneReminders.qcRetryIntervalMinutes

    if (isRetryDue) {
      const text = renderDispatchMessage(policy.messageTemplates.qcReminderSecond, {
        orderCode: input.orderCode,
        branchName: branch.branchName,
        deliveryTime: input.deliveryTimeStr,
        claimUrl,
      })

      const sendRes = await notifier.sendSubcontractInvite(ctx, {
        branch,
        orderCode: input.orderCode,
        messageText: text,
        claimUrl,
        title: `⚠️ [NHẮC LẦN 2 - KHẨN CẤP #${input.orderCode}]`,
        actions: [{ text: "🚨 TẢI ẢNH THÀNH PHẨM NGAY (LẦN 2)", url: uploadQcUrl }],
      })

      if (sendRes.sent) {
        remindersSent["M2_QC_RETRY"] = now.toISOString()
        results.push({ step: "M2_QC_RETRY", triggered: true, sent: true, message: text })
      }
    }
  }

  // 2c. Mốc M2_QC_ESCALATED: Báo động Điều phối viên (Sau lần 2 thêm M phút nếu vẫn chưa có ảnh)
  const m2EscalatedIso = remindersSent["M2_QC_ESCALATED"]
  if (remindersSent["M2_QC_RETRY"] && !m2EscalatedIso && !input.hasQcPhoto) {
    const retrySentTime = new Date(remindersSent["M2_QC_RETRY"]).getTime()
    const minutesSinceRetry = Math.round((nowMs - retrySentTime) / (60 * 1000))
    const isEscalateDue = input.forceStep
      ? input.forceStep === "M2_QC_ESCALATED"
      : minutesSinceRetry >= policy.milestoneReminders.qcEscalateAfterMinutes

    if (isEscalateDue) {
      const branchPhone = branch.channels?.phone ?? "Chưa cấu hình SĐT"
      const text = renderDispatchMessage(policy.messageTemplates.qcEscalationAlert, {
        orderCode: input.orderCode,
        branchName: branch.branchName,
        branchPhone,
        deliveryTime: input.deliveryTimeStr,
        claimUrl,
      })

      // Gửi cảnh báo đến Điều phối (hoặc kênh chi nhánh phụ trách)
      const targetBranch: BranchCandidate = input.coordinatorChannel?.telegramChatId
        ? {
            ...branch,
            channels: {
              ...branch.channels,
              telegramChatId: input.coordinatorChannel.telegramChatId,
            },
          }
        : branch

      const escalationActions = [
        ...(branch.channels?.phone ? [{ text: `📞 Gọi cửa hàng: ${branch.channels.phone}`, url: `tel:${branch.channels.phone}` }] : []),
        { text: "🔍 Xem chi tiết đơn", url: claimUrl },
      ]

      const sendRes = await notifier.sendSubcontractInvite(ctx, {
        branch: targetBranch,
        orderCode: input.orderCode,
        messageText: text,
        claimUrl,
        title: `🚨 [BÁO ĐỘNG ĐIỀU PHỐI #${input.orderCode}]`,
        actions: escalationActions,
      })

      if (sendRes.sent) {
        remindersSent["M2_QC_ESCALATED"] = now.toISOString()
        results.push({ step: "M2_QC_ESCALATED", triggered: true, sent: true, message: text })
      }
    }
  }

  // 3. Mốc M3: Nhắc cung cấp thông tin Shipper trước giờ giao N phút (Lần 1, Lần 2, Báo động đỏ Điều phối)
  const shipperResults = await evaluateShipperMilestones({
    ctx,
    input,
    policy,
    branch,
    remindersSent,
    minutesUntilDelivery,
    submitShipperUrl,
    notifier,
    now,
  })
  results.push(...shipperResults)

  // 4. Mốc M4: Cảnh báo quá hạn (Overdue Alert)
  const overdueThreshold = policy.milestoneReminders.overdueWarningMinutes
  const isOverdueDue = input.forceStep
    ? input.forceStep === "M4_OVERDUE"
    : minutesUntilDelivery < -overdueThreshold
  if (isOverdueDue && !remindersSent["M4_OVERDUE"]) {
    const text = renderDispatchMessage(policy.messageTemplates.overdueAlert, {
      orderCode: input.orderCode,
      branchName: branch.branchName,
      overdueMinutes: Math.abs(minutesUntilDelivery),
      claimUrl,
    })

    const sendRes = await notifier.sendSubcontractInvite(ctx, {
      branch,
      orderCode: input.orderCode,
      messageText: text,
      claimUrl,
      title: `⚠️ [CẢNH BÁO TRỄ HẠN #${input.orderCode}]`,
      actions: [{ text: "🚨 Xem đơn trễ hạn", url: claimUrl }],
    })

    if (sendRes.sent) {
      remindersSent["M4_OVERDUE"] = now.toISOString()
      results.push({ step: "M4_OVERDUE", triggered: true, sent: true, message: text })
    }
  }

  // Nếu có mốc nào vừa gửi thành công, cập nhật state vào DB
  if (results.some((r) => r.sent)) {
    const nextState: SubcontractOrderState = {
      ...state,
      remindersSent,
    }
    await store.saveSubcontractState(ctx, nextState)
  }

  return results
}
