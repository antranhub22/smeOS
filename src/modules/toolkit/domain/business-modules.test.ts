import { describe, expect, it } from "vitest"

import {
  BUSINESS_MODULE_SPECS,
  getAllBusinessModules,
  getVisibleBusinessModules,
} from "./business-modules"
import {
  getStoreOperationsSection,
  STORE_OPERATION_GROUP_SPECS,
  STORE_OPERATIONS_TOOL_IDS,
} from "./store-operations"
import { getAllTools } from "./toolkit-catalog"

describe("6 Business Modules & Store Operations (PO 01/11/2026)", () => {
  it("đúng 6 module kinh doanh được đánh số thứ tự từ 1 đến 6", () => {
    const modules = getAllBusinessModules()
    expect(modules).toHaveLength(6)
    expect(modules.map((m) => m.order)).toEqual([1, 2, 3, 4, 5, 6])
    expect(modules.map((m) => m.key)).toEqual(["brand", "content", "promotion", "sales", "care", "print"])
  })

  it("khu Vận hành cửa hàng có đúng 5 nhóm chuyên trách", () => {
    const section = getStoreOperationsSection(true)
    expect(section.key).toBe("store_operations")
    expect(section.groups).toHaveLength(5)
    expect(STORE_OPERATION_GROUP_SPECS).toHaveLength(5)
    expect(STORE_OPERATIONS_TOOL_IDS).toHaveLength(25)
  })

  it("mỗi công cụ trong 67 mã nằm đúng một chỗ trên toàn hệ thống", () => {
    const catalogTools = getAllTools()
    expect(catalogTools).toHaveLength(67)
    const catalogIds = catalogTools.map((t) => t.id).sort((a, b) => a - b)

    const moduleToolIds = BUSINESS_MODULE_SPECS.flatMap((m) => m.toolIds)
    const storeOpsToolIds = STORE_OPERATIONS_TOOL_IDS
    const totalPartitionIds = [...moduleToolIds, ...storeOpsToolIds].sort((a, b) => a - b)

    expect(totalPartitionIds).toHaveLength(67)
    expect(totalPartitionIds).toEqual(catalogIds)

    const uniquePartitionIds = new Set(totalPartitionIds)
    expect(uniquePartitionIds.size).toBe(67)
  })

  it("công cụ mục tiêu trong lộ trình (dev) có mã âm riêng và không trùng tên", () => {
    const allModules = getAllBusinessModules()
    const allTools = allModules.flatMap((m) => m.tools)
    const roadmapTools = allTools.filter((t) => t.isRoadmap)
    const catalogNames = new Set(getAllTools().map((t) => t.name))

    expect(roadmapTools.length).toBeGreaterThan(0)
    for (const t of roadmapTools) {
      expect(t.id).toBeLessThan(0)
      expect(catalogNames.has(t.name)).toBe(false)
      expect(t.href).toBeNull()
      expect(t.status).toBe("PLANNED")
    }

    const allIds = allTools.map((t) => t.id)
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it("production chỉ hiện công cụ DONE và asset Sẵn (READY), ẩn module rỗng", () => {
    const prodModules = getVisibleBusinessModules(false)

    for (const m of prodModules) {
      expect(m.tools.length + m.assets.length).toBeGreaterThan(0)

      for (const t of m.tools) {
        expect(t.status).toBe("DONE")
        expect(t.isRoadmap).toBe(false)
      }

      for (const a of m.assets) {
        expect(a.module).toBe(m.key)
      }
    }

    // Module print không có công cụ DONE và chưa có asset READY ở PR-0 -> phải bị ẩn ở production
    expect(prodModules.some((m) => m.key === "print")).toBe(false)

    // Store operations ở production chỉ hiện công cụ DONE
    const prodStoreOps = getStoreOperationsSection(false)
    for (const group of prodStoreOps.groups) {
      expect(group.tools.length).toBeGreaterThan(0)
      for (const t of group.tools) {
        expect(t.status).toBe("DONE")
      }
    }
  })
})
