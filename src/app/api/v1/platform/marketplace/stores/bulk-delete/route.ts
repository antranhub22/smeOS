/**
 * POST /api/v1/platform/marketplace/stores/bulk-delete — xoá hàng loạt hồ sơ chợ đối tác (`N18`, chỉ superadmin).
 * Body `{ ids: string[] }` (1–500 hồ sơ đã chọn) hoặc `{ all: true, expectedTotal }` (toàn bộ, phải khớp số hồ sơ hiện có).
 */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { MAX_BULK_DELETE_IDS, deleteMarketplaceStores } from "@/modules/platform/use-cases/delete-partner-marketplace-store"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

const BodySchema = z.union([
  z.object({ ids: z.array(z.string().uuid()).min(1).max(MAX_BULK_DELETE_IDS) }).strict(),
  z.object({ all: z.literal(true), expectedTotal: z.number().int().min(1) }).strict(),
])

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ body: "Yêu cầu xoá không hợp lệ" })
  return jsonResponse({ data: await deleteMarketplaceStores(pctx, parsed.data) })
})

export const dynamic = "force-dynamic"
