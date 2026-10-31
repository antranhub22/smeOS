import { describe, expect, it, vi } from "vitest"

import { matchStandardBankTransfers } from "../match-standard-bank-transfers"

const event = (id: string, content: string, org = "org-1") => ({
  id, organization_id: org, provider: "SEPAY", external_id: `x-${id}`, amount_vnd: 300_000, content,
})

describe("khớp chuyển khoản cho đơn ngoài Thẻ chào", () => {
  it("ghi thu đúng tổ chức của giao dịch, theo mã đơn, kèm dòng ngân hàng để khoá trong cùng giao dịch", async () => {
    const repo = {
      listUnmatched: vi.fn(async () => [event("e1", "DH251031-0001 chuyen coc"), event("e2", "khong co ma"), event("e3", "DH251031-0002", "org-2")]),
      record: vi.fn(async (ctx: { organizationId: string }, where: { code: string }) => {
        if (where.code === "DH251031-0002") throw new Error("not found")
        return { orderId: "o", orderCode: where.code, paymentId: "p", kind: "DEPOSIT", paidVnd: 1, balanceVnd: 1, org: ctx.organizationId }
      }),
    }
    const r = await matchStandardBankTransfers(new Date(), repo as never)
    expect(r).toEqual({ scanned: 3, matched: 1, skipped: 2 })
    const [ctx, where, input, eventId] = repo.record.mock.calls[0] as unknown as [{ organizationId: string; userId: string }, unknown, { amountVnd: number; method: string }, string]
    expect(ctx).toMatchObject({ organizationId: "org-1", userId: "system:sepay-orders" })
    expect(where).toEqual({ code: "DH251031-0001" })
    expect(input).toMatchObject({ amountVnd: 300_000, method: "BANK_TRANSFER" })
    expect(eventId).toBe("e1")
  })
})
