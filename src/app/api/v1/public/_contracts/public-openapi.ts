import { buildOpenApiDocument, type OpenApiOperation } from "@/core/http/openapi"

import { CATALOG_OPERATIONS } from "./ops-catalog"
import { UTILITY_OPERATIONS } from "./ops-utility"

/**
 * OpenAPI 3.1 của bề mặt công khai `/api/v1/public/*` (audit API đợt 6, PO 07/11/2026): trang khách Thẻ
 * chào, catalog công khai, link gia công chi nhánh, webhook nhà cung cấp, tiện ích. Tệp sinh ra:
 * `docs/spec/contracts/openapi/public.openapi.json` (`npm run gen:openapi`) — không sửa tay.
 * `tests/unit/public/public-openapi.test.ts` đỏ khi tệp cũ hoặc khi route và danh sách dưới đây lệch nhau.
 */
export const PUBLIC_OPENAPI_PATH = "docs/spec/contracts/openapi/public.openapi.json"

export const PUBLIC_OPERATIONS: OpenApiOperation[] = [...CATALOG_OPERATIONS, ...UTILITY_OPERATIONS]

export function buildPublicOpenApi(): Record<string, unknown> {
  return buildOpenApiDocument({
    title: "SMEOS Public API",
    version: "1.0.0",
    description: [
      "Endpoint không cần đăng nhập. Tổ chức luôn suy từ mã gửi / slug / token / khoá webhook phía máy chủ,",
      "không nhận từ thân yêu cầu. Mọi route có giới hạn tần suất (header `RateLimit-*`, 429 kèm `Retry-After`).",
      "Lỗi theo envelope `Error`, trừ vài webhook ghi rõ ở từng operation.",
    ].join(" "),
    serverUrl: "/api/v1",
    securitySchemes: {
      connectorSignature: { type: "apiKey", in: "header", name: "x-signature", description: "Chữ ký HMAC theo từng đầu nối (tên header do đầu nối quy định, vd. `x-echo-signature`)" },
      sepayApiKey: { type: "apiKey", in: "header", name: "authorization", description: "`Apikey <khoá webhook của tiệm>`" },
      zaloSignature: { type: "apiKey", in: "header", name: "x-zevent-signature", description: "`mac=<sha256(app_id + thân + timestamp + secret)>`" },
    },
    operations: PUBLIC_OPERATIONS,
  })
}
