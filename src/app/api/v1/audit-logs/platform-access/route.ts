import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { listPlatformAccessLogs } from "@/modules/audit/use-cases/list-platform-access-logs"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

/** Nhân viên nền tảng đã truy cập dữ liệu của tổ chức (ADR-013 D-I5, D-60) — cùng quyền với nhật ký kiểm toán (G9). */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "G9")
  const url = new URL(request.url)
  const limitParam = url.searchParams.get("limit")
  const limit = limitParam === null ? undefined : Number(limitParam)
  if (limit !== undefined && !Number.isInteger(limit)) throw validationFailed({ limit: "Phải là số nguyên" })
  return jsonResponse(await listPlatformAccessLogs(ctx, { limit, cursor: url.searchParams.get("cursor") }))
})
