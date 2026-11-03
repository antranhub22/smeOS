import { describe, expect, it, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { PrintRendition } from "../../domain/print-rendition"
import type { IPrintRenditionRepository } from "../../domain/repositories/print-rendition-repository.interface"
import { exportPrintPdfUseCase } from "../export-print-pdf.use-case"

const ctx: TenantContext = {
  organizationId: "org-1",
  userId: "user-1",
  capabilities: new Set(["M5"]),
  workspaceId: "ws-1",
  branchId: null,
}

const rendition: PrintRendition = {
  id: "r-1",
  organizationId: "org-1",
  presetCode: "A6",
  status: "PENDING",
  widthMm: 105,
  heightMm: 148,
  bleedMm: 3,
  dpi: 300,
  sourceType: "CARE_CARD",
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const repo = (): IPrintRenditionRepository => ({
  create: vi.fn(),
  findById: vi.fn().mockResolvedValue(rendition),
  list: vi.fn(),
  update: vi.fn().mockResolvedValue({ ...rendition, status: "READY" }),
})

// PNG 1×1 hợp lệ.
const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

describe("Xuất PDF in ấn — ảnh gửi kèm", () => {
  it("nhận PNG hợp lệ", async () => {
    const res = await exportPrintPdfUseCase(ctx, "r-1", { imageDataUrl: `data:image/png;base64,${PNG_1X1}` }, repo())
    expect(res.mimeType).toBe("application/pdf")
  })

  it.each([
    ["không phải data URL ảnh", "https://example.com/a.png"],
    ["định dạng không hỗ trợ", "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="],
    ["khai PNG nhưng nội dung là văn bản", `data:image/png;base64,${Buffer.from("<script>alert(1)</script>").toString("base64")}`],
  ])("từ chối %s → 400, không ghi trạng thái", async (_label, imageDataUrl) => {
    const r = repo()
    await expect(exportPrintPdfUseCase(ctx, "r-1", { imageDataUrl }, r)).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(r.update).not.toHaveBeenCalled()
  })
})
