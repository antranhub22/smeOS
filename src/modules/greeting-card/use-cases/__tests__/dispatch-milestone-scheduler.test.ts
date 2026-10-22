import { lockedUpdate } from "./locked-state-store"
import { describe, expect, it, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import {
  processDispatchMilestones,
  type ActiveSubcontractJob,
} from "../dispatch-milestone-scheduler"
import type { IDispatchNotifier, ISubcontractStateStore } from "../dispatch-subcontract-order"
import type { BranchCandidate } from "../../domain/chain-dispatch-engine"

const ctx: TenantContext = {
  organizationId: "org-1",
  workspaceId: "",
  userId: "user-1",
  branchId: null,
  capabilities: new Set(),
}

describe("dispatch-milestone-scheduler", () => {
  const branches: BranchCandidate[] = [
    {
      branchId: "branch-q1",
      branchName: "Chi nhánh Quận 1",
      qualityScore: 90,
      activeJobsCount: 1,
      maxConcurrentJobs: 10,
      isActive: true,
      channels: { telegramChatId: "999" },
    },
  ]

  it("tự động commit đơn khi hết thời gian Grace Period và bắn tin bắt đầu chế tác", async () => {
    const mockStore: ISubcontractStateStore = {
      updateSubcontractState: lockedUpdate(() => mockStore),
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }

    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const job: ActiveSubcontractJob = {
      orderId: "order-1",
      orderCode: "DH-100",
      deliveryTime: "15:00 20/10/2026",
      deliveryTimeMs: new Date("2026-10-20T15:00:00Z").getTime(),
      hasQcPhoto: false,
      isDelivered: false,
      isDispatched: false,
      shopSettings: {},
      sentAlerts: [],
      state: {
        orderId: "order-1",
        orderCode: "DH-100",
        dispatchStatus: "CLAIMED_GRACE",
        currentRound: 1,
        claimedBranchId: "branch-q1",
        claimedBranchName: "Chi nhánh Quận 1",
        claimedAt: new Date("2026-10-20T10:00:00Z").toISOString(),
        graceExpiresAt: new Date("2026-10-20T10:05:00Z").toISOString(), // Hết hạn lúc 10:05
        declinedBranchIds: [],
        invitedBranchIds: ["branch-q1"],
        roundExpiresAt: null,
      },
    }

    // Thời gian hiện tại là 10:06 (đã quá 10:05)
    const result = await processDispatchMilestones(
      ctx,
      [job],
      branches,
      mockStore,
      mockNotifier,
      new Date("2026-10-20T10:06:00Z")
    )

    expect(result.committedCount).toBe(1)
    expect(result.remindersSent).toBe(1) // Tin nhắn bắt đầu làm
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ dispatchStatus: "COMMITTED" })
    )
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        messageText: expect.stringContaining("BẮT ĐẦU CHẾ TÁC"),
      })
    )
  })

  it("bắn tin nhắc QC khi gần giờ giao (trong ngưỡng 45 phút) mà chưa có ảnh", async () => {
    const mockStore: ISubcontractStateStore = {
      updateSubcontractState: lockedUpdate(() => mockStore),
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }

    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const deliveryTime = new Date("2026-10-20T15:00:00Z")
    const job: ActiveSubcontractJob = {
      orderId: "order-2",
      orderCode: "DH-200",
      deliveryTime: "15:00 20/10/2026",
      deliveryTimeMs: deliveryTime.getTime(),
      hasQcPhoto: false, // Chưa chụp ảnh
      isDelivered: false,
      isDispatched: false,
      shopSettings: {
        chain_dispatch_policy: {
          milestone_reminders: { qc_reminder_minutes_before: 45 },
        },
      },
      sentAlerts: [],
      state: {
        orderId: "order-2",
        orderCode: "DH-200",
        dispatchStatus: "COMMITTED",
        currentRound: 1,
        claimedBranchId: "branch-q1",
        claimedBranchName: "Chi nhánh Quận 1",
        claimedAt: null,
        graceExpiresAt: null,
        declinedBranchIds: [],
        invitedBranchIds: ["branch-q1"],
        roundExpiresAt: null,
      },
    }

    // Lúc 14:20 (còn 40 phút nữa giao -> dưới 45 phút)
    const result = await processDispatchMilestones(
      ctx,
      [job],
      branches,
      mockStore,
      mockNotifier,
      new Date("2026-10-20T14:20:00Z")
    )

    expect(result.remindersSent).toBe(1)
    expect(job.sentAlerts).toContain("QC")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        messageText: expect.stringContaining("NHẮC CHỤP ẢNH QC"),
      })
    )
  })

  it("chuyển sang ESCALATED cho Điều phối khi đơn OPEN hết hạn các vòng bắn", async () => {
    const mockStore: ISubcontractStateStore = {
      updateSubcontractState: lockedUpdate(() => mockStore),
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }

    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const job: ActiveSubcontractJob = {
      orderId: "order-3",
      orderCode: "DH-300",
      deliveryTime: "15:00 20/10/2026",
      deliveryTimeMs: new Date("2026-10-20T15:00:00Z").getTime(),
      hasQcPhoto: false,
      isDelivered: false,
      isDispatched: false,
      shopSettings: {
        chain_dispatch_policy: { max_rounds: 3 },
      },
      sentAlerts: [],
      state: {
        orderId: "order-3",
        orderCode: "DH-300",
        dispatchStatus: "OPEN",
        currentRound: 3, // Vòng 3 là vòng cuối!
        claimedBranchId: null,
        claimedBranchName: null,
        claimedAt: null,
        graceExpiresAt: null,
        declinedBranchIds: ["b1", "b2"],
        invitedBranchIds: ["b3"],
        roundExpiresAt: new Date("2026-10-20T10:00:00Z").toISOString(), // Hết hạn lúc 10:00
      },
    }

    // Hiện tại là 10:01
    const result = await processDispatchMilestones(
      ctx,
      [job],
      branches,
      mockStore,
      mockNotifier,
      new Date("2026-10-20T10:01:00Z")
    )

    expect(result.escalatedCount).toBe(1)
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ dispatchStatus: "ESCALATED" })
    )
  })
})
