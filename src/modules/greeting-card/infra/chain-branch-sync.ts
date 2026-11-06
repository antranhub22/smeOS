/**
 * Ghi kép `chain_branches` → `branches` (ADR-012 D-T2, bước T-4a).
 *
 * Mỗi lần repository chi nhánh chuỗi ghi một dòng, gọi `syncBranchFromChain` trong CÙNG giao dịch. Khoá ghép là
 * (tổ chức, mã chi nhánh) — `branches.code` = `chain_branches.branch_code`. Chi nhánh trùng mã với một dòng
 * `branches` có sẵn đã được migration gộp (D-57). Cấu hình nhận đơn, điểm, kênh luôn chép; tên, địa chỉ, trạng thái
 * bật/tắt chỉ chép khi người dùng đổi chúng (nhập Excel, bật/tắt chi nhánh) — `withProfile: true`.
 * T-4b chuyển đường đọc sang `branches`; T-4c ghi thẳng `branches` và xoá `chain_branches`.
 */
import { Prisma, type PrismaClient } from "@/generated/prisma/client"

type Db = PrismaClient | Prisma.TransactionClient
type ChainBranch = Prisma.chain_branchesGetPayload<object>
type SyncOpts = { withProfile?: boolean }

/** Trả `branches.id` của chi nhánh sau khi chép; `null` khi mã không có trong `chain_branches`. */
export async function syncBranchFromChain(db: Db, organizationId: string, branchCode: string, opts: SyncOpts = {}): Promise<string | null> {
  const cb = await db.chain_branches.findUnique({
    where: { organization_id_branch_code: { organization_id: organizationId, branch_code: branchCode } },
  })
  return cb ? syncBranchRow(db, cb, opts) : null
}

/** Chép một dòng `chain_branches` vừa ghi (không đọc lại) — dùng trong vòng nhập Excel. */
export async function syncBranchRow(db: Db, cb: ChainBranch, opts: SyncOpts = {}): Promise<string> {
  const organizationId = cb.organization_id
  const branchCode = cb.branch_code
  const json = (v: Prisma.JsonValue) => (v === null ? Prisma.DbNull : (v as Prisma.InputJsonValue))
  const profile = { name: cb.name, address: cb.address, is_active: cb.is_active }
  const data = {
    accepts_dispatch: true,
    ward: cb.ward,
    district: cb.district,
    province: cb.province,
    service_wards: json(cb.service_wards),
    latitude: cb.latitude,
    longitude: cb.longitude,
    quality_score: cb.quality_score,
    active_jobs_count: cb.active_jobs_count,
    max_concurrent_jobs: cb.max_concurrent_jobs,
    channels: json(cb.channels),
    zalo_link_code: cb.zalo_link_code,
    cancellation_count: cb.cancellation_count,
    bypass_count: cb.bypass_count,
    cancellation_history: json(cb.cancellation_history),
    bypass_history: json(cb.bypass_history),
  }
  const row = await db.branches.upsert({
    where: { organization_id_code: { organization_id: organizationId, code: branchCode } },
    create: { id: cb.id, organization_id: organizationId, code: branchCode, created_at: cb.created_at, ...profile, ...data },
    update: opts.withProfile ? { ...profile, ...data } : data,
    select: { id: true },
  })
  return row.id
}

/** `branches.id` của chi nhánh nhận đơn điều phối theo mã; `null` khi không có. */
export async function dispatchBranchIdByCode(db: Db, organizationId: string, branchCode: string): Promise<string | null> {
  const row = await db.branches.findFirst({
    where: { organization_id: organizationId, code: branchCode, accepts_dispatch: true },
    select: { id: true },
  })
  return row?.id ?? null
}
