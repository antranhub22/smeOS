import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { POST as approveRoute } from "@/app/api/v1/products/[id]/approve/route"
import { PATCH as productPatch } from "@/app/api/v1/products/[id]/route"
import { POST as productCreate } from "@/app/api/v1/products/route"
import { POST as batchImport } from "@/app/api/v1/products/batch-import/route"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { addStaffWithSession, createTenant, readJson, withSession, type Tenant } from "../helpers/fixtures"

/**
 * PO 23/10/2026 — giai đoạn 1 quản trị danh mục: Sale tạo mẫu đề xuất (dùng
 * được ngay, báo Điều hành), không ai ngoài Điều hành ghi đè mẫu chính thức,
 * Điều phối vẫn tạm ẩn được, chỉ Điều hành nhập Excel, tổ chức khác → 404.
 */
const params = (id: string) => ({ params: Promise.resolve({ id }) })
const json = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) })
const patch = (body: unknown) => ({ method: "PATCH", body: JSON.stringify(body) })

describe("sản phẩm: mẫu đề xuất và mẫu chính thức", () => {
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

  it("Sale tạo mẫu → dùng được ngay, mang nhãn đề xuất; Điều hành duyệt được", async () => {
    const sale = await addStaffWithSession(a, "sale", "sale")
    const res = await productCreate(withSession("http://localhost/api/v1/products", sale.token, json({ code: "DX-1", name: "Bó mới", status: "ACTIVE", attributes: { proposal: { status: "approved", byUserId: "gia-mao" } } })))
    expect(res.status).toBe(201)
    const created = await readJson(res)
    expect(created.status).toBe("ACTIVE")
    expect((created.attributes as Record<string, unknown>).proposal).toMatchObject({ status: "pending", byUserId: sale.userId })

    // Sale sửa được mẫu đề xuất của chính mình.
    const own = await productPatch(withSession(`http://localhost/api/v1/products/${created.id}`, sale.token, patch({ name: "Bó mới sửa" })), params(created.id as string))
    expect(own.status).toBe(200)

    const approved = await approveRoute(withSession(`http://localhost/api/v1/products/${created.id}/approve`, a.token, { method: "POST" }), params(created.id as string))
    expect(approved.status).toBe(200)
    const stored = (await prisma.products.findUniqueOrThrow({ where: { id: created.id as string } })).attributes as Record<string, unknown>
    expect(stored.proposal).toMatchObject({ status: "approved", byUserId: sale.userId })
    expect(await prisma.audit_logs.count({ where: { action: "product.approve", entity_id: created.id as string } })).toBe(1)

    // Đã duyệt = chính thức: Sale không sửa được nữa.
    const after = await productPatch(withSession(`http://localhost/api/v1/products/${created.id}`, sale.token, patch({ name: "Đổi lén" })), params(created.id as string))
    expect(after.status).toBe(403)
  })

  it("Điều phối không ghi đè mẫu chính thức nhưng tạm ẩn / mở bán được", async () => {
    const created = await readJson(await productCreate(withSession("http://localhost/api/v1/products", a.token, json({ code: "CT-1", name: "Mẫu chính thức", status: "ACTIVE" }))))
    expect((created.attributes as Record<string, unknown> | null)?.proposal).toBeUndefined()
    const dp = await addStaffWithSession(a, "dieu_phoi", "dp")
    const url = `http://localhost/api/v1/products/${created.id}`

    expect((await productPatch(withSession(url, dp.token, patch({ name: "Ghi đè" })), params(created.id as string))).status).toBe(403)
    expect((await productPatch(withSession(url, dp.token, patch({ status: "DRAFT" })), params(created.id as string))).status).toBe(200)
    expect((await productPatch(withSession(url, dp.token, patch({ status: "ACTIVE" })), params(created.id as string))).status).toBe(200)
  })

  it("chỉ Điều hành duyệt; duyệt mẫu của tổ chức khác → 404", async () => {
    const sale = await addStaffWithSession(a, "sale", "sale")
    const created = await readJson(await productCreate(withSession("http://localhost/api/v1/products", sale.token, json({ code: "DX-2", name: "Bó" }))))
    const url = `http://localhost/api/v1/products/${created.id}/approve`

    expect((await approveRoute(withSession(url, sale.token, { method: "POST" }), params(created.id as string))).status).toBe(403)
    expect((await approveRoute(withSession(url, b.token, { method: "POST" }), params(created.id as string))).status).toBe(404)
  })

  it("chỉ Điều hành nhập Excel", async () => {
    const dp = await addStaffWithSession(a, "dieu_phoi", "dp")
    const res = await batchImport(withSession("http://localhost/api/v1/products/batch-import", dp.token, json({ products: [] })))
    expect(res.status).toBe(403)
  })
})
