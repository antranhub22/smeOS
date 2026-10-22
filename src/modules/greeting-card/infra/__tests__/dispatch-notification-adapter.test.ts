import { describe, expect, it } from "vitest"

import { MultiChannelDispatchNotifier } from "../dispatch-notification-adapter"

const ctx = { organizationId: "org-1", workspaceId: "ws", userId: "u", branchId: null, capabilities: new Set<string>() }
const branch = { branchId: "b-1", branchName: "Chi nhánh 1", qualityScore: 90, activeJobsCount: 0, maxConcurrentJobs: 5, isActive: true }

/** Trước đây trả `sent: true` dù không gửi được gì — mốc nhắc bị đánh dấu đã gửi (rà soát M4). */
describe("MultiChannelDispatchNotifier", () => {
  it("chi nhánh không có kênh nào: báo CHƯA gửi", async () => {
    const res = await new MultiChannelDispatchNotifier().sendSubcontractInvite(ctx, {
      branch: { ...branch, channels: {} },
      orderCode: "DH261021-0001",
      messageText: "Đơn mới",
      claimUrl: "",
    })
    expect(res.sent).toBe(false)
  })
})
