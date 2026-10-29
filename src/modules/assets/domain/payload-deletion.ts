/**
 * Luật xoá payload trên kho khi xoá vĩnh viễn một asset (SDAGF-012, audit
 * `docs/audit/sdagf-2026-10/05-risk-register.md` R-03).
 *
 * Chỉ xoá khoá nằm dưới `org/<tổ chức của phiên>/` — khoá do máy chủ dựng
 * (`storage-key.ts`). Khoá khác (`videos/…`, khoá cũ, khoá hỏng) giữ nguyên
 * cho job đối soát xử lý sau, không đoán.
 *
 * Thuần: không import hạ tầng.
 */
export function payloadKeysToPurge(
  organizationId: string,
  asset: { storage_key: string; thumb_key: string | null }
): string[] {
  const prefix = `org/${organizationId}/`
  const keys = [asset.storage_key, asset.thumb_key].filter(
    (key): key is string => typeof key === "string" && key.startsWith(prefix) && !key.includes("..")
  )
  return [...new Set(keys)]
}
