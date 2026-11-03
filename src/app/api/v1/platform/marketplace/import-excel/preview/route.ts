/**
 * POST /api/v1/platform/marketplace/import-excel/preview — đọc tiêu đề tệp khảo sát và tự ghép
 * cột theo tên (`N17`). Không ghi dữ liệu; người nhập duyệt bảng ghép rồi gọi `import-excel`.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { previewMarketplaceExcel } from "@/modules/platform/use-cases/manage-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { readExcelUpload } from "../read-excel-upload"

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const { file } = await readExcelUpload(request)
  return jsonResponse({ data: await previewMarketplaceExcel(pctx, file) })
})

export const dynamic = "force-dynamic"
