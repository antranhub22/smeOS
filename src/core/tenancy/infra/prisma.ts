import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"
import { env } from "@/lib/env"
import { RlsPool } from "./rls-pool"

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
  smeosPrisma?: PrismaClient
  schemaVersion?: string
}

const CURRENT_SCHEMA_VERSION = "2026-10-27-notification-matrix-v1"
if (globalForPrisma.schemaVersion !== CURRENT_SCHEMA_VERSION) {
  globalForPrisma.smeosPrisma?.$disconnect?.().catch(() => {})
  delete globalForPrisma.smeosPrisma
  globalForPrisma.schemaVersion = CURRENT_SCHEMA_VERSION
}

export const prisma: PrismaClient =
  globalForPrisma.smeosPrisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      // RLS (ADR-013 D-I3, checklist ALG 1.18): pool tự đặt `app.org_id` theo ngữ cảnh của luồng đang chạy
      new RlsPool({
        connectionString: env.DATABASE_URL,
        // ADR-015 D-O5: pool có trần rõ ràng và tên ứng dụng để `pg_stat_activity` phân biệt dịch vụ.
        max: env.DATABASE_POOL_MAX,
        application_name: "smeos-web",
      }, env.DB_RLS_MODE),
    ),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.smeosPrisma = prisma
}
