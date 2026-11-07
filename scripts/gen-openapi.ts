/**
 * gen-openapi.ts — sinh OpenAPI 3.1 của Integration API từ lược đồ zod
 * (`src/modules/integration/contracts/integration-openapi.ts`, audit API đợt 4).
 *
 *   npm run gen:openapi      ghi lại tệp
 *   npm run check:openapi    chỉ kiểm, thoát 1 nếu tệp cũ
 *
 * CI không cần bước riêng: `tests/unit/integration/integration-openapi.test.ts` (chạy trong `npm test`)
 * so cùng nội dung này với tệp đã commit.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { serializeOpenApi } from "../src/core/http/openapi"
import { buildIntegrationOpenApi, INTEGRATION_OPENAPI_PATH } from "../src/modules/integration/contracts/integration-openapi"

const check = process.argv.includes("--check")
const target = path.resolve(__dirname, "..", INTEGRATION_OPENAPI_PATH)
const text = serializeOpenApi(buildIntegrationOpenApi())
// Đọc thẳng, bắt ENOENT — không `existsSync` rồi mới đọc/ghi (CodeQL js/file-system-race).
function readCurrent(): string | null {
  try {
    return readFileSync(target, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}
const current = readCurrent()

if (check) {
  if (current !== text) {
    console.error(`[openapi] ${INTEGRATION_OPENAPI_PATH} LỆCH mã — chạy \`npm run gen:openapi\` rồi commit cùng thay đổi zod.`)
    process.exit(1)
  }
  console.log(`[openapi] ${INTEGRATION_OPENAPI_PATH} khớp mã.`)
} else if (current === text) {
  console.log(`[openapi] ${INTEGRATION_OPENAPI_PATH} không đổi.`)
} else {
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, text)
  console.log(`[openapi] đã ghi ${INTEGRATION_OPENAPI_PATH}.`)
}
