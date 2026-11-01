import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import {
  createPrintRenditionUseCase,
} from "@/modules/print/use-cases/create-print-rendition.use-case"
import { listPrintRenditionsUseCase } from "@/modules/print/use-cases/list-print-renditions.use-case"
import {
  createPrintRenditionSchema,
  type PrintRenditionStatus,
} from "@/modules/print/domain/print-rendition"
import type { PrintPresetCode } from "@/modules/print/domain/print-preset"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M5") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M5")
  }

  const url = new URL(request.url)
  const presetCode = (url.searchParams.get("preset_code") as PrintPresetCode) ?? undefined
  const status = (url.searchParams.get("status") as PrintRenditionStatus) ?? undefined
  const sourceType = url.searchParams.get("source_type") ?? undefined

  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  const offset = url.searchParams.has("offset") ? Number(url.searchParams.get("offset")) : 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw validationFailed({ offset: "offset phải là số nguyên không âm" })
  }

  const result = await listPrintRenditionsUseCase(ctx, {
    presetCode,
    status,
    sourceType,
    limit,
    offset,
  })

  return jsonResponse({
    data: result.items,
    total: result.total,
    limit,
    offset,
  })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M5")

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = createPrintRenditionSchema.safeParse(raw)
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      details[issue.path.join(".")] = issue.message
    }
    throw validationFailed(details)
  }

  const rendition = await createPrintRenditionUseCase(ctx, parsed.data)

  return jsonResponse({ data: rendition }, { status: 201 })
})
