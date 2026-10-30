import { describe, expect, it } from "vitest"
import { getAllTools } from "./toolkit-catalog"
import { getAllGrowthModules, getVisibleGrowthModules } from "./growth-modules"

const existingIds = (dev: boolean) =>
  getVisibleGrowthModules(dev).flatMap((m) =>
    m.phases.flatMap((p) => p.tools.filter((t) => !t.isRoadmap).map((t) => t.id)),
  )

describe("10 module quy trình trên /cong-cu", () => {
  it("có đúng 10 module đánh số 1–10 và một khu riêng cuối", () => {
    const all = getAllGrowthModules()
    expect(all).toHaveLength(11)
    expect(all.slice(0, 10).map((m) => m.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(all.at(-1)?.order).toBeNull()
  })

  it("mỗi công cụ trong danh mục (51 gốc + 13 trang có sẵn) nằm đúng một chỗ", () => {
    const ids = existingIds(true)
    const catalogIds = getAllTools().map((t) => t.id)
    expect(catalogIds).toHaveLength(64)
    expect([...ids].sort((a, b) => a - b)).toEqual([...catalogIds].sort((a, b) => a - b))
  })

  it("công cụ mục tiêu không trùng tên công cụ đã có và có mã riêng", () => {
    const tools = getAllGrowthModules().flatMap((m) => m.phases.flatMap((p) => p.tools))
    const catalogNames = new Set(getAllTools().map((t) => t.name))
    const roadmap = tools.filter((t) => t.isRoadmap)
    expect(roadmap.length).toBeGreaterThan(0)
    for (const t of roadmap) {
      expect(catalogNames.has(t.name)).toBe(false)
      expect(t.href).toBeNull()
      expect(t.status).toBe("PLANNED")
    }
    expect(new Set(tools.map((t) => t.id)).size).toBe(tools.length)
  })

  it("production chỉ hiện công cụ hoàn thiện và ẩn module rỗng", () => {
    const prod = getVisibleGrowthModules(false)
    for (const m of prod) {
      expect(m.phases.length).toBeGreaterThan(0)
      for (const p of m.phases) {
        expect(p.tools.length).toBeGreaterThan(0)
        for (const t of p.tools) {
          expect(t.status).toBe("DONE")
          expect(t.isRoadmap).toBe(false)
        }
      }
    }
    const doneIds = getAllTools().filter((t) => t.status === "DONE").map((t) => t.id)
    expect(existingIds(false).sort((a, b) => a - b)).toEqual(doneIds.sort((a, b) => a - b))
    expect(prod.some((m) => m.key === "payment")).toBe(false)
  })
})
