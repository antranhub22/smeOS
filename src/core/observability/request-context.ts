import { AsyncLocalStorage } from "node:async_hooks"

import { REQUEST_ID_HEADER } from "./request-id"

/**
 * Ngữ cảnh theo request: `handle()` chạy handler trong đây để `log` và
 * `generation_jobs.request_id` tự nhận mã yêu cầu mà không phải truyền qua
 * từng use-case.
 */
const store = new AsyncLocalStorage<{ requestId: string }>()

export function runWithRequestId<T>(requestId: string | null | undefined, fn: () => T): T {
  if (!requestId) return fn()
  return store.run({ requestId }, fn)
}

export function currentRequestId(): string | undefined {
  return store.getStore()?.requestId
}

export function requestIdOf(request: Request): string | null {
  return request.headers.get(REQUEST_ID_HEADER)
}
