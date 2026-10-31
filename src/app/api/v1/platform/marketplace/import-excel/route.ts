import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { importMarketplaceExcel } from "@/modules/platform/infra/import-marketplace-excel"

/**
 * POST /api/v1/platform/marketplace/import-excel
 * Nhận file Excel (.xlsx, .xls, .csv), parse và cập nhật danh sách cửa hàng
 */
export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  void pctx

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || typeof file === "string") {
    return jsonResponse(
      { success: false, error: "Vui lòng đính kèm file Excel (.xlsx, .xls, .csv)." },
      { status: 400 }
    )
  }

  const uploadedFile = file as File
  const maxBytes = 25 * 1024 * 1024 // 25 MB
  if (uploadedFile.size > maxBytes) {
    return jsonResponse(
      { success: false, error: "Dung lượng file vượt quá giới hạn 25MB." },
      { status: 400 }
    )
  }

  const arrayBuffer = await uploadedFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const result = await importMarketplaceExcel(buffer)

  if (result.error) {
    return jsonResponse({ success: false, error: result.error }, { status: 400 })
  }

  return jsonResponse({
    success: true,
    data: {
      added: result.added,
      updated: result.updated,
      total: result.total,
      durationMs: result.durationMs,
    },
  })
})

export const dynamic = "force-dynamic" as const

