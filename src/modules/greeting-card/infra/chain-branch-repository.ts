/**
 * chain-branch-repository.ts
 *
 * Chi nhánh nhận gia công của điều phối chuỗi — bảng `chain_branches` (trước 22/10/2026 nằm trong
 * `organizations.settings.chain_branches`). `branchId` phía domain chính là `branch_code` ở đây.
 */

import { randomBytes } from "node:crypto"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import type { BranchCandidate, BranchChannelConfig } from "../domain/chain-dispatch-engine"

/** Mỗi lần hủy nhận đơn hoặc xin bỏ qua bằng chứng: trừ 2 điểm, không dưới 10. */
export const BRANCH_PENALTY_POINTS = 2
export const BRANCH_MIN_QUALITY_SCORE = 10
const BRANCH_HISTORY_LIMIT = 50
const DEFAULT_QUALITY_SCORE = 90

export type BranchPenaltyKind = "CANCELLATION" | "BYPASS"

export interface BranchPenaltyResult {
  newQualityScore: number
  /** Số lần hủy (CANCELLATION) hoặc số lần bỏ qua (BYPASS) sau lần này. */
  count: number
}

type ChainBranchRow = {
  branch_code: string
  name: string
  address: string | null
  ward: string | null
  district: string | null
  province: string | null
  service_wards: Prisma.JsonValue
  latitude: number | null
  longitude: number | null
  quality_score: number
  active_jobs_count: number
  max_concurrent_jobs: number
  is_active: boolean
  channels: Prisma.JsonValue
}

function channelsOf(value: Prisma.JsonValue): BranchChannelConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const v = value as Record<string, unknown>
  const pick = (key: string) => (typeof v[key] === "string" ? (v[key] as string) : undefined)
  return { phone: pick("phone"), telegramChatId: pick("telegramChatId"), zaloPhone: pick("zaloPhone"), zaloUserId: pick("zaloUserId"), messengerId: pick("messengerId") }
}

export function toBranchCandidate(row: ChainBranchRow): BranchCandidate {
  return {
    branchId: row.branch_code,
    branchName: row.name,
    address: row.address ?? "",
    area: {
      ward: row.ward,
      district: row.district,
      province: row.province,
      serviceWards: Array.isArray(row.service_wards) ? row.service_wards.filter((w): w is string => typeof w === "string") : [],
    },
    location: row.latitude !== null && row.longitude !== null ? { latitude: row.latitude, longitude: row.longitude } : null,
    qualityScore: row.quality_score,
    activeJobsCount: row.active_jobs_count,
    maxConcurrentJobs: row.max_concurrent_jobs,
    isActive: row.is_active,
    channels: channelsOf(row.channels),
  }
}

function channelsJson(channels: BranchChannelConfig | undefined): Prisma.InputJsonValue {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(channels ?? {})) {
    if (typeof value === "string" && value.trim()) out[key] = value
  }
  return out
}

const LINK_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // bỏ 0/O/1/I dễ nhầm khi gõ

function newZaloLinkCode(): string {
  const bytes = randomBytes(8)
  return "ZL" + Array.from(bytes, (b) => LINK_ALPHABET[b % LINK_ALPHABET.length]).join("")
}

export class ChainBranchRepository {
  constructor(private readonly db = prisma) {}

