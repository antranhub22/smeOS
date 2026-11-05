import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { buildRegistrySource, OUTPUT_PATH, SCHEMA_PATH } from "../../../scripts/gen-tenant-table-registry.mjs"
import { TABLE_REGISTRY, TENANT_SCOPED_TABLES } from "@/core/tenancy/tenant-table-registry"

/**
 * Sổ bảng-thuộc-tenant (ADR-016 D-S1) phải khớp đúng `prisma/schema.prisma`.
 * Đỏ = sửa schema mà chưa sinh lại sổ: chạy `npm run gen:tenant-registry`.
 */
describe("sổ bảng-thuộc-tenant", () => {
  it("tệp sinh khớp schema hiện tại", () => {
    const expected = buildRegistrySource(readFileSync(SCHEMA_PATH, "utf8"))
    expect(readFileSync(OUTPUT_PATH, "utf8"), "chạy `npm run gen:tenant-registry`").toBe(expected)
  })

  it("mọi bảng TENANT có trong danh sách TENANT_SCOPED_TABLES và ngược lại", () => {
    const tenant = Object.entries(TABLE_REGISTRY).filter(([, e]) => e.scope === "TENANT").map(([n]) => n)
    expect([...TENANT_SCOPED_TABLES]).toEqual(tenant)
  })

  it("bảng tenant chỉ trỏ khoá ngoại tới bảng có trong sổ", () => {
    for (const [name, entry] of Object.entries(TABLE_REGISTRY)) {
      for (const parent of entry.parents) expect(TABLE_REGISTRY[parent], `${name} → ${parent}`).toBeDefined()
    }
  })
})
