import { prisma } from "@/core/tenancy/infra/prisma"

/**
 * Tổ chức đối tác có đang liên kết ACTIVE với chuỗi không; nếu có `partnerUserId` thì người đó phải
 * là thành viên ACTIVE của tổ chức đối tác. Dùng trước khi chuỗi đẩy dữ liệu đơn sang đối tác — tránh
 * gửi thông tin khách vào tổ chức tuỳ ý theo id trong body.
 */
export async function isActivePartnerTarget(chainOrgId: string, partnerOrgId: string, partnerUserId?: string | undefined): Promise<boolean> {
  const link = await prisma.chain_partnerships.findFirst({
    where: { chain_org_id: chainOrgId, partner_org_id: partnerOrgId, status: "ACTIVE" },
    select: { id: true },
  })
  if (!link) return false
  if (!partnerUserId) return true
  const member = await prisma.memberships.findFirst({
    where: { organization_id: partnerOrgId, user_id: partnerUserId, status: "ACTIVE" },
    select: { id: true },
  })
  return !!member
}

/**
 * Người được kéo vào chat nội bộ: thành viên ACTIVE của `targetOrgId`, và `targetOrgId` là chính tổ
 * chức người gọi hoặc có liên kết chuỗi–đối tác ACTIVE (chiều nào cũng được) với tổ chức người gọi.
 */
export async function isAllowedChatTarget(callerOrgId: string, targetOrgId: string, targetUserId: string): Promise<boolean> {
  if (targetOrgId !== callerOrgId) {
    const link = await prisma.chain_partnerships.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { chain_org_id: callerOrgId, partner_org_id: targetOrgId },
          { chain_org_id: targetOrgId, partner_org_id: callerOrgId },
        ],
      },
      select: { id: true },
    })
    if (!link) return false
  }
  const member = await prisma.memberships.findFirst({
    where: { organization_id: targetOrgId, user_id: targetUserId, status: "ACTIVE" },
    select: { id: true },
  })
  return !!member
}
