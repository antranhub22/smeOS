import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { GET as getHub } from "@/app/api/v1/integrations/route"
import { GET as getGovernance, PUT as putGovernance } from "@/app/api/v1/integrations/governance/route"
import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, makeChainOrganization, readJson, withSession, type Tenant } from "../helpers/fixtures"

const BASE = "http://localhost/api/v1/integrations"

type Hub = { catalog: Array<{ key: string; availability: string }> }
const availabilityOf = async (t: Tenant, key: string) =>
  ((await readJson(await getHub(withSession(BASE, t.token)))) as Hub).catalog.find((c) => c.key === key)?.availability

const put = (t: Tenant, body: unknown) =>
  putGovernance(withSession(`${BASE}/governance`, t.token, { method: "PUT", body: JSON.stringify(body) }))

describe("cách ly tenant — khoá tích hợp theo tầng (Trung tâm Tích hợp GĐ3)", () => {
  let chainA: Tenant
  let chainB: Tenant
  let storeA: Tenant
  let storeB: Tenant

  beforeEach(async () => {
    await resetDatabase()
    chainA = await createTenant("chain-alpha")
    chainB = await createTenant("chain-beta")
    storeA = await createTenant("store-alpha")
    storeB = await createTenant("store-beta")
    await makeChainOrganization(chainA)
    await makeChainOrganization(chainB)
    await prisma.chain_partnerships.createMany({
      data: [
        { chain_org_id: chainA.organizationId, partner_org_id: storeA.organizationId, partner_code: "A1" },
        { chain_org_id: chainB.organizationId, partner_org_id: storeB.organizationId, partner_code: "B1" },
      ],
    })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("chuỗi A khoá chỉ áp cho cửa hàng của chuỗi A; phạm vi ghi là chính chuỗi trong phiên", async () => {
    const res = await put(chainA, { connectorKey: "facebook_messenger", mode: "FORBID" })
    expect(res.status).toBe(200)
    expect(await availabilityOf(storeA, "facebook_messenger")).toBe("LOCKED_BY_UPPER")
    expect(await availabilityOf(storeB, "facebook_messenger")).not.toBe("LOCKED_BY_UPPER")

    const rows = await prisma.integration_governance.findMany()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ tier: "CHAIN", scope_id: chainA.organizationId, mode: "FORBID" })

    const itemsB = (await readJson(await getGovernance(withSession(`${BASE}/governance`, chainB.token)))) as {
      items: Array<{ connectorKey: string; mode: string }>
    }
    expect(itemsB.items.find((i) => i.connectorKey === "facebook_messenger")?.mode).toBe("ALLOW_OWN")
  })

  it("cửa hàng không đọc/không đặt được khoá cho tầng dưới", async () => {
    expect((await getGovernance(withSession(`${BASE}/governance`, storeA.token))).status).toBe(404)
    expect((await put(storeA, { connectorKey: "facebook_messenger", mode: "FORBID" })).status).toBe(422)
    expect(await prisma.integration_governance.count()).toBe(0)
  })

  it("chuỗi cho phép lại → cửa hàng thành viên hết bị khoá, bảng không giữ dòng thừa", async () => {
    await put(chainA, { connectorKey: "zalo_oa", mode: "INHERIT_ONLY" })
    expect(await availabilityOf(storeA, "zalo_oa")).toBe("INHERITED")
    await put(chainA, { connectorKey: "zalo_oa", mode: "ALLOW_OWN" })
    expect(await availabilityOf(storeA, "zalo_oa")).not.toBe("INHERITED")
    expect(await prisma.integration_governance.count()).toBe(0)
  })
})
