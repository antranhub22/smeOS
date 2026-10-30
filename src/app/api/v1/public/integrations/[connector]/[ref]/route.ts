/**
 * POST /api/v1/public/integrations/:connector/:ref — cổng webhook chung của Trung tâm Tích hợp.
 * Không phiên: xác thực bằng chữ ký của đầu nối; `ref` là mã ngẫu nhiên của kết nối, không phải id tổ chức.
 * Có giới hạn tần suất theo IP và theo kết nối.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { handleInboundWebhook } from "@/modules/integration-hub/use-cases/handle-inbound-webhook"

export const POST = handle(async (req, context: { params: Promise<{ connector: string; ref: string }> }) => {
  const { connector, ref } = await context.params
  await enforceRateLimit(req, { scope: "integration-webhook", limit: 300, windowMs: 60_000 })
  await enforceRateLimit(req, { scope: "integration-webhook-ref", limit: 600, windowMs: 60_000, subject: ref })
  const rawBody = await req.text()
  const result = await handleInboundWebhook({ connectorKey: connector, connectionRef: ref, rawBody, headers: req.headers })
  return jsonResponse(result)
})
