import { describe, expect, it, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import { vnCalendarDate, vnDayBounds } from "@/lib/vn-date"
import { generateOrderCode } from "@/modules/orders/domain/order-rules"
import type { IOrderRepository } from "@/modules/orders/domain/repositories/order-repository.interface"
import { createOrder, ORDER_CODE_ATTEMPTS } from "@/modules/orders/use-cases/create-order"

/** Audit BL-10 (06/11/2026): mã đơn theo giờ máy chủ (UTC) và không thử lại khi hai đơn trùng mã. */
const ctx: TenantContext = { userId: "u", organizationId: "org-1", workspaceId: "ws", branchId: null, capabilities: new Set(["R2"]) }
const unique = () => Object.assign(new Error("Unique constraint failed"), { code: "P2002" })

describe("ngày Việt Nam", () => {
  it("23:30 UTC là ngày hôm sau ở Việt Nam", () => {
    expect(vnCalendarDate(new Date("2026-11-06T23:30:00Z"))).toEqual({ year: 2026, month: 11, day: 7 })
    expect(generateOrderCode(1, new Date("2026-11-06T23:30:00Z"))).toBe("DH261107-0001")
  })

  it("ranh giới ngày là 00:00 giờ Việt Nam", () => {
    const { start, end } = vnDayBounds(new Date("2026-11-07T05:00:00Z"))
    expect(start.toISOString()).toBe("2026-11-06T17:00:00.000Z")
    expect(end.toISOString()).toBe("2026-11-07T17:00:00.000Z")
  })
})

describe("createOrder — trùng mã", () => {
  const items = [{ description: "Bó hoa", quantity: 1, unitPriceVnd: 300_000 }]

  function repoWith(create: ReturnType<typeof vi.fn>) {
    return { countTodayOrders: vi.fn().mockResolvedValue(4), create } as unknown as IOrderRepository
  }

  it("trùng mã → thử số kế tiếp", async () => {
    const create = vi.fn().mockRejectedValueOnce(unique()).mockImplementation(async (_o: string, code: string) => ({ id: "o", code }))
    const order = await createOrder(ctx, { items }, repoWith(create), vi.fn())
    expect(create).toHaveBeenCalledTimes(2)
    expect((create.mock.calls[0] as unknown[])[1]).toMatch(/-0005$/)
    expect(order.code).toMatch(/-0006$/)
  })

  it("trùng mãi → 409 sau số lần có giới hạn, không 500", async () => {
    const create = vi.fn().mockRejectedValue(unique())
    await expect(createOrder(ctx, { items }, repoWith(create), vi.fn())).rejects.toMatchObject({ code: "CONFLICT" })
    expect(create).toHaveBeenCalledTimes(ORDER_CODE_ATTEMPTS)
  })

  it("lỗi khác không bị nuốt", async () => {
    const create = vi.fn().mockRejectedValue(new Error("db down"))
    await expect(createOrder(ctx, { items }, repoWith(create), vi.fn())).rejects.toThrow("db down")
    expect(create).toHaveBeenCalledTimes(1)
  })
})
