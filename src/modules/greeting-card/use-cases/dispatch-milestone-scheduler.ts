/**
 * dispatch-milestone-scheduler.ts
 *
 * Use-case: Bộ Quét & Nhắc Việc Tự Động Theo Mốc Tiến Độ (Automated Milestone Scheduler).
 * Tự động hóa 100%: Tự động chốt khi hết Grace Period, tự động bắn vòng tiếp theo khi hết hạn nhận,
 * và tự động nhắc việc qua Bot đa kênh (Telegram/Zalo/Messenger).
 */

import type { TenantContext } from "@/core/tenancy"
import {
  parseChainDispatchPolicy,
  renderDispatchMessage,
  type ChainDispatchPolicy,
} from "../domain/chain-dispatch-policy"
import {
  commitSubcontractOrder,
  type SubcontractOrderState,
} from "../domain/subcontract-order"
import type { IDispatchNotifier, ISubcontractStateStore } from "./dispatch-subcontract-order"
import type { BranchCandidate } from "../domain/chain-dispatch-engine"

export interface ActiveSubcontractJob {
  orderId: string
  orderCode: string
  deliveryTime: string // ISO string hoặc HH:mm YYYY-MM-DD
  deliveryTimeMs: number
  hasQcPhoto: boolean
  isDelivered: boolean
  isDispatched: boolean
  shopSettings: unknown
  state: SubcontractOrderState
  sentAlerts: string[] // Danh sách các mã alert đã gửi để tránh spam trùng lặp: 'PREP', 'QC', 'DISPATCH', 'OVERDUE'
}

export interface MilestoneSweepResult {
  committedCount: number
  remindersSent: number
  escalatedCount: number
  reDispatchedCount: number
}

/**
 * Quét danh sách các đơn hàng gia công đang hoạt động và kích hoạt các hành động tự động theo mốc thời gian.
 */
export async function processDispatchMilestones(
  ctx: TenantContext,
  jobs: ActiveSubcontractJob[],
  branches: BranchCandidate[],
  store: ISubcontractStateStore,
  notifier: IDispatchNotifier,
  now = new Date()
): Promise<MilestoneSweepResult> {
  let committedCount = 0
  let remindersSent = 0
  let escalatedCount = 0
  let reDispatchedCount = 0

  const nowMs = now.getTime()

  for (const job of jobs) {
    const policy: ChainDispatchPolicy = parseChainDispatchPolicy(job.shopSettings)
    const state = job.state
    const branch = branches.find((b) => b.branchId === state.claimedBranchId)

    // --- 1. Tự động chốt khi hết thời gian Grace Period ---
    if (state.dispatchStatus === "CLAIMED_GRACE" && state.graceExpiresAt) {
      const graceExpiresMs = new Date(state.graceExpiresAt).getTime()
      if (nowMs >= graceExpiresMs) {
        const nextState = commitSubcontractOrder(state)
        await store.saveSubcontractState(ctx, nextState)
        committedCount++

        // Gửi tin nhắn bắt đầu chế tác nếu bật cấu hình
        if (policy.milestoneReminders.enabled && policy.milestoneReminders.prepAlert && branch) {
          const prepMsg = renderDispatchMessage(policy.messageTemplates.prepReminder, {
            orderCode: job.orderCode,
            branchName: branch.branchName,
          })
          await notifier.sendSubcontractInvite(ctx, {
            branch,
            orderCode: job.orderCode,
            messageText: prepMsg,
            claimUrl: "",
          })
          remindersSent++
        }
      }
    }

    // --- 2. Xử lý khi đơn OPEN nhưng hết hạn vòng nhận đơn ---
    if (state.dispatchStatus === "OPEN" && state.roundExpiresAt) {
      const roundExpiresMs = new Date(state.roundExpiresAt).getTime()
      if (nowMs >= roundExpiresMs) {
        if (state.currentRound >= policy.maxRounds) {
          // Đã hết số vòng cho phép -> Chuyển sang ESCALATED để Điều phối can thiệp
          await store.saveSubcontractState(ctx, {
            ...state,
            dispatchStatus: "ESCALATED",
          })
          escalatedCount++
        } else {
          // Còn vòng tiếp theo -> Cần re-dispatch
          reDispatchedCount++
        }
      }
    }

    // --- 3. Nhắc chụp ảnh QC và nhắc Shipper (chỉ khi đơn đã COMMITTED) ---
    if (state.dispatchStatus === "COMMITTED" && branch && policy.milestoneReminders.enabled) {
      const msUntilDelivery = job.deliveryTimeMs - nowMs
      const minutesUntilDelivery = Math.floor(msUntilDelivery / (60 * 1000))

      // 3.1 Nhắc chụp ảnh QC trước giờ giao
      const qcThreshold = policy.milestoneReminders.qcReminderMinutesBefore
      if (
        !job.hasQcPhoto &&
        minutesUntilDelivery <= qcThreshold &&
        minutesUntilDelivery > 0 &&
        !job.sentAlerts.includes("QC")
      ) {
        const qcMsg = renderDispatchMessage(policy.messageTemplates.qcReminder, {
          orderCode: job.orderCode,
          deliveryTime: job.deliveryTime,
          qcTime: `${qcThreshold} phút trước giờ giao`,
          branchName: branch.branchName,
        })

        await notifier.sendSubcontractInvite(ctx, {
          branch,
          orderCode: job.orderCode,
          messageText: qcMsg,
          claimUrl: "",
        })
        job.sentAlerts.push("QC")
        remindersSent++
      }

      // 3.2 Nhắc giao Shipper trước giờ giao
      const dispatchThreshold = policy.milestoneReminders.dispatchReminderMinutesBefore
      if (
        !job.isDispatched &&
        !job.isDelivered &&
        minutesUntilDelivery <= dispatchThreshold &&
        minutesUntilDelivery > 0 &&
        !job.sentAlerts.includes("DISPATCH")
      ) {
        const dispatchMsg = renderDispatchMessage(policy.messageTemplates.dispatchReminder, {
          orderCode: job.orderCode,
          deliveryTime: job.deliveryTime,
          branchName: branch.branchName,
        })

        await notifier.sendSubcontractInvite(ctx, {
          branch,
          orderCode: job.orderCode,
          messageText: dispatchMsg,
          claimUrl: "",
        })
        job.sentAlerts.push("DISPATCH")
        remindersSent++
      }

      // 3.3 Cảnh báo trễ hạn SLA
      const overdueThresholdMs = policy.milestoneReminders.overdueWarningMinutes * 60 * 1000
      if (
        !job.isDelivered &&
        nowMs > job.deliveryTimeMs + overdueThresholdMs &&
        !job.sentAlerts.includes("OVERDUE")
      ) {
        const overdueMinutes = Math.floor((nowMs - job.deliveryTimeMs) / (60 * 1000))
        const alertMsg = renderDispatchMessage(policy.messageTemplates.overdueAlert, {
          orderCode: job.orderCode,
          overdueMinutes,
          branchName: branch.branchName,
        })

        await notifier.sendSubcontractInvite(ctx, {
          branch,
          orderCode: job.orderCode,
          messageText: alertMsg,
          claimUrl: "",
        })
        job.sentAlerts.push("OVERDUE")
        remindersSent++
      }
    }
  }

  return {
    committedCount,
    remindersSent,
    escalatedCount,
    reDispatchedCount,
  }
}
