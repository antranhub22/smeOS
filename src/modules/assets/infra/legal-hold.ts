import { prisma } from "@/core/tenancy/infra/prisma"

/**
 * Đặt/gỡ legal hold cho một asset của `organizationId`. Chỉ dùng từ console
 * vận hành nền tảng (N14) — nơi chỉ có `organizationId`, không có phiên
 * tenant. Trả `null` khi asset không thuộc tổ chức đó.
 */
export async function setLegalHoldUntil(
  organizationId: string,
  assetId: string,
  until: Date | null
): Promise<{ before: Date | null } | null> {
  const asset = await prisma.assets.findFirst({
    where: { id: assetId, organization_id: organizationId },
    select: { legal_hold_until: true },
  })
  if (!asset) return null
  await prisma.assets.updateMany({
    where: { id: assetId, organization_id: organizationId },
    data: { legal_hold_until: until },
  })
  return { before: asset.legal_hold_until }
}
