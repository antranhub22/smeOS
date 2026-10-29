import { type TaskUiState, taskStateFromBackend } from "@/lib/ui-system/task-state"
import type { ProductPhotoResult } from "@/modules/product-photo-studio/use-cases/get-product-photo-result"

/** Hỏi lại mỗi 2 giây, tối đa 5 phút — vòng lặp luôn có giới hạn (CLAUDE.md #5). */
export const POLL_INTERVAL_MS = 2000
export const MAX_POLLS = 150

export interface CreatedPhotoJob {
  jobId: string
  costCredit: number | null
  balanceAfter: number | null
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

/**
 * `POST /api/v1/product-photo` trả `{ job_id, status, usage: { cost_credit, balance_after } }`
 * (không bọc trong `data`). Chấp nhận cả dạng bọc để không vỡ nếu API đổi sang chuẩn `{ data }`.
 */
export function parseCreatedPhotoJob(body: unknown): CreatedPhotoJob | null {
  if (!body || typeof body !== "object") return null
  const root = body as Record<string, unknown>
  const src = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>
  const jobId = src.job_id ?? src.jobId
  if (typeof jobId !== "string" || !jobId) return null
  const usage = (src.usage && typeof src.usage === "object" ? src.usage : {}) as Record<string, unknown>
  return { jobId, costCredit: num(usage.cost_credit), balanceAfter: num(usage.balance_after) }
}

export interface PolledPhotoJob {
  state: TaskUiState | null
  result: ProductPhotoResult | null
  error: string | null
}

/** `GET /api/v1/product-photo/:id` trả thẳng `ProductPhotoResult` (không bọc `data`). */
export function parsePolledPhotoJob(body: unknown): PolledPhotoJob {
  if (!body || typeof body !== "object") return { state: null, result: null, error: null }
  const root = body as Record<string, unknown>
  const src = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>
  const state = taskStateFromBackend(typeof src.status === "string" ? src.status : null)
  const error = typeof src.error === "string" && src.error ? src.error : null
  return { state, result: state === "succeeded" ? (src as unknown as ProductPhotoResult) : null, error }
}

/** Khoá nhớ tác vụ đang chạy để mở lại trang vẫn thấy kết quả — gắn tổ chức (03c UX-022). */
export function photoJobStorageKey(organizationId: string | null | undefined): string | null {
  return organizationId ? `smeos.anh-san-pham.lastJobId__${organizationId}` : null
}

export function newIdempotencyKey(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `photo-enhance-${rand}`
}
