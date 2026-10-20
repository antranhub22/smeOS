import { describe, expect, it, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import { processOrderDispatchReminders } from "../process-dispatch-reminders"
import type { IDispatchNotifier, ISubcontractStateStore } from "../dispatch-subcontract-order"
import type { BranchCandidate } from "../../domain/chain-dispatch-engine"

const ctx: TenantContext = {
  organizationId: "org-test-1",
  workspaceId: "",
  userId: "cron-test",
  branchId: null,
  capabilities: new Set(),
}

describe("processOrderDispatchReminders — Leo thang giám sát QC ảnh", () => {
  const branch: BranchCandidate = {
    branchId: "CN-HOANKIEM",
    branchName: "Chi nhánh Hoàn Kiếm",
    qualityScore: 95,
    activeJobsCount: 1,
    maxConcurrentJobs: 5,
    isActive: true,
    channels: {
      phone: "0977234567",
      telegramChatId: "-1003889928264",
    },
  }

  it("Lần 1 (M2_QC): Gửi nhắc chụp ảnh QC kèm nút tải ảnh khi chưa có ảnh", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const now = new Date("2026-10-20T10:00:00Z")
    const deliveryMs = new Date("2026-10-20T10:35:00Z").getTime() // Còn 35 phút (trong ngưỡng 45p)

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:35",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: false,
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: { M1_PREP: "2026-10-20T08:00:00Z" },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M2_QC")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        actions: expect.arrayContaining([
          expect.objectContaining({ text: "📸 Chụp & Tải ảnh thành phẩm" }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M2_QC: expect.any(String) }),
      })
    )
  })

  it("Không gửi nhắc QC nếu cửa hàng ĐÃ CÓ ẢNH THÀNH PHẨM (hasQcPhoto: true)", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const now = new Date("2026-10-20T10:00:00Z")
    const deliveryMs = new Date("2026-10-20T10:35:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:35",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true, // ĐÃ CÓ ẢNH
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: { M1_PREP: "2026-10-20T08:00:00Z" },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(0)
    expect(mockNotifier.sendSubcontractInvite).not.toHaveBeenCalled()
  })

  it("Lần 2 (M2_QC_RETRY): Nhắc giục khẩn cấp sau 5 phút nếu chưa có ảnh", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    // Lần 1 gửi lúc 10:00:00Z
    // Hiện tại 10:06:00Z (đã qua 6 phút >= 5 phút retry interval)
    const now = new Date("2026-10-20T10:06:00Z")
    const deliveryMs = new Date("2026-10-20T10:35:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:35",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: false, // VẪN CHƯA CÓ ẢNH (DÙ CÓ CHAT TEXT HAY KHÔNG)
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M2_QC: "2026-10-20T10:00:00Z", // Đã gửi lần 1 cách đây 6 phút
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M2_QC_RETRY")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        messageText: expect.stringContaining("NHẮC LẦN 2"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: expect.stringContaining("TẢI ẢNH THÀNH PHẨM NGAY (LẦN 2)") }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M2_QC_RETRY: expect.any(String) }),
      })
    )
  })

  it("Báo động Điều phối (M2_QC_ESCALATED): Sau Lần 2 5 phút vẫn chưa có ảnh -> Cảnh báo Điều phối kèm nút gọi Hotline", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    // Lần 2 gửi lúc 10:06:00Z
    // Hiện tại 10:12:00Z (đã qua 6 phút >= 5 phút escalate)
    const now = new Date("2026-10-20T10:12:00Z")
    const deliveryMs = new Date("2026-10-20T10:35:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:35",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: false, // VẪN CHƯA CÓ ẢNH
        coordinatorChannel: {
          telegramChatId: "-100999888777",
          phone: "0909123456",
        },
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M2_QC: "2026-10-20T10:00:00Z",
            M2_QC_RETRY: "2026-10-20T10:06:00Z", // Đã gửi lần 2 cách đây 6 phút
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M2_QC_ESCALATED")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("BÁO ĐỘNG ĐIỀU PHỐI"),
        messageText: expect.stringContaining("CHƯA CÓ ẢNH THÀNH PHẨM"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: expect.stringContaining("Gọi cửa hàng: 0977234567") }),
          expect.objectContaining({ text: "🔍 Xem chi tiết đơn" }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M2_QC_ESCALATED: expect.any(String) }),
      })
    )
  })
})

