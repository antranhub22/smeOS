/**
 * chain-branch-repository.ts
 *
 * Chi nhánh nhận gia công của điều phối chuỗi — bảng `chain_branches` (trước 22/10/2026 nằm trong
 * `organizations.settings.chain_branches`). `branchId` phía domain chính là `branch_code` ở đây.
 */

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
  return { phone: pick("phone"), telegramChatId: pick("telegramChatId"), zaloPhone: pick("zaloPhone"), messengerId: pick("messengerId") }
}

export function toBranchCandidate(row: ChainBranchRow): BranchCandidate {
  return {
    branchId: row.branch_code,
    branchName: row.name,
    address: row.address ?? "",
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

  /** Chat Telegram đã cấu hình cho chi nhánh của chính tổ chức, theo thứ tự tạo. */
  async listTelegramChatIds(organizationId: string): Promise<string[]> {
    const branches = await this.listCandidates(organizationId)
    return branches
      .map((b) => b.channels?.telegramChatId)
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
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
        select: { branch_code: true },
      })
      const existingCodes = new Set(existing.map((e) => e.branch_code))
      for (const b of byCode.values()) {
        const data = {
          name: b.branchName,
          address: b.address || null,
          latitude: b.location?.latitude ?? null,
          longitude: b.location?.longitude ?? null,
          quality_score: b.qualityScore,
          active_jobs_count: b.activeJobsCount,
          max_concurrent_jobs: b.maxConcurrentJobs,
          is_active: b.isActive,
          channels: channelsJson(b.channels),
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
