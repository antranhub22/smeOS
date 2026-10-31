/**
 * Hạ tầng phụ cho cổng nhận đơn (`ingestOrder`) — tách khỏi `order-repository.ts` để giữ trần 350 dòng.
 * `docs/kien-truc/KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md` §3.3, §4.
 */

import { conflict, notFound } from "@/core/http/errors"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"

/**
 * Lead → đơn, gọi TRONG giao dịch tạo đơn: chỉ lead cùng tổ chức (khác tổ chức → 404), chưa thành đơn
 * (đã thành đơn → 409). Lead chuyển `WON` và nhớ đơn đã chuyển thành.
 */
export async function linkLeadToOrder(
  tx: Prisma.TransactionClient,
  organizationId: string,
  leadId: string,
  orderId: string,
): Promise<void> {
  const lead = await tx.leads.findFirst({
    where: { id: leadId, organization_id: organizationId },
    select: { id: true, converted_order_id: true },
  })
  if (!lead) throw notFound()
  if (lead.converted_order_id) throw conflict("Khách tiềm năng này đã thành đơn trước đó")
  await tx.leads.update({
    where: { id: lead.id },
    data: { converted_order_id: orderId, status: "WON", status_changed_at: new Date() },
  })
}

/** Người dùng là thành viên đang hoạt động của tổ chức (kiểm sale phụ trách). */
export async function isActiveOrgMember(organizationId: string, userId: string): Promise<boolean> {
  const n = await prisma.memberships.count({ where: { organization_id: organizationId, user_id: userId, status: "ACTIVE" } })
  return n > 0
}
