import { log } from "@/core/observability/log"

import { prisma } from "./prisma"

/** Kiểm CSDL còn trả lời không — không đọc bảng nào, không trả dữ liệu. Lỗi chỉ vào log. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    log.error("health.database_unreachable", {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
