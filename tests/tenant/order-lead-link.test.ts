import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, type Tenant } from "../helpers/fixtures"
import { createCatalogLink } from "@/modules/catalog-links/use-cases/create-catalog-link"
import { captureCatalogLead } from "@/modules/acquisition/use-cases/capture-lead"
import { ingestOrder } from "@/modules/orders/use-cases/ingest-order"

/**
 * Cổng nhận đơn chung — lead → đơn (`KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md` §3.3, §4).
 * Lead/sale của tổ chức khác không được gắn vào đơn: lead → 404, sale → từ chối.
 */
const items = [{ description: "Bó hồng 20 cành", quantity: 1, unitPriceVnd: 550_000 }]

describe("cách ly tenant — cổng nhận đơn chung và lead → đơn", () => {
  let a: Tenant
  let b: Tenant
  let leadId: string

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
    await createCatalogLink(a.ctx, { slug: "catalog-a", name: "A", description: null, filters: null })
    await captureCatalogLead("catalog-a", { name: "Lan", phone: "0901234567", consent: true }, undefined)
    leadId = (await prisma.leads.findFirstOrThrow({ where: { organization_id: a.organizationId } })).id
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("lead cùng tổ chức thành đơn: đơn nhớ lead + nguồn + sale, lead chuyển WON và nhớ đơn", async () => {
    const order = await ingestOrder(a.ctx, { source: "CATALOG", items, leadId, ownerSaleId: a.userId })
    const row = await prisma.orders.findUniqueOrThrow({ where: { id: order.id } })
    expect(row.organization_id).toBe(a.organizationId)
    expect(row.source).toBe("CATALOG")
    expect(row.lead_id).toBe(leadId)
    expect(row.owner_sale_id).toBe(a.userId)
    expect(row.workflow).toBe("LEGACY")
    const lead = await prisma.leads.findUniqueOrThrow({ where: { id: leadId } })
    expect(lead.status).toBe("WON")
    expect(lead.converted_order_id).toBe(order.id)
  })

  it("tổ chức khác gắn lead của A → 404, không tạo đơn, lead A không đổi", async () => {
    await expect(ingestOrder(b.ctx, { source: "CATALOG", items, leadId })).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect(await prisma.orders.count({ where: { organization_id: b.organizationId } })).toBe(0)
    const lead = await prisma.leads.findUniqueOrThrow({ where: { id: leadId } })
    expect(lead.status).toBe("NEW")
    expect(lead.converted_order_id).toBeNull()
  })

  it("lead đã thành đơn không chuyển lần hai, và đơn thứ hai không được tạo", async () => {
    await ingestOrder(a.ctx, { source: "CATALOG", items, leadId })
    await expect(ingestOrder(a.ctx, { source: "CATALOG", items, leadId })).rejects.toMatchObject({ code: "CONFLICT" })
    expect(await prisma.orders.count({ where: { organization_id: a.organizationId } })).toBe(1)
  })

  it("sale phụ trách là người của tổ chức khác → từ chối", async () => {
    await expect(ingestOrder(a.ctx, { source: "MANUAL", items, ownerSaleId: b.userId })).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(await prisma.orders.count({ where: { organization_id: a.organizationId } })).toBe(0)
  })
})
