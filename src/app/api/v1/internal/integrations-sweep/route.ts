/**
 * POST /api/v1/internal/integrations-sweep — cron: xử lý sự kiện tích hợp đến hạn, kiểm sức khoẻ kết nối và kéo đơn kênh bán dự phòng.
 * Gác bằng CRON_SECRET. Mỗi lượt có giới hạn (100 sự kiện, 50 lượt kiểm, 20 kết nối kênh bán).
 *   curl -X POST http://localhost:3100/api/v1/internal/integrations-sweep -H "x-cron-secret: dev"
 */

import { handle, jsonResponse } from "@/core/http/response"
import { AppError } from "@/core/http/errors"
import { isAuthorizedCronRequest } from "@/core/http/cron-auth"
import { processDueEvents } from "@/modules/integration-hub/use-cases/process-due-events"
import { runHealthChecks } from "@/modules/integration-hub/use-cases/run-health-checks"
import { pollChannelOrders } from "@/modules/integration-hub/use-cases/poll-channel-orders"

export const POST = handle(async (req) => {
  if (!isAuthorizedCronRequest(req)) throw new AppError("UNAUTHENTICATED", "Không được phép")
  const events = await processDueEvents()
  const health = await runHealthChecks()
  const orders = await pollChannelOrders()
  return jsonResponse({ events, health, orders })
})
