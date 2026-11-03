import { describe, expect, it, vi } from "vitest"

import type { PlatformContext } from "@/core/platform/platform-context"
import { deleteMarketplaceStore, type DeleteStoreDeps } from "../delete-partner-marketplace-store"

const pctx = (codes: string[]): PlatformContext => ({ userId: "ops-1", capabilities: new Set(codes) }) as PlatformContext

function makeDeps(found = true) {
  const deps = {
    repo: { deleteById: vi.fn(async () => (found ? { shopName: "Anh Chúc", source: "EXCEL", photoKeys: ["platform/partner-stores/s1/a.jpg"] } : null)) },
    audit: vi.fn(async () => ({}) as never),
  } satisfies DeleteStoreDeps
  return deps
}

describe("deleteMarketplaceStore — chỉ superadmin (N18)", () => {
  it("người có N1 + N17 (đồng bộ/nhập dữ liệu) không xoá được → 403, không chạm dữ liệu", async () => {
    const d = makeDeps()
    await expect(deleteMarketplaceStore(pctx(["N1", "N17"]), "s1", d)).rejects.toMatchObject({ status: 403 })
    expect(d.repo.deleteById).not.toHaveBeenCalled()
    expect(d.audit).not.toHaveBeenCalled()
  })

  it("có N18 → xoá, ghi nhật ký nền tảng kèm tên và số ảnh còn trong kho", async () => {
    const d = makeDeps()
    const res = await deleteMarketplaceStore(pctx(["N1", "N17", "N18"]), "s1", d)
    expect(res).toEqual({ id: "s1", shopName: "Anh Chúc" })
    expect(d.repo.deleteById).toHaveBeenCalledWith("s1")
    expect(d.audit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "platform.marketplace.store_delete",
        entityId: "s1",
        before: { shopName: "Anh Chúc", source: "EXCEL", photoCount: 1 },
      })
    )
  })

  it("hồ sơ không có → 404, không ghi nhật ký", async () => {
    const d = makeDeps(false)
    await expect(deleteMarketplaceStore(pctx(["N18"]), "missing", d)).rejects.toMatchObject({ status: 404 })
    expect(d.audit).not.toHaveBeenCalled()
  })
})
