/**
 * Vòng đời xoá asset (SDAGF P1, audit `docs/audit/sdagf-2026-10`).
 *
 * - Legal hold (D-04): còn hạn giữ thì không xoá vĩnh viễn, kể cả cron.
 * - Hàng đợi xoá payload thử lại có giới hạn rồi dừng — tệp sót lại do job
 *   đối soát xử lý, không lặp vô hạn.
 *
 * Thuần: không import hạ tầng.
 */
export const MAX_OUTBOX_ATTEMPTS = 5

export function isUnderLegalHold(asset: { legal_hold_until?: Date | null | undefined }, now: Date): boolean {
  return asset.legal_hold_until != null && asset.legal_hold_until.getTime() > now.getTime()
}
