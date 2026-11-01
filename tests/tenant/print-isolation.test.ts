import { afterAll, beforeEach, describe, expect, it } from "vitest"
import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, type Tenant } from "../helpers/fixtures"
import { createPrintRenditionUseCase } from "@/modules/print/use-cases/create-print-rendition.use-case"
import { listPrintRenditionsUseCase } from "@/modules/print/use-cases/list-print-renditions.use-case"
import { getPrintRenditionUseCase } from "@/modules/print/use-cases/get-print-rendition.use-case"
import { exportPrintPdfUseCase } from "@/modules/print/use-cases/export-print-pdf.use-case"

describe("Marketing & Sales Center — Cách ly tenant cho Ấn phẩm & In ấn (Print Renditions)", () => {
  let a: Tenant
  let b: Tenant

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
    const caps = (t: Tenant) => ({
      ...t,
      ctx: { ...t.ctx, capabilities: new Set([...t.ctx.capabilities, "M5", "Q1"]) },
    })
    a = caps(a)
    b = caps(b)
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it("bản in tạo bởi tổ chức A chỉ thấy bởi A, B không thấy", async () => {
    const renditionA = await createPrintRenditionUseCase(a.ctx, {
      sourceType: "CARE_CARD",
      presetCode: "A6",
      imageWidthPx: 1400,
      imageHeightPx: 1900,
      hasQrCode: true,
      qrSizeMm: 25,
    })

    expect(renditionA.id).toBeDefined()
    expect(renditionA.organizationId).toBe(a.organizationId)
    expect(renditionA.presetCode).toBe("A6")
    expect(renditionA.widthMm).toBe(105)
    expect(renditionA.heightMm).toBe(148)

    const listA = await listPrintRenditionsUseCase(a.ctx)
    expect(listA.items).toHaveLength(1)
    expect(listA.items[0]?.id).toBe(renditionA.id)

    const listB = await listPrintRenditionsUseCase(b.ctx)
    expect(listB.items).toHaveLength(0)
  })

  it("tổ chức B không thể xem hoặc xuất PDF bản in của A", async () => {
    const renditionA = await createPrintRenditionUseCase(a.ctx, {
      sourceType: "POSTER",
      presetCode: "A4",
      imageWidthPx: 2600,
      imageHeightPx: 3600,
    })

    // B cố lấy chi tiết -> null
    const findB = await getPrintRenditionUseCase(b.ctx, renditionA.id)
    expect(findB).toBeNull()

    // B cố xuất PDF -> throw Không tìm thấy
    await expect(
      exportPrintPdfUseCase(b.ctx, renditionA.id, {
        title: "B cố xuất lậu PDF của A",
      })
    ).rejects.toThrow("Không tìm thấy bản in quy cách")

    // A xuất PDF hợp lệ
    const exportA = await exportPrintPdfUseCase(a.ctx, renditionA.id, {
      title: "Poster chính thức của A",
      includeBleedMarks: true,
    })
    expect(exportA.base64).toContain("data:application/pdf")
    expect(exportA.widthMm).toBe(210 + 6)
    expect(exportA.heightMm).toBe(297 + 6)
  })
})
