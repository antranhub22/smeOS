import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"
import { env } from "@/lib/env"

/**
 * Thể hiện `PrismaClient` duy nhất của cả hệ thống.
 *
 * Chỉ tệp nằm trong một thư mục `infra/` được import tệp này hoặc
 * `@/generated/prisma`. Module import thẳng client là đi vòng qua bộ gác tổ
 * chức, nên đó là lỗi chặn ở review — và có test khoá:
 * `tests/tenant/khong-import-prisma-ngoai-infra.test.ts`.
 *
 * Prisma 7 nối vào cơ sở dữ liệu qua driver adapter, nên chuỗi kết nối chỉ
 * xuất hiện ở đây và ở `prisma.config.ts`.
 */
const globalForPrisma = globalThis as unknown as {
  floraosPrisma?: PrismaClient
  schemaVersion?: string
}

const CURRENT_SCHEMA_VERSION = "2026-10-25-chain-partnership-v1"
if (globalForPrisma.schemaVersion !== CURRENT_SCHEMA_VERSION) {
  globalForPrisma.floraosPrisma?.$disconnect?.().catch(() => {})
  delete globalForPrisma.floraosPrisma
  globalForPrisma.schemaVersion = CURRENT_SCHEMA_VERSION
}

export const prisma: PrismaClient =
  globalForPrisma.floraosPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.floraosPrisma = prisma
}
