import { randomUUID } from "node:crypto"
import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { GET as print } from "@/app/api/v1/orders/[id]/print/route"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { addStaffWithSession, createTenant, readJson, withSession, type Tenant } from "../helpers/fixtures"

/** Checklist ALG 4.9 — phiếu xưởng A6: công thức theo phiên bản, ảnh mẫu, lời thiệp; không có giá ở phần xưởng. */

describe("phiếu xưởng in", () => {
  let a: Tenant
  let b: Tenant

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("trả công thức, phiên bản và số cành, ảnh mẫu; tổ chức khác → 404; thợ cắm không có quyền in → 403", async () => {
    const id = randomUUID()
    await prisma.orders.create({
      data: {
        id, organization_id: a.organizationId, code: "DH-IN", status: "CONFIRMED", created_by: a.userId, card_message: "Chúc mừng khai trương\nHồng phát",
        total_vnd: 900_000, paid_vnd: 0, balance_vnd: 900_000, delivery_window: { date: "2026-11-05", timeSlot: "09:00-11:00" },
        items: { create: [{ organization_id: a.organizationId, description: "Kệ hoa — Lớn", quantity: 1, unit_price_vnd: 900_000,
          metadata: { variant: { id: "opt:1", name: "Lớn", stemCount: 80 }, sampleImageUrl: "https://example.test/mau.jpg",
            flowers: [{ flowerName: "Hồng đỏ", quantity: 40, unit: "cành", color: "đỏ", role: "Chủ đạo" }], costVnd: 350_000 } }] },
      },
    })
    const get = (token: string) => print(withSession(`http://localhost/api/v1/orders/${id}/print`, token), { params: Promise.resolve({ id }) })

    const res = await get(a.token)
    expect(res.status).toBe(200)
    const data = (await readJson(res)).print as { florist: unknown[]; cardMessage: string }
    expect(data.florist).toEqual([{
      description: "Kệ hoa — Lớn", quantity: 1, variantName: "Lớn", stemCount: 80, sampleImageUrl: "https://example.test/mau.jpg",
      recipe: [{ flowerName: "Hồng đỏ", quantity: 40, unit: "cành", color: "đỏ", role: "Chủ đạo" }],
    }])
    expect(JSON.stringify(data.florist)).not.toContain("350000")
    expect(data.cardMessage).toBe("Chúc mừng khai trương\nHồng phát")

    expect((await get(b.token)).status).toBe(404)
    const tho = await addStaffWithSession(a, "tho_cam", "tho")
    expect((await get(tho.token)).status).toBe(403)
  })
})
