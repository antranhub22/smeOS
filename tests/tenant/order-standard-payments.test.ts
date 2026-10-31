import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, readJson, withSession, type Tenant } from "../helpers/fixtures"
import { POST as postPayment } from "@/app/api/v1/orders/[id]/payments/route"
import { GET as getWorkbench } from "@/app/api/v1/orders/workbench/route"
import { ingestOrder } from "@/modules/orders/use-cases/ingest-order"
import { matchStandardBankTransfers } from "@/modules/orders/use-cases/match-standard-bank-transfers"

/** P3b — thu tiền đơn ngoài Thẻ chào và tự khớp SePay: chỉ trong đúng tổ chức. */
const BASE = "http://localhost/api/v1"

describe("cách ly tenant — thu tiền đơn ngoài Thẻ chào, khớp chuyển khoản", () => {
  let a: Tenant
  let b: Tenant
  let order: { id: string; code: string }

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
    order = await ingestOrder(a.ctx, { source: "MANUAL", items: [{ description: "Bó hồng", quantity: 1, unitPriceVnd: 1_000_000 }] })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  const pay = (t: Tenant, amountVnd: number) =>
    postPayment(withSession(`${BASE}/orders/${order.id}/payments`, t.token, { method: "POST", body: JSON.stringify({ amountVnd, method: "BANK_TRANSFER" }) }), { params: Promise.resolve({ id: order.id }) })

  it("B ghi thu đơn của A → 404; A ghi cọc → CONFIRMED, sang Điều phối; vượt phần còn lại → 422", async () => {
    expect((await pay(b, 300_000)).status).toBe(404)
    expect(await prisma.order_payments.count()).toBe(0)
    expect((await pay(a, 300_000)).status).toBe(201)
    const row = await prisma.orders.findUniqueOrThrow({ where: { id: order.id } })
    expect(row).toMatchObject({ status: "CONFIRMED", workflow: "STANDARD" })
    expect(Number(row.paid_vnd)).toBe(300_000)
    expect(await prisma.order_coordinations.count({ where: { order_id: order.id, organization_id: a.organizationId } })).toBe(1)
    expect((await pay(a, 800_000)).status).toBe(422)
  })

  it("chuyển khoản SePay: chỉ khớp đơn cùng tổ chức với giao dịch; chạy lại không ghi trùng", async () => {
    const mk = (org: string, ext: string) => prisma.greeting_payment_events.create({
      data: { organization_id: org, provider: "SEPAY", external_id: ext, amount_vnd: 300_000, content: `CK ${order.code}`, status: "UNMATCHED" },
    })
    const eb = await mk(b.organizationId, "tx-b")
    const ea = await mk(a.organizationId, "tx-a")
    expect((await matchStandardBankTransfers()).matched).toBe(1)
    expect((await matchStandardBankTransfers()).matched).toBe(0)
    expect(await prisma.greeting_payment_events.findUniqueOrThrow({ where: { id: ea.id } })).toMatchObject({ status: "MATCHED", order_id: order.id })
    expect(await prisma.greeting_payment_events.findUniqueOrThrow({ where: { id: eb.id } })).toMatchObject({ status: "UNMATCHED", order_id: null })
    expect(await prisma.order_payments.count()).toBe(1)
  })

  it("bàn làm việc: A thấy đơn của mình, B không thấy", async () => {
    const wa = (await readJson(await getWorkbench(withSession(`${BASE}/orders/workbench`, a.token)))) as { items: { id: string }[] }
    const wb = (await readJson(await getWorkbench(withSession(`${BASE}/orders/workbench`, b.token)))) as { items: { id: string }[] }
    expect(wa.items.map((i) => i.id)).toContain(order.id)
    expect(wb.items).toEqual([])
  })
})
