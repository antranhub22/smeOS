import { validationFailed } from "@/core/http/errors"
import { MAX_EXCEL_BYTES } from "@/modules/platform/use-cases/manage-partner-marketplace"

/** Đọc multipart có trường `file` (chặn sớm tệp quá 10 MB theo content-length). */
export async function readExcelUpload(request: Request): Promise<{ form: FormData; file: { name: string; bytes: Uint8Array } }> {
  if (Number(request.headers.get("content-length")) > MAX_EXCEL_BYTES + 64 * 1024) {
    throw validationFailed({ file: "Tệp vượt quá 10 MB" })
  }
  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!form || !(file instanceof File)) throw validationFailed({ file: "Vui lòng đính kèm tệp Excel" })
  return { form, file: { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) } }
}
