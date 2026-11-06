import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { PrismaChainPartnershipRepository } from "@/modules/chain-partnership/infra/prisma-partnership-repository"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, makeChainOrganization, type Tenant } from "../helpers/fixtures"

/**
 * ADR-012 T-2: repository đối tác ghi kép `chain_partnerships` → `organization_links` trong cùng giao dịch;
 * cạnh chính = liên kết chuỗi ACTIVE sớm nhất của cửa hàng (luật hiện hành), tối đa một cạnh chính.
 */
describe("organization_links — ghi kép từ repository đối tác", () => {
  let chainA: Tenant
  let chainB: Tenant
  let store: Tenant
  const repo = new PrismaChainPartnershipRepository()

  beforeEach(async () => {
    await resetDatabase()
    chainA = await createTenant("chuoi-a")
    chainB = await createTenant("chuoi-b")
    store = await createTenant("cua-hang")
    await makeChainOrganization(chainA)
    await makeChainOrganization(chainB)
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  const link = (chain: Tenant, code: string, type?: string) =>
    repo.linkExistingStore({ chainOrgId: chain.organizationId, partnerOrgId: store.organizationId, partnerCode: code, partnershipType: type })

  const links = () =>
    prisma.organization_links.findMany({ where: { child_org_id: store.organizationId }, orderBy: { created_at: "asc" } })

  it("mỗi liên kết có một dòng organization_links cùng id, đúng loại", async () => {
    const b = await link(chainB, "B-01", "FRANCHISE")
    const rows = await links()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: b.id, parent_org_id: chainB.organizationId, link_type: "FRANCHISE", status: "ACTIVE", is_primary: true })
  })

  it("cửa hàng thuộc hai chuỗi: cạnh chính là liên kết ACTIVE sớm nhất; tạm ngưng thì chuyển sang chuỗi còn lại", async () => {
    const b = await link(chainB, "B-01")
    const a = await link(chainA, "A-01")
    const primaryOf = async () => (await links()).filter((r) => r.is_primary).map((r) => r.id)

    expect(await primaryOf()).toEqual([b.id])

    await repo.updateStatus(b.id, "SUSPENDED")
    expect(await primaryOf()).toEqual([a.id])
    expect((await prisma.organization_links.findUniqueOrThrow({ where: { id: b.id } })).status).toBe("SUSPENDED")

    await repo.updateStatus(a.id, "TERMINATED")
    expect(await primaryOf()).toEqual([])
    expect((await prisma.organization_links.findUniqueOrThrow({ where: { id: a.id } })).valid_to).not.toBeNull()
  })

  it("liên kết lại (upsert) không tạo dòng mới", async () => {
    await link(chainA, "A-01")
    await link(chainA, "A-02")
    const rows = await links()
    expect(rows).toHaveLength(1)
    expect(rows[0]?.partner_code).toBe("A-02")
  })
})
