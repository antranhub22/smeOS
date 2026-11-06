/**
 * Ghi kép `chain_partnerships` → `organization_links` (ADR-012 D-T3, bước T-2).
 *
 * Mỗi lần repository đối tác ghi một liên kết, gọi `syncOrganizationLink` trong CÙNG giao dịch. Dòng
 * `organization_links` dùng lại id của `chain_partnerships`, nên chép lại bao nhiêu lần cũng ra một dòng.
 * Cạnh chính (`is_primary`) giữ đúng luật hiện hành: liên kết ACTIVE sớm nhất của tổ chức con.
 * T-3a: mọi đường ĐỌC đã ở `organization_links` (lọc bằng `CHAIN_LINK_TYPES`); ghi kép giữ tới T-3b để còn quay
 * lui được bản phát hành trước, rồi T-3b ghi thẳng bảng này và xoá `chain_partnerships`.
 */
import type { DbClient } from "./db-client"

/** Loại cạnh là quan hệ chuỗi → cửa hàng; `INDUSTRY_MEMBER`, `AFFILIATE` (tầng Ngành) không phải. */
export const CHAIN_LINK_TYPES = ["SUBCONTRACTOR", "FRANCHISE"] as const
/** Điều kiện `where` cho cạnh chuỗi đang hiệu lực — mọi đường đọc quan hệ chuỗi–đối tác dùng chung. */
export const ACTIVE_CHAIN_LINK = { status: "ACTIVE" as const, link_type: { in: [...CHAIN_LINK_TYPES] } }
const STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED"] as const
type LinkStatus = (typeof STATUSES)[number]

function toStatus(value: string): LinkStatus {
  return (STATUSES as readonly string[]).includes(value) ? (value as LinkStatus) : "PENDING"
}

export async function syncOrganizationLink(db: DbClient, partnershipId: string): Promise<void> {
  const p = await db.chain_partnerships.findUniqueOrThrow({ where: { id: partnershipId } })
  const status = toStatus(p.status)
  const data = {
    parent_org_id: p.chain_org_id,
    child_org_id: p.partner_org_id,
    // BRANCH (nghĩa thứ tư của "chi nhánh") không có giá trị tương ứng — ADR-012 D-T2
    link_type: p.partnership_type === "FRANCHISE" ? ("FRANCHISE" as const) : ("SUBCONTRACTOR" as const),
    status,
    valid_to: status === "TERMINATED" ? p.updated_at : null,
    partner_code: p.partner_code,
    capacity_daily: p.capacity_daily,
    commission_rate: p.commission_rate,
    contact_name: p.contact_name,
    contact_phone: p.contact_phone,
    contact_email: p.contact_email,
    address: p.address,
    province: p.province,
    district: p.district,
  }
  await db.organization_links.upsert({
    where: { id: p.id },
    create: { id: p.id, ...data, valid_from: p.created_at, created_at: p.created_at },
    update: data,
  })
  await recomputePrimaryLink(db, p.partner_org_id)
}

/** Đặt lại cạnh chính của một tổ chức con = liên kết chuỗi ACTIVE sớm nhất (hoặc không có). */
export async function recomputePrimaryLink(db: DbClient, childOrgId: string): Promise<string | null> {
  const first = await db.organization_links.findFirst({
    where: { child_org_id: childOrgId, ...ACTIVE_CHAIN_LINK },
    orderBy: [{ created_at: "asc" }, { id: "asc" }],
    select: { id: true },
  })
  const primaryId = first?.id ?? null
  await db.organization_links.updateMany({
    where: { child_org_id: childOrgId, is_primary: true, ...(primaryId ? { NOT: { id: primaryId } } : {}) },
    data: { is_primary: false },
  })
  if (primaryId) await db.organization_links.update({ where: { id: primaryId }, data: { is_primary: true } })
  return primaryId
}
