import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { POST as createCoordinatorOrder } from "@/app/api/v1/coordinator/orders/route"
import { prisma } from "@/core/tenancy/infra/prisma"
import { Prisma } from "@/generated/prisma/client"
import { GreetingCardRepository } from "@/modules/greeting-card/infra/greeting-card-repository"
import { createSendLink } from "@/modules/greeting-card/use-cases/create-send-link"
import { decideOrderChange, submitOrderChange } from "@/modules/greeting-card/use-cases/order-change"
import { setOrderVat } from "@/modules/greeting-card/use-cases/order-vat"
import { selectBrochureProduct } from "@/modules/greeting-card/use-cases/select-brochure-product"
import { submitBrochureOrder } from "@/modules/greeting-card/use-cases/submit-brochure-order"
import { recipientFromDeliveryAddress } from "@/modules/orders/domain/order-recipient"
import { OrderRepository } from "@/modules/orders/infra/order-repository"
import { createOrder } from "@/modules/orders/use-cases/create-order"
import { ProductRepository } from "@/modules/products/infra/product-repository"

import { disconnectDatabase, resetDatabase } from "../helpers/database"
import { createTenant, withSession, type Tenant } from "../helpers/fixtures"

const DATE = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10)
const BROCHURE_ORDER = {
  customerName: "Khách Quen", customerPhone: "0987654321", recipientName: "Người Nhận", recipientPhone: "0912345678",
  confirmedTerms: true, selectedPromotionId: "promo-free-card", deliveryDate: DATE, deliveryTimeSlot: "08:00 - 10:00",
  deliveryAddress: "1 Lê Lợi, Q1", cardMessage: "Chúc mừng",
}

/** Khối backfill của migration `*_order_recipients` (CSDL test dựng bằng `db push`, không chạy migration). */
function backfillSql(): string[] {
  const dir = path.join(process.cwd(), "prisma/migrations")
  const migration = readdirSync(dir).find((d) => d.endsWith("_order_recipients"))
  if (!migration) throw new Error("Không thấy migration order_recipients")
  const block = readFileSync(path.join(dir, migration, "migration.sql"), "utf8").match(/-- P3A-BACKFILL-BEGIN[\s\S]*?-- P3A-BACKFILL-END/)?.[0]
  if (!block) throw new Error("Migration order_recipients thiếu khối backfill")
  // Tách lệnh theo `;` ở cuối dòng (thân hàm `$$ … $$` không có `;` cuối dòng)
  return block.replace(/^--.*$/gm, "").split(/;\s*$/m).map((s) => s.trim()).filter(Boolean)
}

const recipientOf = (orderId: string) => prisma.order_recipients.findUnique({ where: { order_id: orderId } })

/**
 * ADR-014 D-P2, bước P-3a (PO duyệt 07/11/2026): mọi đường ghi địa chỉ giao / hoá đơn VAT của đơn ghi kèm
 * `order_recipients` cùng tổ chức; backfill của migration cho cùng kết quả với `recipientFromDeliveryAddress`.
 */
