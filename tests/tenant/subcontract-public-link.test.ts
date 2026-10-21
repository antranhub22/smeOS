import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { GET as viewSubcontract, POST as actOnSubcontract } from "@/app/api/v1/public/subcontract/[orderCode]/route"
import { prisma } from "@/core/tenancy/infra/prisma"
import { signSubcontractBranchToken } from "@/modules/greeting-card/infra/subcontract-link-token"

import { disconnectDatabase, resetDatabase } from "../helpers/database"
import { createTenant, readJson, type Tenant } from "../helpers/fixtures"

/** Cùng một mã đơn ở hai tổ chức — mã đơn chỉ duy nhất trong một tổ chức. */
const CODE = "DH261021-0001"

async function seedDispatchedOrder(t: Tenant, label: string, dispatched = true): Promise<{ branchId: string }> {
  const branch = await prisma.branches.create({
    data: { organization_id: t.organizationId, name: `Chi nhánh ${label}`, code: `CN-${label}` },
  })
  const order = await prisma.orders.create({
    data: {
      organization_id: t.organizationId, code: CODE, source: "BROCHURE", status: "CONFIRMED",
      total_vnd: 500_000, paid_vnd: 500_000, balance_vnd: 0, created_by: "test",
      card_message: `Lời chúc của ${label}`,
    },
  })
  await prisma.order_coordinations.create({
    data: {
      organization_id: t.organizationId,
      order_id: order.id,
      metadata: dispatched
        ? { subcontract_dispatch: { orderId: order.id, orderCode: CODE, dispatchStatus: "OPEN", invitedBranchIds: [branch.id] } }
        : {},
    },
  })
  return { branchId: branch.id }
}

function view(branchId: string, token?: string): Promise<Response> {
  const query = new URLSearchParams({ branch: branchId, ...(token ? { t: token } : {}) })
  const req = new Request(`http://localhost/api/v1/public/subcontract/${CODE}?${query}`)
  return viewSubcontract(req, { params: Promise.resolve({ orderCode: CODE }) })
}

/**
 * Thẻ Gia Công công khai chỉ mở bằng link đã ký cho đúng chi nhánh (rà soát 21/10/2026, C2).
 * Trước đây chỉ cần mã đơn (tuần tự, đoán được) là đọc và sửa được đơn của mọi tổ chức.
 */
describe("link Thẻ Gia Công công khai", () => {
  let a: Tenant
  let b: Tenant
  let branchA: string
  let branchB: string

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
    branchA = (await seedDispatchedOrder(a, "A")).branchId
    branchB = (await seedDispatchedOrder(b, "B")).branchId
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("chỉ có mã đơn + mã chi nhánh, không token: 404", async () => {
    expect((await view(branchA)).status).toBe(404)
  })

  it("token đúng: thấy đúng đơn của tổ chức trong token, không lẫn đơn trùng mã của tổ chức khác", async () => {
    const res = await view(branchA, signSubcontractBranchToken(a.organizationId, CODE, branchA))
    expect(res.status).toBe(200)
    const data = (await readJson(res)).data as Record<string, unknown>
    expect(data.cardMessage).toBe("Lời chúc của A")

    const resB = await view(branchB, signSubcontractBranchToken(b.organizationId, CODE, branchB))
    expect(((await readJson(resB)).data as Record<string, unknown>).cardMessage).toBe("Lời chúc của B")
  })

  it("token của chi nhánh này dùng cho chi nhánh khác, hoặc ghép tổ chức khác: 404", async () => {
    const tokenA = signSubcontractBranchToken(a.organizationId, CODE, branchA)
    expect((await view(branchB, tokenA)).status).toBe(404)
    const [, exp, sig] = tokenA.split(".")
    expect((await view(branchA, `${b.organizationId}.${exp}.${sig}`)).status).toBe(404)
  })

  it("đơn không có phiên điều phối gia công: 404 dù token hợp lệ", async () => {
    await prisma.order_coordinations.updateMany({ where: { organization_id: a.organizationId }, data: { metadata: {} } })
    expect((await view(branchA, signSubcontractBranchToken(a.organizationId, CODE, branchA))).status).toBe(404)
  })

  it("POST thao tác không token: 404, trạng thái đơn không đổi", async () => {
    const req = new Request(`http://localhost/api/v1/public/subcontract/${CODE}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "CANCEL", branchId: branchA }),
    })
    const res = await actOnSubcontract(req, { params: Promise.resolve({ orderCode: CODE }) })
    expect(res.status).toBe(404)
    const coord = await prisma.order_coordinations.findFirst({ where: { organization_id: a.organizationId } })
    expect((coord?.metadata as Record<string, Record<string, unknown>>).subcontract_dispatch?.dispatchStatus).toBe("OPEN")
  })
})
