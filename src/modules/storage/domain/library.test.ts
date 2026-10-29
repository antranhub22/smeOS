import { describe, expect, it } from "vitest"

import { creatorFilterForScope, parseLibraryScope, visibleLibraryTypes } from "./library"

const members = new Map<string, string | null>([
  ["owner", null],
  ["staff-a", "branch-a"],
  ["staff-b", "branch-b"],
])

describe("creatorFilterForScope", () => {
  it("toàn chuỗi: không lọc; trụ sở: loại người của chi nhánh; một chi nhánh: chỉ người của chi nhánh đó", () => {
    expect(creatorFilterForScope("all", members, null)).toEqual({ kind: "none" })
    expect(creatorFilterForScope("hq", members, null)).toEqual({
      kind: "exclude",
      userIds: ["staff-a", "staff-b"],
      includeUnknown: true,
    })
    expect(creatorFilterForScope({ branchId: "branch-a" }, members, null)).toEqual({ kind: "only", userIds: ["staff-a"] })
  })

  it("nhân viên chi nhánh luôn chỉ thấy chi nhánh mình + trụ sở, bỏ qua phạm vi gửi lên (L-3)", () => {
    const expected = { kind: "exclude", userIds: ["staff-b"], includeUnknown: true }
    expect(creatorFilterForScope("all", members, "branch-a")).toEqual(expected)
    expect(creatorFilterForScope({ branchId: "branch-b" }, members, "branch-a")).toEqual(expected)
  })
})

describe("visibleLibraryTypes / parseLibraryScope", () => {
  it("chỉ hiện loại có quyền đọc của công cụ gốc", () => {
    expect(visibleLibraryTypes(new Set(["G1"]))).toEqual(["original", "ai_image"])
    expect(visibleLibraryTypes(new Set(["I1", "J1"]))).toEqual(["video", "audio", "content", "catalog", "landing"])
  })

  it("đọc phạm vi", () => {
    expect(parseLibraryScope(null)).toBe("all")
    expect(parseLibraryScope("hq")).toBe("hq")
    expect(parseLibraryScope("b1")).toEqual({ branchId: "b1" })
  })
})