describe("order_recipients — ghi kép và backfill", () => {
  let a: Tenant
  let b: Tenant

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("tiem-a")
    b = await createTenant("tiem-b")
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  async function brochureOrder(t: Tenant, code: string) {
    const product = await new ProductRepository().create(t.ctx, { code, name: `Bó ${code}`, attributes: { price: 500_000 } })
    const catalog = await new GreetingCardRepository().createCatalog(t.ctx, { code: code.toLowerCase(), name: `Bộ ${code}`, productIds: [product.id], createdBy: t.userId })
    const link = await createSendLink(t.ctx, { catalogId: catalog.id })
    await selectBrochureProduct(link.sendCode, product.id)
    return submitBrochureOrder(link.sendCode, BROCHURE_ORDER)
  }

  it("đơn Thẻ chào: người nhận ghi kèm; khách đổi địa chỉ được duyệt → cập nhật; VAT ghi phần hoá đơn, giữ phần người nhận", async () => {
    const order = await brochureOrder(a, "A1")
    expect(await recipientOf(order.orderId)).toMatchObject({
      organization_id: a.organizationId, recipient_name: "Người Nhận", recipient_phone: "0912345678", address_line: "1 Lê Lợi, Q1",
      vat_company_name: null,
    })

    const staff = { ...a.ctx, capabilities: new Set(["R1", "R2", "R3", "R4", "R5", "R9", "F2"]) }
    const sent = await submitOrderChange(new Request("http://localhost/api"), order.orderCode, { phoneLast4: "4321" }, {
      recipientName: "Người Mới", recipientPhone: "0933333333",
      addressParts: { houseNumber: "9", street: "Hai Bà Trưng", ward: "Phường Tân Định", province: "TP. Hồ Chí Minh" },
    })
    await decideOrderChange(staff, { requestId: sent.id, approve: true, note: "" })
    expect(await recipientOf(order.orderId)).toMatchObject({
      recipient_name: "Người Mới", recipient_phone: "0933333333", address_line: "9 Hai Bà Trưng, Phường Tân Định, TP. Hồ Chí Minh",
      address_parts: { houseNumber: "9", street: "Hai Bà Trưng", ward: "Phường Tân Định", province: "TP. Hồ Chí Minh" },
    })

    await setOrderVat(a.ctx, order.orderId, { enabled: true, rate: 10, companyName: "Cty Đông Nam", taxCode: "0123456789", email: "kt@dn.vn" })
    expect(await recipientOf(order.orderId)).toMatchObject({
      recipient_name: "Người Mới", vat_company_name: "Cty Đông Nam", vat_tax_code: "0123456789", vat_email: "kt@dn.vn",
    })
  })

  it("đơn nhập tay (tạo + sửa địa chỉ) và đơn điều phối: ghi kèm đúng tổ chức", async () => {
    const manual = await createOrder(a.ctx, {
      items: [{ description: "Bó hồng", quantity: 1, unitPriceVnd: 300_000 }],
      deliveryAddress: { recipientName: "Chị Hoa", phone: "0911111111", street: "5 Nguyễn Huệ", ward: "Bến Nghé", province: "TP. Hồ Chí Minh" },
    })
    expect(await recipientOf(manual.id)).toMatchObject({
      organization_id: a.organizationId, recipient_name: "Chị Hoa", address_line: "5 Nguyễn Huệ",
      address_parts: { ward: "Bến Nghé", province: "TP. Hồ Chí Minh" },
    })
    await new OrderRepository().update(a.organizationId, manual.id, { deliveryAddress: { recipientName: "Anh Nam", phone: "0922222222", street: "7 Lý Tự Trọng" } })
    expect(await recipientOf(manual.id)).toMatchObject({ recipient_name: "Anh Nam", address_line: "7 Lý Tự Trọng", address_parts: null })

    const res = await createCoordinatorOrder(withSession("http://localhost/api/v1/coordinator/orders", b.token, {
      method: "POST",
      body: JSON.stringify({
        customerName: "Nguyễn Văn An", customerPhone: "0987654321", recipientName: "Trần Thị Bình", recipientPhone: "0901234567",
        deliveryAddress: { street: "123 Phố Huế", ward: "Ngô Thì Nhậm", district: "Hai Bà Trưng", city: "Hà Nội" },
        deliveryTargetTime: "17:00 hôm nay", productTitle: "Bó hoa hồng Pastel", unitPriceVnd: 850_000,
      }),
    }))
    expect(res.status).toBe(201)
    const coordinated = await prisma.orders.findFirstOrThrow({ where: { organization_id: b.organizationId } })
    expect(await recipientOf(coordinated.id)).toEqual({
      ...recipientFromDeliveryAddress(coordinated.delivery_address),
      organization_id: b.organizationId, order_id: coordinated.id,
      vat_company_name: null, vat_tax_code: null, vat_company_address: null, vat_email: null,
      created_at: expect.any(Date), updated_at: expect.any(Date),
    })
  })

  it("khoá ghép: không gắn được dòng người nhận của tổ chức này vào đơn tổ chức khác", async () => {
    const order = await brochureOrder(a, "A2")
    await expect(prisma.order_recipients.create({ data: { order_id: order.orderId, organization_id: b.organizationId } })).rejects.toThrow()
  })

  it("backfill của migration khớp `recipientFromDeliveryAddress` trên mọi dạng địa chỉ; chạy lại không đổi", async () => {
    const shapes: unknown[] = [
      "  12 Lê Lợi, Q1  ",
      "",
      { recipientName: " Lan ", phone: "0912345678", street: "45 Lê Lợi", parts: { houseNumber: "45", street: "Lê Lợi", ward: "Bến Thành", province: "HCM" }, zone: "Q1", notes: "Gọi trước" },
      { name: "Mai", recipientPhone: "0909", parts: { houseNumber: " 9 ", street: "Hai Bà Trưng", ward: "P. Tân Định", district: "", province: "HCM" } },
      { recipientName: "Hoa", phone: "0911", street: "5 Nguyễn Huệ", ward: "Bến Nghé", district: "Q1", province: "HCM", city: "HCM" },
      { full_address: "1 Đồng Khởi" },
      { fullAddress: "2 Đồng Khởi", recipientName: 12 },
      { address: "3 Đồng Khởi", phone: "   " },
      { street: "", parts: { ward: "Bến Nghé" } },
      { notes: "chỉ ghi chú" },
      null,
    ]
    const ids: string[] = []
    for (const [i, shape] of shapes.entries()) {
      const row = await prisma.orders.create({
        data: {
          organization_id: i % 2 ? b.organizationId : a.organizationId, code: `DH-BF-${i}`, total_vnd: 0, balance_vnd: 0, created_by: "test",
          delivery_address: shape === null ? Prisma.DbNull : (shape as Prisma.InputJsonValue),
          ...(i === 9 ? { vat_company_name: "Cty Chỉ VAT", vat_tax_code: "0101" } : {}),
        },
      })
      ids.push(row.id)
    }

    const run = () => prisma.$transaction(async (tx) => { for (const stmt of backfillSql()) await tx.$executeRawUnsafe(stmt) }) // một kết nối (hàm pg_temp)
    await run()
    for (const [i, id] of ids.entries()) {
      const row = await recipientOf(id)
      const expected = recipientFromDeliveryAddress(shapes[i])
      const empty = Object.values(expected).every((v) => v === null) && i !== 9
      if (empty) {
        expect(row, `dạng #${i}`).toBeNull()
        continue
      }
      expect(row, `dạng #${i}`).toMatchObject({ ...expected, organization_id: i % 2 ? b.organizationId : a.organizationId })
    }
    expect(await recipientOf(ids[9]!)).toMatchObject({ vat_company_name: "Cty Chỉ VAT", vat_tax_code: "0101", recipient_name: null })

    const before = await prisma.order_recipients.findMany({ orderBy: { order_id: "asc" } })
    await run()
    expect(await prisma.order_recipients.findMany({ orderBy: { order_id: "asc" } })).toEqual(before)
  })
})
