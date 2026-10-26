import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { validationFailed } from "@/core/http/errors"
import { isKnownIndustryKey } from "@/modules/organization/domain/industry-profile"
import { applyIndustryMockData } from "@/modules/profiles/use-cases/apply-industry-mock-data"

// Mã ngành lạ từng được ghi thẳng vào settings.industry (rà soát lại cụm J, 23/10/2026)
const requestSchema = z
  .object({
    industry_key: z.string().refine(isKnownIndustryKey, "Ngành nghề không hợp lệ").optional(),
  })
  .optional()

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  // Cho phép người dùng có quyền F2 (Sửa hồ sơ), H4 (Toàn quyền điều hành) hoặc N1/N12 (SuperAdmin / Vận hành)
  if (!ctx.capabilities.has("F2") && !ctx.capabilities.has("H4") && !ctx.capabilities.has("N1") && !ctx.capabilities.has("N12")) {
    requireCapability(ctx, "F2")
  }

  const body = await request.json().catch(() => ({}))
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const targetIndustry = parsed.data?.industry_key

  const result = await applyIndustryMockData(ctx, targetIndustry)

  return jsonResponse({
    success: true,
    data: result,
  })
})