describe("processOrderDispatchReminders — Nhắc cung cấp thông tin Shipper (M3)", () => {
  const branch: BranchCandidate = {
    branchId: "CN-HOANKIEM",
    branchName: "Chi nhánh Hoàn Kiếm",
    qualityScore: 95,
    activeJobsCount: 1,
    maxConcurrentJobs: 5,
    isActive: true,
    channels: {
      phone: "0977234567",
      telegramChatId: "-1003889928264",
    },
  }

  it("Lần 1 (M3_SHIPPER): Gửi nhắc cung cấp thông tin shipper trước giờ giao N phút khi chưa có shipper", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const now = new Date("2026-10-20T10:00:00Z")
    const deliveryMs = new Date("2026-10-20T10:25:00Z").getTime() // Còn 25 phút (trong ngưỡng 30p)

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:25",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true, // Ảnh QC đã xong
        hasShipperInfo: false, // Chưa có shipper
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M2_QC: "2026-10-20T09:40:00Z",
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M3_SHIPPER")
    expect(results[0]?.sent).toBe(true)
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("YÊU CẦU SHIPPER"),
        messageText: expect.stringContaining("Vui lòng cung cấp Họ tên & SĐT Shipper"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: "🛵 Nhập Thông Tin Shipper" }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M3_SHIPPER: expect.any(String) }),
      })
    )
  })

  it("Không gửi nhắc shipper nếu cửa hàng ĐÃ CÓ THÔNG TIN SHIPPER (hasShipperInfo: true)", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const now = new Date("2026-10-20T10:00:00Z")
    const deliveryMs = new Date("2026-10-20T10:25:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:25",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true,
        hasShipperInfo: true, // ĐÃ CÓ THÔNG TIN SHIPPER
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    const shipperSteps = results.filter((r) =>
      r.step === "M3_SHIPPER" || r.step === "M3_SHIPPER_RETRY" || r.step === "M3_SHIPPER_ESCALATED"
    )
    expect(shipperSteps).toHaveLength(0)
    expect(mockNotifier.sendSubcontractInvite).not.toHaveBeenCalled()
  })

  it("Lần 2 (M3_SHIPPER_RETRY): Nhắc giục khẩn cấp sau 5 phút nếu chưa có shipper", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    // Lần 1 gửi lúc 10:00:00Z, hiện tại 10:05:30Z (đã qua 5 phút)
    const now = new Date("2026-10-20T10:05:30Z")
    const deliveryMs = new Date("2026-10-20T10:25:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:25",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true,
        hasShipperInfo: false,
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M3_SHIPPER: "2026-10-20T10:00:00Z", // Đã gửi lần 1 cách đây 5.5 phút
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M3_SHIPPER_RETRY")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("NHẮC LẦN 2 - KHẨN CẤP"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: "🚨 NHẬP THÔNG TIN SHIPPER NGAY (LẦN 2)" }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M3_SHIPPER_RETRY: expect.any(String) }),
      })
    )
  })

  it("Báo động đỏ Điều phối (M3_SHIPPER_ESCALATED): Sau Lần 2 5 phút vẫn chưa có shipper -> Cảnh báo đỏ Điều phối kèm hotline gọi trực tiếp", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    // Lần 2 gửi lúc 10:05:00Z, hiện tại 10:11:00Z (đã qua 6 phút)
    const now = new Date("2026-10-20T10:11:00Z")
    const deliveryMs = new Date("2026-10-20T10:25:00Z").getTime()

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:25",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true,
        hasShipperInfo: false,
        coordinatorChannel: {
          telegramChatId: "-100999888777",
          phone: "0909123456",
        },
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M3_SHIPPER: "2026-10-20T10:00:00Z",
            M3_SHIPPER_RETRY: "2026-10-20T10:05:00Z", // Đã gửi lần 2 cách đây 6 phút
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M3_SHIPPER_ESCALATED")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("CẢNH BÁO ĐỎ - THIẾU SHIPPER"),
        messageText: expect.stringContaining("CHƯA CUNG CẤP SHIPPER"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: expect.stringContaining("Gọi cửa hàng: 0977234567") }),
          expect.objectContaining({ text: expect.stringContaining("Xem chi tiết đơn") }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M3_SHIPPER_ESCALATED: expect.any(String) }),
      })
    )
  })

  it("Mốc M4 Giao hàng (M4_DELIVERY): Đến/quá giờ hẹn giao mà chưa có ảnh POD -> Nhắc lần 1 tải ảnh giao hàng", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    // Giờ giao: 10:30:00Z, Hiện tại: 10:31:00Z (đã qua giờ giao 1 phút)
    const deliveryMs = new Date("2026-10-20T10:30:00Z").getTime()
    const now = new Date("2026-10-20T10:31:00Z")

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:30",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true,
        hasShipperInfo: true,
        hasDeliveryProof: false,
        deliveryStatus: "DELIVERING",
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M3_SHIPPER: "2026-10-20T10:00:00Z",
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M4_DELIVERY")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("NHẮC BÀN GIAO & POD"),
        messageText: expect.stringContaining("tải ảnh xác nhận giao hàng (POD)"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: "📸 Tải Ảnh Giao Hàng (POD)" }),
        ]),
      })
    )
    expect(mockStore.saveSubcontractState).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        remindersSent: expect.objectContaining({ M4_DELIVERY: expect.any(String) }),
      })
    )
  })

  it("Mốc M4 Giao hàng (M4_DELIVERY_ESCALATION): Quá hạn 2 lần nhắc chưa có ảnh POD -> Cảnh báo đỏ Điều phối", async () => {
    const mockStore: ISubcontractStateStore = {
      saveSubcontractState: vi.fn().mockResolvedValue(undefined),
      loadSubcontractState: vi.fn().mockResolvedValue(null),
    }
    const mockNotifier: IDispatchNotifier = {
      sendSubcontractInvite: vi.fn().mockResolvedValue({ sent: true }),
    }

    const deliveryMs = new Date("2026-10-20T10:30:00Z").getTime()
    // Lần 2 đã gửi lúc 10:36:00Z, hiện tại 10:42:00Z (qua 6 phút >= 5 phút)
    const now = new Date("2026-10-20T10:42:00Z")

    const results = await processOrderDispatchReminders(
      ctx,
      {
        orderId: "order-1",
        orderCode: "DH-100",
        deliveryTimeStr: "10:30",
        deliveryTimestampMs: deliveryMs,
        hasQcPhoto: true,
        hasShipperInfo: true,
        hasDeliveryProof: false,
        deliveryStatus: "DELIVERING",
        state: {
          orderId: "order-1",
          orderCode: "DH-100",
          dispatchStatus: "COMMITTED",
          currentRound: 1,
          claimedBranchId: "CN-HOANKIEM",
          claimedBranchName: "Chi nhánh Hoàn Kiếm",
          claimedAt: "2026-10-20T08:00:00Z",
          graceExpiresAt: null,
          roundExpiresAt: null,
          declinedBranchIds: [],
          invitedBranchIds: ["CN-HOANKIEM"],
          remindersSent: {
            M1_PREP: "2026-10-20T08:00:00Z",
            M4_DELIVERY: "2026-10-20T10:31:00Z",
            M4_DELIVERY_RETRY: "2026-10-20T10:36:00Z",
            M4_OVERDUE: "2026-10-20T10:36:00Z",
          },
        },
        branch,
        shopSettings: {},
      },
      mockStore,
      mockNotifier,
      now
    )

    expect(results).toHaveLength(1)
    expect(results[0]?.step).toBe("M4_DELIVERY_ESCALATION")
    expect(mockNotifier.sendSubcontractInvite).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: expect.stringContaining("CẢNH BÁO ĐỎ - CHƯA GIAO HÀNG"),
        messageText: expect.stringContaining("đã quá hạn giao nhưng chưa có ảnh xác nhận"),
        actions: expect.arrayContaining([
          expect.objectContaining({ text: "📞 Gọi Cửa Hàng Ngay" }),
        ]),
      })
    )
  })
})

