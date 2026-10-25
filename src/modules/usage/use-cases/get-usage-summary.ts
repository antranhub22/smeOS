import type { TenantContext } from "@/core/tenancy"
import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { getUsageRepository } from "@/modules/usage/infra/usage-repository"
import type { IUsageRepository } from "@/modules/usage/domain/repositories/usage-repository.interface"


/**
 * `GET /usage/summary` (`G8`, đặc tả 06 mục 10).
 *
 * Chưa chia theo chi nhánh cho tổ chức Chuỗi — `usage` không có cột
 * `branch_id` ở đặc tả 07 mục 7. Ghi ở `docs/dac-ta/TECHNICAL_DEBT.md`.
 */
export async function getUsageSummary(
  ctx: TenantContext,
  repo: IUsageRepository = getUsageRepository()
) {
  const [byFeature, organization] = await Promise.all([
    repo.summaryByFeature(ctx),
    new OrganizationRepository().current(ctx),
  ])

  const creditUsed = byFeature.reduce((sum, row) => sum + row.costCredit, 0)

  return {
    by_feature: byFeature.map((row) => ({
      feature: row.feature,
      quantity: row.quantity,
      cost_credit: row.costCredit,
    })),
    credit_used: creditUsed,
    credit_balance: organization?.credit_balance ?? 0,
  }
}
