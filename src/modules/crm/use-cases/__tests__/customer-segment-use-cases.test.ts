import { describe, it, expect, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import { createCustomerSegmentUseCase } from "../create-customer-segment.use-case"
import { listCustomerSegmentsUseCase } from "../list-customer-segments.use-case"
import { getSegmentCustomersUseCase } from "../get-segment-customers.use-case"
import { recordCustomerInteractionUseCase } from "../record-customer-interaction.use-case"
import type { ICustomerSegmentRepository } from "../../domain/repositories/customer-segment-repository.interface"
import type { ICustomerInteractionRepository } from "../../domain/repositories/customer-interaction-repository.interface"
import type { ICustomerRepository } from "../../domain/repositories/customer-repository.interface"
import type { CustomerSegment } from "../../domain/customer-segment"
import type { CustomerMasterIndex } from "../../domain/customer-master-index"

const fakeCtx: TenantContext = {
  organizationId: "org-test-1",
  workspaceId: "ws-test-1",
  userId: "user-1",
  branchId: null,
  capabilities: new Set(["M4", "Q1"]),
}

describe("Customer Care Use Cases", () => {
  it("creates a customer segment", async () => {
    const mockRepo: ICustomerSegmentRepository = {
      create: vi.fn().mockResolvedValue({
        id: "seg-1",
        organizationId: "org-test-1",
        name: "Khách VIP thân thiết",
        kind: "DYNAMIC",
        rules: { tiers: ["VIP"] },
        createdBy: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const result = await createCustomerSegmentUseCase(
      fakeCtx,
      {
        name: "Khách VIP thân thiết",
        kind: "DYNAMIC",
        rules: { tiers: ["VIP"] },
      },
      mockRepo
    )

    expect(result.id).toBe("seg-1")
    expect(mockRepo.create).toHaveBeenCalledWith(
      fakeCtx,
      expect.objectContaining({ name: "Khách VIP thân thiết", createdBy: "user-1" })
    )
  })

  it("lists customer segments", async () => {
    const mockRepo: ICustomerSegmentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: "seg-1",
            organizationId: "org-test-1",
            name: "Khách VIP",
            kind: "DYNAMIC",
            rules: null,
            createdBy: "user-1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      }),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const res = await listCustomerSegmentsUseCase(fakeCtx, {}, mockRepo)
    expect(res.total).toBe(1)
    expect(res.items[0]?.name).toBe("Khách VIP")
  })

  it("evaluates and filters customers for a segment", async () => {
    const mockSegment: CustomerSegment = {
      id: "seg-vip",
      organizationId: "org-test-1",
      name: "Khách VIP Zalo",
      kind: "DYNAMIC",
      rules: {
        tiers: ["VIP"],
        requiredConsentChannel: "ZALO_ZNS",
      },
      createdBy: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockCustomers: CustomerMasterIndex[] = [
      {
        id: "cust-1",
        organizationId: "org-test-1",
        code: "KH-0001",
        name: "Khách VIP Đồng Ý Zalo",
        phone: "0901234567",
        tags: [],
        metrics: {
          tier: "VIP",
          totalSpentVnd: 15_000_000,
          orderCount: 12,
          aovVnd: 1_250_000,
        },
        preferences: { preferredFlowers: [], preferredColors: [] },
        occasions: [],
        consents: [{ channel: "ZALO_ZNS", granted: true, grantedAt: "2026-01-01" }],
        availableVouchers: [],
        updatedAt: "2026-01-01",
      },
      {
        id: "cust-2",
        organizationId: "org-test-1",
        code: "KH-0002",
        name: "Khách VIP Từ Chối Zalo",
        phone: "0901234568",
        tags: [],
        metrics: {
          tier: "VIP",
          totalSpentVnd: 20_000_000,
          orderCount: 15,
          aovVnd: 1_300_000,
        },
        preferences: { preferredFlowers: [], preferredColors: [] },
        occasions: [],
        consents: [
          {
            channel: "ZALO_ZNS",
            granted: true,
            grantedAt: "2026-01-01",
            revokedAt: "2026-02-01",
          },
        ],
        availableVouchers: [],
        updatedAt: "2026-01-01",
      },
      {
        id: "cust-3",
        organizationId: "org-test-1",
        code: "KH-0003",
        name: "Khách BRONZE",
        phone: "0901234569",
        tags: [],
        metrics: {
          tier: "BRONZE",
          totalSpentVnd: 500_000,
          orderCount: 1,
          aovVnd: 500_000,
        },
        preferences: { preferredFlowers: [], preferredColors: [] },
        occasions: [],
        consents: [{ channel: "ZALO_ZNS", granted: true, grantedAt: "2026-01-01" }],
        availableVouchers: [],
        updatedAt: "2026-01-01",
      },
    ]

    const mockSegmentRepo: ICustomerSegmentRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockSegment),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const mockCustomerRepo: ICustomerRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      findByPhone: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn().mockResolvedValue({ items: mockCustomers, total: mockCustomers.length }),
      addOccasion: vi.fn(),
      updateConsent: vi.fn(),
      syncMetricsFromOrders: vi.fn(),
    }

    const result = await getSegmentCustomersUseCase(
      fakeCtx,
      { segmentId: "seg-vip" },
      mockSegmentRepo,
      mockCustomerRepo
    )

    // Only cust-1 is VIP AND has granted Zalo consent without revocation!
    expect(result.totalMatched).toBe(1)
    expect(result.items[0]?.id).toBe("cust-1")
    expect(result.segmentName).toBe("Khách VIP Zalo")
  })

  it("records a manual customer interaction", async () => {
    const validUuid = "11111111-1111-4111-8111-111111111111"
    const mockCustomerRepo: ICustomerRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue({
        id: validUuid,
        organizationId: "org-test-1",
        code: "KH-0001",
        name: "Chị Mai",
        phone: "0901234567",
        tags: [],
        metrics: { tier: "VIP", totalSpentVnd: 10_000_000, orderCount: 8, aovVnd: 1_250_000 },
        preferences: { preferredFlowers: [], preferredColors: [] },
        occasions: [],
        consents: [],
        availableVouchers: [],
        updatedAt: "2026-01-01",
      }),
      findByPhone: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      addOccasion: vi.fn(),
      updateConsent: vi.fn(),
      syncMetricsFromOrders: vi.fn(),
    }

    const mockInteractionRepo: ICustomerInteractionRepository = {
      create: vi.fn().mockResolvedValue({
        id: "inter-1",
        organizationId: "org-test-1",
        customerId: validUuid,
        channel: "ZALO",
        direction: "OUTBOUND",
        assetUsageId: null,
        summary: "Gửi thiệp chúc mừng sinh nhật kèm ưu đãi 10%",
        outcome: "Khách phản hồi cảm ơn và hẹn ghé tiệm",
        occurredAt: new Date(),
        createdBy: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: vi.fn(),
      list: vi.fn(),
    }

    const interaction = await recordCustomerInteractionUseCase(
      fakeCtx,
      {
        customerId: validUuid,
        channel: "ZALO",
        summary: "Gửi thiệp chúc mừng sinh nhật kèm ưu đãi 10%",
        outcome: "Khách phản hồi cảm ơn và hẹn ghé tiệm",
      },
      mockInteractionRepo,
      mockCustomerRepo
    )

    expect(interaction.id).toBe("inter-1")
    expect(mockInteractionRepo.create).toHaveBeenCalledWith(
      fakeCtx,
      expect.objectContaining({
        customerId: validUuid,
        channel: "ZALO",
        direction: "OUTBOUND",
      })
    )
  })
})
