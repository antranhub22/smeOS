#!/usr/bin/env node
// Sinh sổ bảng-thuộc-tenant từ prisma/schema.prisma (ADR-016 D-S1, bước S-1).
// Chạy: npm run gen:tenant-registry — test `tests/unit/architecture/tenant-table-registry.test.ts`
// đỏ khi tệp sinh lệch schema.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const SCHEMA_PATH = "prisma/schema.prisma"
export const OUTPUT_PATH = "src/core/tenancy/tenant-table-registry.ts"

/** Mỗi model → { scope, parents }: TENANT khi có cột `organization_id`, còn lại GLOBAL. */
export function parseSchema(schemaText) {
  const models = new Map()
  for (const m of schemaText.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
    const [, name, body] = m
    const tenant = /^\s+organization_id\s/m.test(body)
    const parents = new Set()
    const pii = {}
    let pendingPii = null
    for (const line of body.split("\n")) {
      const label = line.match(/^\s+\/\/\/\s*@pii\s+(\w+)/)
      if (label) { pendingPii = label[1]; continue }
      const field = line.match(/^\s+(\w+)\s+\w/)
      if (field && !line.trim().startsWith("//")) {
        if (pendingPii) pii[field[1]] = pendingPii
        pendingPii = null
      }
      const rel = line.match(/^\s+\w+\s+(\w+)\??\s+@relation\(/)
      if (rel && /fields:\s*\[/.test(line) && rel[1] !== name) parents.add(rel[1])
    }
    models.set(name, { scope: tenant ? "TENANT" : "GLOBAL", parents: [...parents].sort(), pii })
  }
  return new Map([...models].sort(([a], [b]) => a.localeCompare(b)))
}

export function buildRegistrySource(schemaText) {
  const models = parseSchema(schemaText)
  const rows = [...models].map(([name, { scope, parents, pii }]) => {
    const p = parents.length ? `[${parents.map((x) => `"${x}"`).join(", ")}]` : "[]"
    const cols = Object.entries(pii).sort(([a], [b]) => a.localeCompare(b))
    const q = cols.length ? `, pii: { ${cols.map(([c, k]) => `${c}: "${k}"`).join(", ")} }` : ""
    return `  ${name}: { scope: "${scope}", parents: ${p}${q} },`
  })
  const tenant = [...models].filter(([, v]) => v.scope === "TENANT").map(([n]) => `  "${n}",`)
  return [
    "// TỆP SINH TỰ ĐỘNG — không sửa tay. Nguồn: prisma/schema.prisma. Sinh lại: npm run gen:tenant-registry",
    "// Sổ bảng-thuộc-tenant (ADR-016 D-S1): RLS, dọn bảng của test, xuất/nhập/xoá tenant đều đọc sổ này.",
    "",
    'export type TableScope = "TENANT" | "GLOBAL"',
    "",
    "/** contact · address · tax · identity = dữ liệu cá nhân; business = liên hệ của doanh nghiệp (không mã hoá). */",
    'export type PiiCategory = "contact" | "address" | "tax" | "identity" | "free_text" | "business"',
    "",
    "export interface TableEntry {",
    "  /** TENANT = có cột organization_id; GLOBAL = bảng nền tảng hoặc của người dùng. */",
    "  readonly scope: TableScope",
    "  /** Bảng mà bảng này trỏ khoá ngoại tới (không gồm chính nó) — thứ tự xuất/nhập. */",
    "  readonly parents: readonly string[]",
    "  /** Cột dữ liệu cá nhân theo nhãn `/// @pii <loại>` trong schema (ADR-014 D-P1). */",
    "  readonly pii?: Readonly<Record<string, PiiCategory>>",
    "}",
    "",
    "export const TABLE_REGISTRY: Readonly<Record<string, TableEntry>> = {",
    ...rows,
    "}",
    "",
    "/** Mọi bảng có organization_id, theo thứ tự tên. */",
    "export const TENANT_SCOPED_TABLES: readonly string[] = [",
    ...tenant,
    "]",
    "",
  ].join("\n")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(OUTPUT_PATH, buildRegistrySource(readFileSync(SCHEMA_PATH, "utf8")))
  console.log(`gen-tenant-table-registry: đã ghi ${OUTPUT_PATH}`)
}