  async listCandidates(organizationId: string): Promise<BranchCandidate[]> {
    const rows = await this.db.chain_branches.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: "asc" },
    })
    return rows.map(toBranchCandidate)
  }

  async findByCode(organizationId: string, branchCode: string): Promise<BranchCandidate | null> {
    const row = await this.db.chain_branches.findUnique({
      where: { organization_id_branch_code: { organization_id: organizationId, branch_code: branchCode } },
    })
    return row ? toBranchCandidate(row) : null
  }

  /**
   * Nhập Excel: chi nhánh trùng mã thì ghi đè cấu hình và điểm theo tệp, giữ số lần phạt cùng lịch sử phạt;
   * mã mới thì tạo. Trong cùng một lô, mã xuất hiện sau thắng.
   */
  async upsertMany(organizationId: string, branches: BranchCandidate[]): Promise<{ created: number; updated: number; total: number }> {
    const byCode = new Map(branches.map((b) => [b.branchId, b]))
    return this.db.$transaction(async (tx) => {
      const existing = await tx.chain_branches.findMany({
        where: { organization_id: organizationId, branch_code: { in: [...byCode.keys()] } },
        select: { branch_code: true, channels: true },
      })
      const existingCodes = new Set(existing.map((e) => e.branch_code))
      // Liên kết Zalo do nhân viên tự làm qua OA, không có trong tệp Excel → giữ nguyên khi nhập lại
      const linkedZalo = new Map(existing.map((e) => [e.branch_code, channelsOf(e.channels).zaloUserId]))
      for (const b of byCode.values()) {
        const data = {
          name: b.branchName,
          address: b.address || null,
          ward: b.area?.ward?.trim() || null,
          district: b.area?.district?.trim() || null,
          province: b.area?.province?.trim() || null,
          service_wards: (b.area?.serviceWards ?? []).map((w) => w.trim()).filter(Boolean),
          latitude: b.location?.latitude ?? null,
          longitude: b.location?.longitude ?? null,
          quality_score: b.qualityScore,
          active_jobs_count: b.activeJobsCount,
          max_concurrent_jobs: b.maxConcurrentJobs,
          is_active: b.isActive,
          channels: channelsJson({ ...b.channels, zaloUserId: b.channels?.zaloUserId || linkedZalo.get(b.branchId) }),
        }
        await tx.chain_branches.upsert({
          where: { organization_id_branch_code: { organization_id: organizationId, branch_code: b.branchId } },
          create: { organization_id: organizationId, branch_code: b.branchId, ...data },
          update: data,
        })
      }
      const total = await tx.chain_branches.count({ where: { organization_id: organizationId } })
      const updated = [...byCode.keys()].filter((code) => existingCodes.has(code)).length
      return { created: byCode.size - updated, updated, total }
    })
  }

  /** Chi nhánh của tổ chức kèm mã liên kết Zalo (sinh mã cho chi nhánh chưa có) */
  async listZaloLinks(organizationId: string): Promise<Array<{ branchCode: string; name: string; linkCode: string; linked: boolean }>> {
    const rows = await this.db.chain_branches.findMany({
      where: { organization_id: organizationId },
      select: { id: true, branch_code: true, name: true, zalo_link_code: true, channels: true },
      orderBy: { created_at: "asc" },
    })
    const out = []
    for (const row of rows) {
      let linkCode = row.zalo_link_code
      for (let attempt = 0; !linkCode && attempt < 5; attempt++) {
        const candidate = newZaloLinkCode()
        const updated = await this.db.chain_branches.updateMany({
          where: { id: row.id, organization_id: organizationId, zalo_link_code: null },
          data: { zalo_link_code: candidate },
        }).catch(() => ({ count: 0 })) // trùng mã (cực hiếm) → thử mã khác
        if (updated.count > 0) linkCode = candidate
      }
      out.push({ branchCode: row.branch_code, name: row.name, linkCode: linkCode ?? "", linked: Boolean(channelsOf(row.channels).zaloUserId) })
    }
    return out
  }

  /**
   * Gắn Zalo user (người theo dõi OA chung) vào chi nhánh có mã liên kết. Mã là duy nhất toàn nền
   * tảng nên tổ chức suy ra TỪ MÃ — webhook không có phiên tenant. `jsonb_set` không đè kênh khác.
   */
  async linkZaloUser(linkCode: string, zaloUserId: string): Promise<{ organizationId: string; branchName: string } | null> {
    const row = await this.db.chain_branches.findUnique({
      where: { zalo_link_code: linkCode },
      select: { id: true, organization_id: true, name: true },
    })
    if (!row) return null
    await this.db.$executeRaw`
      UPDATE "chain_branches"
      SET "channels" = jsonb_set(COALESCE("channels", '{}'::jsonb), '{zaloUserId}', to_jsonb(${zaloUserId}::text), true),
          "updated_at" = NOW()
      WHERE "id" = ${row.id} AND "organization_id" = ${row.organization_id}`
    return { organizationId: row.organization_id, branchName: row.name }
  }

  /**
   * Trừ điểm chất lượng KPI và ghi lịch sử (tối đa 50 mục gần nhất). Khoá dòng trong giao dịch để
   * hai lần phạt cùng lúc không ghi đè nhau. Chi nhánh không có trong bảng (vd. thuộc `branches`)
   * → không ghi gì, trả về giá trị mặc định như trước.
   */
  async applyPenalty(organizationId: string, branchCode: string, kind: BranchPenaltyKind, reason: string): Promise<BranchPenaltyResult> {
    return this.db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "chain_branches"
        WHERE "organization_id" = ${organizationId} AND "branch_code" = ${branchCode}
        FOR UPDATE`
      const id = locked[0]?.id
      if (!id) return { newQualityScore: DEFAULT_QUALITY_SCORE, count: 1 }

      const row = await tx.chain_branches.findUniqueOrThrow({ where: { id } })
      const newQualityScore = Math.max(BRANCH_MIN_QUALITY_SCORE, row.quality_score - BRANCH_PENALTY_POINTS)
      const previousHistory = kind === "CANCELLATION" ? row.cancellation_history : row.bypass_history
      const history = [
        { timestamp: new Date().toISOString(), reason, penalty: -BRANCH_PENALTY_POINTS },
        ...(Array.isArray(previousHistory) ? previousHistory : []),
      ].slice(0, BRANCH_HISTORY_LIMIT) as Prisma.InputJsonValue

      const count = (kind === "CANCELLATION" ? row.cancellation_count : row.bypass_count) + 1
      await tx.chain_branches.update({
        where: { id },
        data:
          kind === "CANCELLATION"
            ? { quality_score: newQualityScore, cancellation_count: count, cancellation_history: history }
            : { quality_score: newQualityScore, bypass_count: count, bypass_history: history },
      })
      return { newQualityScore, count }
    })
  }
}
