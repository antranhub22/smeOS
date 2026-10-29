import { describe, expect, it, vi } from "vitest"

import type { TenantContext } from "@/core/tenancy"
import type { LibraryRow } from "../../infra/library-repository"
import { getLibrarySummary, listLibrary, type LibraryDeps } from "../list-library"

const ctx = (capabilities: string[], branchId: string | null = null): TenantContext => ({
  organizationId: "org-a",
  workspaceId: "ws",
  userId: "u",
  branchId,
  capabilities: new Set(capabilities),
})

const row = (over: Partial<LibraryRow>): LibraryRow => ({
  id: "r1",
  type: "ai_image",
  title: "",
  createdAt: new Date("2026-10-01T00:00:00Z"),
  createdBy: "staff-a",
  status: "READY",
  subtype: "MASTER",
  storageKey: "org/org-a/p/r1.jpg",
  mimeType: "image/jpeg",
  ...over,
})

function deps(rows: LibraryRow[]): LibraryDeps {
  return {
    listRows: vi.fn(async () => rows),
    loadDirectory: async () => ({
      isChain: true,
      branchOfUser: new Map([["staff-a", "branch-a"], ["owner", null]]),
      branchNames: new Map([["branch-a", "Chi nhánh Quận 1"]]),
    }),
    signUrl: async (key) => `/signed/${key}`,
  }
}

describe("listLibrary", () => {
  it("gắn nhãn chi nhánh theo người tạo và ảnh xem trước ký có hạn", async () => {
    const result = await listLibrary(ctx(["G1"]), { type: "ai_image", scope: "all", q: null, from: null, cursor: null }, deps([row({})]))
    expect(result.items[0]).toMatchObject({
      branch: { id: "branch-a", name: "Chi nhánh Quận 1" },
      thumbnail_url: "/signed/org/org-a/p/r1.jpg",
      open_href: "/creative-studio",
    })
    expect(result.next_cursor).toBeNull()
  })

  it("thiếu quyền đọc của công cụ gốc → từ chối; loại lạ → 400; chi nhánh không thuộc tổ chức → 404", async () => {
    const input = { scope: "all" as const, q: null, from: null, cursor: null }
    await expect(listLibrary(ctx(["G1"]), { ...input, type: "video" }, deps([]))).rejects.toMatchObject({ code: "CAPABILITY_DENIED" })
    await expect(listLibrary(ctx(["G1"]), { ...input, type: "x" }, deps([]))).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    await expect(
      listLibrary(ctx(["G1"]), { ...input, type: "original", scope: { branchId: "branch-of-other-org" } }, deps([]))
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("nhân viên chi nhánh: bộ lọc luôn là chi nhánh mình + trụ sở", async () => {
    const d = deps([])
    await listLibrary(ctx(["G1"], "branch-a"), { type: "original", scope: "all", q: null, from: null, cursor: null }, d)
    expect(d.listRows).toHaveBeenCalledWith(
      expect.anything(),
      "original",
      expect.objectContaining({ creator: { kind: "exclude", userIds: [], includeUnknown: true } })
    )
  })
})

describe("getLibrarySummary", () => {
  it("chỉ trả loại có quyền + chi nhánh của tổ chức", async () => {
    const summary = await getLibrarySummary(ctx(["G1", "J1"]), deps([]).loadDirectory)
    expect(summary).toEqual({
      types: ["original", "ai_image", "catalog", "landing"],
      is_chain: true,
      viewer_branch_id: null,
      branches: [{ id: "branch-a", name: "Chi nhánh Quận 1" }],
    })
  })
})
