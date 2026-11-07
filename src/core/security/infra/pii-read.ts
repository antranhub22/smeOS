import { log } from "@/core/observability/log"
import { asSystemDb } from "@/core/tenancy/db-context"

import { decryptPii, piiKeyVersion, piiMasterKey } from "../pii-cipher"
import { PII_FIELDS, type PiiFieldSpec } from "../pii-fields"
import { cachedDataKey, loadAllDataKeys } from "./pii-keys"

/**
 * ADR-014 D-P3, bước P-5b: đọc cột cá nhân từ bản mã. Gắn ở client Prisma như trường tính toán (`result` extension) —
 * áp cho cả truy vấn trực tiếp lẫn truy vấn lồng (`include`, `select` lồng), Prisma tự lấy thêm `*_enc` và
 * `organization_id`. Dòng chưa có bản mã (chưa mã hoá, hoặc production chưa đặt khoá) → giá trị cột rõ (còn tới P-5c).
 * Khoá dữ liệu phải có sẵn trong bộ nhớ (giải mã đồng bộ, khi mã đọc tới trường): `readWithPiiKeys` quét kết quả thô và
 * nạp khoá còn thiếu trước khi trả về; vẫn thiếu (khoá đã bị xoá) → `PiiKeyMissingError` lúc đọc trường.
 */

export class PiiKeyMissingError extends Error {
  constructor(readonly organizationId: string, readonly version: number) {
    super("Thiếu khoá dữ liệu để giải mã dữ liệu cá nhân")
  }
}

type Row = Record<string, unknown>

function decryptField(row: Row, field: string, spec: PiiFieldSpec): unknown {
  const sealed = row[spec.enc]
  if (typeof sealed !== "string" || !sealed) return row[field]
  const master = piiMasterKey()
  if (!master) return row[field]
  const org = row.organization_id as string
  const version = piiKeyVersion(sealed)
  if (version === null) return row[field]
  const key = cachedDataKey(org, version)
  if (!key) throw new PiiKeyMissingError(org, version)
  try {
    const plain = decryptPii(key, sealed)
    return spec.json ? JSON.parse(plain) : plain
  } catch (error) {
    // P-5b: bản mã hỏng → dùng cột rõ và báo; từ P-5c không còn cột rõ để lùi
    log.error("pii.decrypt_failed", { field, error: error instanceof Error ? error.message : String(error) })
    return row[field]
  }
}

/** Khai báo `result` extension cho mọi cột trong `PII_FIELDS`. */
export function piiResultExtension(): Record<string, Record<string, { needs: Record<string, true>; compute: (row: Row) => unknown }>> {
  const out: Record<string, Record<string, { needs: Record<string, true>; compute: (row: Row) => unknown }>> = {}
  for (const [model, fields] of Object.entries(PII_FIELDS)) {
    out[model] = {}
    for (const [field, spec] of Object.entries(fields as Record<string, PiiFieldSpec>)) {
      out[model]![field] = {
        needs: { [field]: true, [spec.enc]: true, organization_id: true },
        compute: (row) => decryptField(row, field, spec),
      }
    }
  }
  return out
}

/** Cặp (tổ chức, phiên bản khoá) của mọi bản mã trong kết quả thô mà bộ nhớ chưa có khoá. */
function missingKeys(result: unknown, out: Set<string>, depth = 0): void {
  if (depth > 8 || result === null || typeof result !== "object") return
  if (Array.isArray(result)) {
    for (const item of result) missingKeys(item, out, depth + 1)
    return
  }
  if (result instanceof Date || Buffer.isBuffer(result)) return
  const row = result as Row
  const org = typeof row.organization_id === "string" ? row.organization_id : null
  for (const [k, v] of Object.entries(row)) {
    if (org && k.endsWith("_enc") && typeof v === "string") {
      const version = piiKeyVersion(v)
      if (version !== null && !cachedDataKey(org, version)) out.add(`${org}:${version}`)
    } else if (v && typeof v === "object") {
      missingKeys(v, out, depth + 1)
    }
  }
}

/**
 * Chạy lệnh Prisma rồi bảo đảm khoá của mọi bản mã trong kết quả đã ở bộ nhớ — Prisma tính trường giải mã khi mã đọc
 * tới (sau khi lệnh trả về), nên khoá phải có trước. Thiếu → nạp mọi khoá bằng quyền hệ thống (một lần mỗi lần thiếu).
 */
export async function readWithPiiKeys<T>(base: unknown, run: () => Promise<T>): Promise<T> {
  const result = await run()
  const master = piiMasterKey()
  if (!master) return result
  const missing = new Set<string>()
  missingKeys(result, missing)
  if (missing.size > 0) {
    // Bảng khoá thuộc từng tổ chức (RLS): nạp toàn bộ bằng quyền hệ thống — khoá chỉ vào bộ nhớ tiến trình
    await asSystemDb("pii:load-keys", () => loadAllDataKeys(base as Parameters<typeof loadAllDataKeys>[0], master))
  }
  return result
}
