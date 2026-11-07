import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { resetPiiKeyCache } from "@/core/security/infra/pii-keys"
import { prisma } from "@/core/tenancy/infra/prisma"
import { CustomerRepository } from "@/modules/crm/infra/customer-repository"
import { createCustomer } from "@/modules/crm/use-cases/create-customer"
import { BrochureCheckoutRepository } from "@/modules/greeting-card/infra/brochure-checkout-repository"
import { upsertOrderRecipient } from "@/modules/orders/infra/order-recipient-repository"

import { disconnectDatabase, resetDatabase } from "../helpers/database"
import { createTenant, type Tenant } from "../helpers/fixtures"

/**
 * ADR-014 D-P3, bước P-5b: mọi lệnh đọc Prisma trả cột cá nhân giải từ bản mã (cả truy vấn lồng); tra cứu số điện thoại
 * qua `phone_hash`; ô tìm kiếm theo 4 số cuối hoặc đủ số (PO D-49). Cột rõ bị sửa bằng SQL (như sau P-5c) không ảnh
 * hưởng kết quả đọc.
 */
describe("dữ liệu cá nhân — đọc từ bản mã, tra cứu theo băm", () => {
  let a: Tenant
  let b: Tenant

  beforeEach(async () => {
    await resetDatabase()
    resetPiiKeyCache()
    a = await createTenant("tiem-a")
    b = await createTenant("tiem-b")
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("đọc trực tiếp và lồng trả giá trị giải mã, kể cả khi cột rõ đã bị xoá/sửa; khoá chưa nạp thì tự nạp", async () => {
    const c = await createCustomer(a.ctx, { name: "Chị Lan", phone: "0912345678", email: "lan@vi-du.test", address: "1 Lê Lợi" })
    const order = await prisma.orders.create({ data: { organization_id: a.organizationId, code: "DH-R1", total_vnd: 0, balance_vnd: 0, created_by: "t", customer_id: c.id } })
    const parts = { houseNumber: "5", street: "Nguyễn Huệ", ward: "Bến Nghé", province: "HCM" }
    await upsertOrderRecipient(prisma, a.organizationId, order.id, { deliveryAddress: { recipientName: "Hoa", phone: "0955555555", street: "5 Nguyễn Huệ", parts } })
    // Như sau P-5c: chữ rõ không còn đúng — đọc phải lấy từ bản mã
    await prisma.$executeRaw`UPDATE customers SET phone = 'x', email = NULL, address = NULL WHERE id = ${c.id}`
    await prisma.$executeRaw`UPDATE order_recipients SET recipient_phone = NULL, address_parts = NULL WHERE order_id = ${order.id}`
    resetPiiKeyCache()

    expect(await prisma.customers.findUniqueOrThrow({ where: { id: c.id }, select: { phone: true, email: true, address: true } }))
      .toMatchObject({ phone: "0912345678", email: "lan@vi-du.test", address: "1 Lê Lợi" })
    const nested = await prisma.orders.findUniqueOrThrow({ where: { id: order.id }, include: { customer: { select: { phone: true } }, recipient: true } })
    expect(nested.customer?.phone).toBe("0912345678")
    expect(nested.recipient).toMatchObject({ recipient_phone: "0955555555", address_parts: { street: "5 Nguyễn Huệ", parts } })
    expect((await new CustomerRepository().getById(a.ctx, c.id))?.phone).toBe("0912345678")
  })

  it("tra cứu theo băm: cùng số viết khác (+84, dấu chấm) khớp đúng khách, không tạo trùng; tổ chức khác không khớp", async () => {
    const c = await createCustomer(a.ctx, { name: "Chị Lan", phone: "0912345678" })
    const checkout = new BrochureCheckoutRepository()
    expect(await checkout.findCustomerIdByPhone(a.organizationId, "+84 912.345.678")).toBe(c.id)
    expect(await checkout.findOrCreateCustomer({ organizationId: a.organizationId, customerPhone: "+84912345678", customerName: "Lan", deliveryAddress: "" })).toBe(c.id)
    expect(await checkout.findCustomerIdByPhone(b.organizationId, "0912345678")).toBeNull()
    expect(await prisma.customers.count({ where: { organization_id: a.organizationId } })).toBe(1)

    // Dòng chưa băm (dữ liệu cũ chưa chạy job) vẫn khớp theo cột rõ
    await prisma.$executeRaw`INSERT INTO customers (id, organization_id, code, name, phone, updated_at) VALUES ('kh-cu', ${a.organizationId}, 'KH-CU', 'Khách cũ', '0988888888', now())`
    expect(await checkout.findCustomerIdByPhone(a.organizationId, "0988888888")).toBe("kh-cu")
  })

  it("ô tìm khách (D-49): 4 số cuối hoặc đủ số; phần giữa số không còn; tên vẫn tìm được", async () => {
    await createCustomer(a.ctx, { name: "Chị Lan", phone: "0912345678" })
    await createCustomer(a.ctx, { name: "Anh Minh", phone: "0987654321" })
    const names = async (search: string) => (await new CustomerRepository().list(a.ctx, { search })).items.map((x) => x.name).sort()
    expect(await names("5678")).toEqual(["Chị Lan"])
    expect(await names("0912 345 678")).toEqual(["Chị Lan"])
    expect(await names("2345")).toEqual([])
    expect(await names("123")).toEqual([])
    expect(await names("Minh")).toEqual(["Anh Minh"])
  })
})
