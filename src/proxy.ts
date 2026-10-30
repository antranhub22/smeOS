import { NextResponse, type NextRequest } from "next/server"

import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id"

/**
 * Gắn `x-request-id` cho mọi request (ROADMAP E1.1): giữ mã hợp lệ từ phía
 * trước (Render, CDN), không thì sinh mới; đưa vào header request cho route
 * đọc và trả lại ở header phản hồi để người dùng/hỗ trợ báo lại được.
 */
export function proxy(request: NextRequest) {
  const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER))
  const headers = new Headers(request.headers)
  headers.set(REQUEST_ID_HEADER, requestId)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set(REQUEST_ID_HEADER, requestId)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)"],
}
