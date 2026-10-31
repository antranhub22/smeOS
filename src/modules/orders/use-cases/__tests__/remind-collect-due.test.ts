import { describe, expect, it, vi } from "vitest"

import { remindCollectDue } from "../remind-collect-due"

const row = (orderId: string, owner: string | null) => ({
  organization_id: "org-1", requested_by: "sale-req", collect_due_at: new Date("2026-10-30T00:00:00Z"),
  order: { id: orderId, code: `DH-${orderId}`, status: "DELIVERED", balance_vnd: 500_000, owner_sale_id: owner },
})

describe("nhắc thu tiền đơn giao trước quá hạn", () => {
  it("nhắc Sale phụ trách (hoặc người xin), đánh dấu trước khi gửi, mỗi đơn một lần", async () => {
    const repo = { listOverdue: vi.fn(async () => [row("a", "sale-1"), row("b", null)]), markReminded: vi.fn(async () => undefined) }
    const notify = vi.fn(async () => 1)
    const r = await remindCollectDue(new Date(), repo as never, notify)
    expect(r).toEqual({ scanned: 2, reminded: 2 })
    expect(repo.markReminded).toHaveBeenCalledWith("org-1", "a", "DELIVERED")
    expect(notify.mock.calls.map((c) => (c as unknown as [{ ownerUserId: string }])[0].ownerUserId)).toEqual(["sale-1", "sale-req"])
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ eventKey: "ORDER_COLLECT_DUE", deepLink: "/don-hang?tab=sale" }))
  })
})
