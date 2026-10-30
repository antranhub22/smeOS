import { log } from "@/core/observability/log"
import { requestIdOf, runWithRequestId } from "@/core/observability/request-context"

import { AppError } from "./errors"

export function jsonResponse(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string | string[]> }
): Response {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" })
  // `string[]` cho một khoá — cần khi một response phải đặt NHIỀU Set-Cookie
  // cùng lúc (Unified Shell B1: cookie phiên hiện có + cookie JWT liên-app),
  // điều `Headers.set` không làm được vì nó ghi đè thay vì cộng dồn.
  for (const [key, value] of Object.entries(init?.headers ?? {})) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v)
    } else {
      headers.append(key, value)
    }
  }
  const status = init?.status ?? 200
  // 204/205/304 không được có body — `new Response("null", { status: 204 })` ném TypeError → 500 sau khi đã ghi xong.
  if (status === 204 || status === 205 || status === 304) {
    headers.delete("content-type")
    return new Response(null, { status, headers })
  }
  return new Response(JSON.stringify(body), { status, headers })
}

export function errorResponse(error: unknown, where?: { method: string; path: string }): Response {
  if (error instanceof AppError) {
    return jsonResponse(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.status }
    )
  }

  // Lỗi ngoài dự kiến không lộ chi tiết ra ngoài (`YC-S`, đặc tả 06 mục 2).
  // SLI lỗi máy chủ theo route (SLO v1, OPERATIONS_RUNBOOK §10); `requestId` tự gắn khi trong `handle()`.
  log.error("http.internal_error", {
    ...where,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })
  return jsonResponse(
    { error: { code: "INTERNAL", message: "Lỗi hệ thống" } },
    { status: 500 }
  )
}

/**
 * Bọc một handler để mọi `AppError` ném ra đều thành đáp ứng đúng hình dạng.
 *
 * Generic theo `Args` để cùng một `handle` dùng được cho cả route tĩnh (chỉ
 * `request`) lẫn route động của Next.js, vốn gọi handler bằng
 * `(request, { params })` với `params` là một `Promise` (Next 16).
 */
export function handle<Args extends unknown[]>(
  fn: (request: Request, ...args: Args) => Promise<Response>
) {
  return async (request: Request, ...args: Args): Promise<Response> => {
    // Mã yêu cầu do `src/proxy.ts` gắn — `log` và job tạo trong handler tự nhận (E1.1).
    return runWithRequestId(requestIdOf(request), async () => {
      try {
        return await fn(request, ...args)
      } catch (error) {
        return errorResponse(error, { method: request.method, path: new URL(request.url).pathname })
      }
    })
  }
}
