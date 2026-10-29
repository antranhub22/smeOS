import { prisma } from "@/core/tenancy/infra/prisma"

export type ExpiredTrashedAsset = {
  id: string
  organization_id: string
  storage_key: string
  thumb_key: string | null
}

/**
 * Asset trong thùng rác đã quá `purge_after`, không còn legal hold — của MỌI
 * tổ chức. Chỉ cron hệ thống gọi (`sweep-expired-trash.ts`); mỗi dòng mang
 * `organization_id` của chính nó để xoá dưới ngữ cảnh đúng tổ chức.
 */
export function findExpiredTrashedAssets(now: Date, limit: number): Promise<ExpiredTrashedAsset[]> {
  return prisma.assets.findMany({
    where: {
      state: "ARCHIVED",
      purge_after: { lte: now },
      OR: [{ legal_hold_until: null }, { legal_hold_until: { lte: now } }],
    },
    orderBy: { purge_after: "asc" },
    take: limit,
    select: { id: true, organization_id: true, storage_key: true, thumb_key: true },
  })
}
