import { describe, it, expect, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import type { ITrashRepository } from "../../domain/repositories/trash-repository.interface"
import type { TrashItem } from "../../domain/trash-types"
import {
  getTrashList,
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
} from "../manage-trash"

function createMockContext(capabilities: string[] = ["G3"]): TenantContext {
  return {
    organizationId: "org_test",
    userId: "usr_executive",
    roles: ["dieu_hanh"],
    capabilities: new Set(capabilities),
  } as unknown as TenantContext
}

function createMockRepo(overrides: Partial<ITrashRepository> = {}): ITrashRepository {
  return {
    listTrash: vi.fn().mockResolvedValue([]),
    moveToTrash: vi.fn().mockResolvedValue(true),
    restoreFromTrash: vi.fn().mockResolvedValue(true),
    permanentDelete: vi.fn().mockResolvedValue("deleted"),
    ...overrides,
  }
}

describe("Storage Use-Cases with ITrashRepository Port", () => {
  describe("Phân quyền vai trò Điều hành (requireExecutiveRole)", () => {
    it("ném lỗi CAPABILITY_DENIED nếu tài khoản không có quyền điều hành", async () => {
      const nonExecCtx = createMockContext(["SOME_OTHER_CAP"])
      const repo = createMockRepo()

      await expect(getTrashList(nonExecCtx, repo)).rejects.toThrow(
        "Chỉ tài khoản có vai trò Điều hành mới có quyền quản lý xóa/khôi phục thùng rác"
      )
    })
  })

  describe("getTrashList", () => {
    it("trả về danh sách thùng rác thành công cho vai trò điều hành", async () => {
      const ctx = createMockContext(["G3"])
      const mockItems: TrashItem[] = [
        {
          id: "item_1",
          type: "RAW_ASSET",
          name: "Ảnh mẫu A",
          trashedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          daysRemaining: 1,
        },
      ]
      const repo = createMockRepo({
        listTrash: vi.fn().mockResolvedValue(mockItems),
      })

      const result = await getTrashList(ctx, repo)
      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe("item_1")
      expect(repo.listTrash).toHaveBeenCalledWith(ctx)
    })
  })

  describe("moveToTrash", () => {
    it("di chuyển đối tượng vào thùng rác thành công", async () => {
      const ctx = createMockContext(["L4"])
      const repo = createMockRepo({
        moveToTrash: vi.fn().mockResolvedValue(true),
      })

      await expect(
        moveToTrash(ctx, { id: "prod_1", type: "PRODUCT" }, repo)
      ).resolves.toBeUndefined()

      expect(repo.moveToTrash).toHaveBeenCalledWith(ctx, {
        id: "prod_1",
        type: "PRODUCT",
        userId: "usr_executive",
      })
    })

    it("ném lỗi 404 khi không tìm thấy đối tượng cần xóa", async () => {
      const ctx = createMockContext(["L4"])
      const repo = createMockRepo({
        moveToTrash: vi.fn().mockResolvedValue(false),
      })

      await expect(
        moveToTrash(ctx, { id: "prod_nonexistent", type: "PRODUCT" }, repo)
      ).rejects.toMatchObject({ status: 404 })
    })
  })

  describe("restoreFromTrash", () => {
    it("khôi phục đối tượng từ thùng rác thành công", async () => {
      const ctx = createMockContext(["A3"])
      const repo = createMockRepo({
        restoreFromTrash: vi.fn().mockResolvedValue(true),
      })

      await expect(
        restoreFromTrash(ctx, { id: "asset_1", type: "RAW_ASSET" }, repo)
      ).resolves.toBeUndefined()

      expect(repo.restoreFromTrash).toHaveBeenCalledWith(ctx, {
        id: "asset_1",
        type: "RAW_ASSET",
      })
    })

    it("ném lỗi 404 khi khôi phục thất bại", async () => {
      const ctx = createMockContext(["A3"])
      const repo = createMockRepo({
        restoreFromTrash: vi.fn().mockResolvedValue(false),
      })

      await expect(
        restoreFromTrash(ctx, { id: "asset_nonexistent", type: "RAW_ASSET" }, repo)
      ).rejects.toMatchObject({ status: 404 })
    })
  })

  describe("permanentDelete", () => {
    it("xóa vĩnh viễn đối tượng khỏi thùng rác", async () => {
      const ctx = createMockContext(["B6"])
      const repo = createMockRepo({
        permanentDelete: vi.fn().mockResolvedValue("deleted"),
      })

      await expect(
        permanentDelete(ctx, { id: "asset_1", type: "RAW_ASSET" }, repo)
      ).resolves.toBeUndefined()

      expect(repo.permanentDelete).toHaveBeenCalledWith(ctx, {
        id: "asset_1",
        type: "RAW_ASSET",
      })
    })

    it("ném lỗi 404 khi xóa vĩnh viễn thất bại", async () => {
      const ctx = createMockContext(["B6"])
      const repo = createMockRepo({
        permanentDelete: vi.fn().mockResolvedValue("not_found"),
      })

      await expect(
        permanentDelete(ctx, { id: "asset_nonexistent", type: "RAW_ASSET" }, repo)
      ).rejects.toMatchObject({ status: 404 })
    })

    it("chặn xoá vĩnh viễn khi asset đang legal hold (409)", async () => {
      const ctx = createMockContext(["B6"])
      const repo = createMockRepo({
        permanentDelete: vi.fn().mockResolvedValue("legal_hold"),
      })

      await expect(
        permanentDelete(ctx, { id: "asset_hold", type: "RAW_ASSET" }, repo)
      ).rejects.toMatchObject({ status: 409 })
    })
  })
})
