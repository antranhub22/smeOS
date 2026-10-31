/** GET /api/v1/integrations — tổng quan, danh mục theo tầng/gói và kết nối của tổ chức (W1). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getIntegrationHub } from "@/modules/integration-hub/use-cases/get-integration-hub"

export const GET = handle(async (req) => {
  const { ctx } = await requireTenantContext(req)
  return jsonResponse(await getIntegrationHub(ctx))
})
