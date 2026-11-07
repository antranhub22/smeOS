import { ZodError } from "zod"

import { captureError } from "@/core/observability/error-tracker"
import { dbContextForPath, runWithDbContext } from "@/core/tenancy/db-context"
import { log } from "@/core/observability/log"
import { currentRequestMeta, requestIdOf, runWithRequestMeta } from "@/core/observability/request-context"

import { AppError, validationFailed } from "./errors"
import { clientIp } from "./rate-limit"
import { auditDenied, auditMutation, userAgentOf } from "./request-audit"

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

/**
 * Lỗi dữ liệu đầu vào lọt khỏi route thành `AppError` 400 (audit API-01): `schema.parse` ở route
 * hoặc use-case ném `ZodError` — mọi chỗ gọi đều parse dữ liệu người dùng gửi — từng thành 500.
 * `details.issues` cùng dạng các route dùng `safeParse`.
 */
function asAppError(error: unknown): AppError | null {
  if (error instanceof AppError) return error
  if (error instanceof ZodError) return validationFailed({ issues: error.issues })
  return null
}

/**
 * Thân không phải JSON hợp lệ (rỗng, cắt cụt, sai cú pháp) → 400 thay vì 500 (audit API-01).
 * Chỉ bọc `request.json()` của chính request này, nên `JSON.parse` ở chỗ khác vẫn là lỗi máy chủ.
 * Route đang `.catch(() => null)` vẫn nhận `null` như cũ.
 */
function guardJsonBody(request: Request): void {
  const read = request.json.bind(request)
  request.json = () =>
    read().catch((error: unknown) => {
      throw error instanceof SyntaxError ? validationFailed({ body: "Thân yêu cầu không phải JSON hợp lệ" }) : error
    })
}

/**
 * `RateLimit-Limit/Remaining/Reset` (giây tới lúc mở lại) và `Retry-After` khi 429, theo luật chặt
 * nhất mà `enforceRateLimit` đã đếm trong request (đặc tả 06 §2, audit API-08). Route không giới hạn
 * tần suất thì không có header nào.
 */
function withRateLimitHeaders(response: Response, now = Date.now()): Response {
  const state = currentRequestMeta()?.rateLimit
  if (!state) return response
  const resetSeconds = String(Math.max(1, Math.ceil((state.resetAt - now) / 1000)))
  try {
    response.headers.set("RateLimit-Limit", String(state.limit))
    response.headers.set("RateLimit-Remaining", String(state.remaining))
    response.headers.set("RateLimit-Reset", resetSeconds)
    if (response.status === 429) response.headers.set("Retry-After", resetSeconds)
  } catch {
    // Header bất biến (vd. `Response.redirect`) — giữ nguyên phản hồi, chỉ thiếu header tần suất
  }
  return response
}

export function errorResponse(error: unknown, where?: { method: string; path: string }): Response {
  const known = asAppError(error)
  if (known) {
    return jsonResponse(
      {
        error: {
          code: known.code,
          message: known.message,
          ...(known.details ? { details: known.details } : {}),
        },
      },
      { status: known.status }
    )
  }

  // Lỗi ngoài dự kiến không lộ chi tiết ra ngoài (`YC-S`, đặc tả 06 mục 2).
  // SLI lỗi máy chủ theo route (SLO v1, OPERATIONS_RUNBOOK §10); `requestId` tự gắn khi trong `handle()`.
  captureError(error, where)
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
    // Mã yêu cầu do `src/proxy.ts` gắn — `log` và job tạo trong handler tự nhận (E1.1). IP và thiết
    // bị đi cùng để `audit_logs` tự điền (checklist ALG 1.17).
    const meta = { requestId: requestIdOf(request) ?? undefined, ip: clientIp(request), userAgent: userAgentOf(request) }
    // Ngữ cảnh CSDL cho RLS (checklist ALG 1.18): `requireTenantContext` gắn tổ chức sau khi xác thực
    const dbContext = dbContextForPath(new URL(request.url).pathname)
    return runWithRequestMeta(meta, () => runWithDbContext(dbContext, async () => {
      try {
        guardJsonBody(request)
        const response = await fn(request, ...args)
        await auditMutation(request, response)
        return withRateLimitHeaders(response)
      } catch (error) {
        await auditDenied(request, error)
        return withRateLimitHeaders(errorResponse(error, { method: request.method, path: new URL(request.url).pathname }))
      }
    }))
  }
}
