import { describe, expect, it, vi } from "vitest"

import type { TenantContext } from "@/core/tenancy"
import { purgeAssetPayloads, type PurgeDeps } from "../purge-asset-payloads"

const ctx: TenantContext = {
  organizationId: "org-a",
  branchId: null,
  userId: "u",
  workspaceId: "ws",
  capabilities: new Set(),
}
const asset = { id: "a1", storage_key: "org/org-a/p/a1.jpg", thumb_key: "org/org-a/p/a1_t.webp" }

function deps(refs: Record<string, number> = {}, fail = false): PurgeDeps & { deleted: string[] } {
  const deleted: string[] = []
  return {
    deleted,
    storage: {
      delete: vi.fn(async (key: string) => {
        if (fail) throw new Error("kho lỗi")
        deleted.push(key)
      }),
    },
    countReferences: vi.fn(async (_ctx: TenantContext, key: string) => refs[key] ?? 0),
  }
}

describe("purgeAssetPayloads", () => {
  it("tắt (deps null) thì không xoá gì", async () => {
    await expect(purgeAssetPayloads(ctx, asset, null)).resolves.toBeUndefined()
  })

  it("xoá payload và thumbnail không còn bản ghi nào trỏ tới", async () => {
    const d = deps()
    await purgeAssetPayloads(ctx, asset, d)
    expect(d.deleted).toEqual([asset.storage_key, asset.thumb_key])
  })

  it("giữ payload còn bản ghi khác trỏ tới (Master dùng chung tệp gốc)", async () => {
    const d = deps({ [asset.storage_key]: 1 })
    await purgeAssetPayloads(ctx, asset, d)
    expect(d.deleted).toEqual([asset.thumb_key])
  })

  it("lỗi kho không làm hỏng thao tác xoá", async () => {
    await expect(purgeAssetPayloads(ctx, asset, deps({}, true))).resolves.toBeUndefined()
  })
})
