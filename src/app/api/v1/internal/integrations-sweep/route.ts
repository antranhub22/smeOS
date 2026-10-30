/**
 * POST /api/v1/internal/integrations-sweep — cron: xử lý sự kiện tích hợp đến hạn và kiểm sức khoẻ kết nối.
 * Gác bằng CRON_SECRET. Mỗi lượt có giới hạn (100 sự kiện, 50 kết nối).
 *   curl -X POST http://localhost:3100/api/v1/internal/integrations-sweep -H "x-cron-secret: dev"
 */

import { handle, jsonResponse } from "@/core/http/response"
import { AppError } from "@/core/http/errors"
import { isAuthorizedCronRequest } from "@/core/http/cron-auth"
import { processDueEvents } from "@/modules/integration-hub/use-cases/process-due-events"
import { runHealthChecks } from "@/modules/integration-hub/use-cases/run-health-checks"

export const POST = handle(async (req) => {
  if (!isAuthorizedCronRequest(req)) throw new AppError("UNAUTHENTICATED", "Không được phép")
  const events = await processDueEvents()
  const health = await runHealthChecks()
  return jsonResponse({ events, health })
})
