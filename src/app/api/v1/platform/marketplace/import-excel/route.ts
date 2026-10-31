/** POST /api/v1/platform/marketplace/import-excel — nhập tệp khảo sát .xlsx/.xls/.csv (`N16`, tối đa 10 MB). */
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { MAX_EXCEL_BYTES, importMarketplaceExcel } from "@/modules/platform/use-cases/manage-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  if (Number(request.headers.get("content-length")) > MAX_EXCEL_BYTES + 64 * 1024) {
    throw validationFailed({ file: "Tệp vượt quá 10 MB" })
  }
  const file = (await request.formData().catch(() => null))?.get("file")
  if (!(file instanceof File)) throw validationFailed({ file: "Vui lòng đính kèm tệp Excel" })
  const bytes = new Uint8Array(await file.arrayBuffer())
  return jsonResponse({ data: await importMarketplaceExcel(pctx, { name: file.name, bytes }) })
})

export const dynamic = "force-dynamic"
