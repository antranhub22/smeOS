/**
 * Domain Types for Trash Bin (Thùng rác lưu trữ 30 ngày).
 * Pure TypeScript — No Prisma or external infrastructure imports.
 */

export type TrashItemType = "RAW_ASSET" | "APPROVED_ANALYSIS" | "PRODUCT"

export interface TrashItem {
  id: string
  type: TrashItemType
  name: string
  code?: string | null | undefined
  imageUrl?: string | null | undefined
  trashedAt: string
  trashedBy?: string | null | undefined
  expiresAt: string
  daysRemaining: number
  priceVnd?: number | null | undefined
  category?: string | null | undefined
}

export interface TrashMeta {
  trashed_at: string
  trashed_by?: string | null | undefined
  expires_at: string
}

/** Số ngày một mục nằm trong thùng rác trước khi bị dọn vĩnh viễn. */
export const TRASH_RETENTION_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Hạn dọn của mục đưa vào thùng rác lúc `trashedAt`. */
export function trashExpiresAt(trashedAt: Date): Date {
  return new Date(trashedAt.getTime() + TRASH_RETENTION_DAYS * DAY_MS)
}

export function calculateDaysRemaining(expiresAtIso: string): number {
  const expiresAt = new Date(expiresAtIso).getTime()
  const now = Date.now()
  const diffMs = expiresAt - now
  return Math.max(0, Math.ceil(diffMs / DAY_MS))
}

export function createTrashMeta(userId?: string | null | undefined): TrashMeta {
  const now = new Date()
  const expiresAt = trashExpiresAt(now)
  return {
    trashed_at: now.toISOString(),
    trashed_by: userId ?? null,
    expires_at: expiresAt.toISOString(),
  }
}
