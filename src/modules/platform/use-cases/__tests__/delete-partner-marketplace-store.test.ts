import { describe, expect, it, vi } from "vitest"

import type { PlatformContext } from "@/core/platform/platform-context"
import { MAX_BULK_DELETE_IDS, deleteMarketplaceStore, deleteMarketplaceStores, type BulkDeleteDeps, type DeleteStoreDeps } from "../delete-partner-marketplace-store"

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

function makeBulkDeps(result: { count: number; shopNames: string[]; photoCount: number } | null = { count: 2, shopNames: ["A", "B"], photoCount: 3 }) {
  const deps = {
    repo: { deleteMany: vi.fn(async () => result) },
    audit: vi.fn(async () => ({}) as never),
  } satisfies BulkDeleteDeps
  return deps
}

describe("deleteMarketplaceStores — xoá hàng loạt, chỉ superadmin (N18)", () => {
  it("không có N18 → 403, không xoá", async () => {
    const d = makeBulkDeps()
    await expect(deleteMarketplaceStores(pctx(["N1", "N17"]), { all: true, expectedTotal: 2 }, d)).rejects.toMatchObject({ status: 403 })
    await expect(deleteMarketplaceStores(pctx(["N17"]), { ids: ["a"] }, d)).rejects.toMatchObject({ status: 403 })
    expect(d.repo.deleteMany).not.toHaveBeenCalled()
  })

  it("xoá theo danh sách chọn: bỏ id trùng, ghi nhật ký store_bulk_delete", async () => {
    const d = makeBulkDeps()
    const res = await deleteMarketplaceStores(pctx(["N18"]), { ids: ["a", "b", "a"] }, d)
    expect(res).toEqual({ deleted: 2 })
    expect(d.repo.deleteMany).toHaveBeenCalledWith({ ids: ["a", "b"] })
    expect(d.audit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: "platform.marketplace.store_bulk_delete", before: { count: 2, photoCount: 3, shopNames: ["A", "B"] } })
    )
  })

  it("danh sách rỗng hoặc quá trần → 422, không xoá", async () => {
    const d = makeBulkDeps()
    await expect(deleteMarketplaceStores(pctx(["N18"]), { ids: [] }, d)).rejects.toMatchObject({ status: 422 })
    const tooMany = Array.from({ length: MAX_BULK_DELETE_IDS + 1 }, (_, i) => `id-${i}`)
    await expect(deleteMarketplaceStores(pctx(["N18"]), { ids: tooMany }, d)).rejects.toMatchObject({ status: 422 })
    expect(d.repo.deleteMany).not.toHaveBeenCalled()
  })

  it("xoá toàn bộ: số hồ sơ lệch so với lúc xác nhận → 409, không ghi nhật ký", async () => {
    const d = makeBulkDeps(null)
    await expect(deleteMarketplaceStores(pctx(["N18"]), { all: true, expectedTotal: 177 }, d)).rejects.toMatchObject({ status: 409 })
    expect(d.repo.deleteMany).toHaveBeenCalledWith({ all: true, expectedTotal: 177 })
    expect(d.audit).not.toHaveBeenCalled()
  })

  it("xoá toàn bộ khớp số → ghi nhật ký store_delete_all", async () => {
    const d = makeBulkDeps({ count: 177, shopNames: ["A"], photoCount: 0 })
    expect(await deleteMarketplaceStores(pctx(["N18"]), { all: true, expectedTotal: 177 }, d)).toEqual({ deleted: 177 })
    expect(d.audit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ action: "platform.marketplace.store_delete_all" }))
  })
})
