/**
 * Nạp hồ sơ khảo sát chợ đối tác từ tệp JSON (định dạng PartnerStoreMarketplaceEntity[])
 * vào bảng `partner_marketplace_stores`. Chạy lại an toàn: upsert theo tên cửa hàng.
 * Ảnh không nạp ở đây — dùng nút "Tải ảnh khảo sát" (cần N17) sau khi nạp.
 *
 *   npm run db:deploy
 *   npx tsx --env-file-if-exists=.env scripts/nap-cho-doi-tac.ts [đường-dẫn.json]
 *
 * Mặc định đọc src/modules/platform/domain/partner-marketplace-data.json.
 */
import { readFileSync } from "node:fs"
import path from "node:path"

import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { MAX_IMPORT_ROWS, type PartnerStoreProfile } from "@/modules/platform/domain/partner-marketplace-row-mapper"
import { PartnerMarketplaceRepository } from "@/modules/platform/infra/partner-marketplace-repository"
import { prisma } from "@/core/tenancy/infra/prisma"

async function main() {
  const file = path.resolve(process.argv[2] ?? "src/modules/platform/domain/partner-marketplace-data.json")
  const raw = JSON.parse(readFileSync(file, "utf8")) as PartnerStoreMarketplaceEntity[]
  if (!Array.isArray(raw)) throw new Error("Tệp phải là một mảng hồ sơ")
  const profiles: PartnerStoreProfile[] = raw
    .slice(0, MAX_IMPORT_ROWS)
    .filter((s) => s?.identity?.shopName?.trim())
    .map((s) => {
      const { id: _id, ...rest } = s
      const { coverPhotoUrl: _c, photoGalleryUrls: _g, ...media } = rest.media
      return { ...rest, media }
    })
  const result = await new PartnerMarketplaceRepository().upsertMany(profiles, "SEED")
  console.log(`Đã nạp: ${result.added} mới, ${result.updated} cập nhật, tổng ${result.total} cửa hàng.`)
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
