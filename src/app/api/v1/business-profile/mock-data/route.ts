import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { applyIndustryMockData } from "@/modules/profiles/use-cases/apply-industry-mock-data"

const requestSchema = z
  .object({
    industry_key: z.string().optional(),
  })
  .optional()

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  // Chỉ cho phép người dùng có quyền F2 (Sửa hồ sơ) hoặc H4 (Toàn quyền điều hành)
  requireCapability(ctx, "F2")

  const body = await request.json().catch(() => ({}))
  const parsed = requestSchema?.safeParse(body)
  const targetIndustry = parsed?.success ? parsed.data?.industry_key : undefined

  const result = await applyIndustryMockData(ctx, targetIndustry)

  return jsonResponse({
    success: true,
    data: result,
  })
})
