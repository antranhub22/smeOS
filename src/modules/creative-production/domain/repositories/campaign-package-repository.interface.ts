/**
 * ICampaignPackageRepository — Port Interface cho quản lý Campaign Packages.
 *
 * Đặt tại domain/repositories/ theo chuẩn Clean Architecture (Zero ORM).
 */

import type { TenantContext } from "@/core/tenancy"
import type { campaign_packages } from "@/modules/creative-production/infra/entities"
import type {
  CampaignPackageStatus,
  MetricFact,
  OrderFact,
  PostRef,
} from "../campaign-package-rules"

export interface CreateCampaignPackageRow {
  readonly productId: string | null
  readonly masterAssetId: string
  readonly name: string
  readonly mode: string
  readonly topic: unknown
  readonly content: unknown
  readonly variantAssetIds: readonly string[]
  readonly videoJobId: string | null
  readonly videoJobIds: readonly string[]
  readonly audioJobId: string | null
}

export interface UpdateCampaignPackageRow {
  readonly name?: string | undefined
  readonly content?: unknown
  readonly variantAssetIds?: readonly string[] | undefined
  readonly videoJobId?: string | null | undefined
  readonly videoJobIds?: readonly string[] | undefined
  readonly audioJobId?: string | null | undefined
}

export interface ICampaignPackageRepository {
  create(ctx: TenantContext, row: CreateCampaignPackageRow): Promise<campaign_packages>
  findById(ctx: TenantContext, id: string): Promise<campaign_packages | null>
  list(
    ctx: TenantContext,
    options: {
      masterAssetId?: string | undefined
      status?: CampaignPackageStatus | undefined
      limit: number
    }
  ): Promise<campaign_packages[]>
  updateDraft(
    ctx: TenantContext,
    id: string,
    row: UpdateCampaignPackageRow
  ): Promise<campaign_packages | null>
  saveQa(
    ctx: TenantContext,
    id: string,
    status: CampaignPackageStatus,
    report: unknown,
    checkedAt: Date
  ): Promise<campaign_packages | null>
  approve(
    ctx: TenantContext,
    id: string,
    fromStatus: CampaignPackageStatus,
    at: Date
  ): Promise<boolean>
  saveLaunchPlan(
    ctx: TenantContext,
    id: string,
    plan: unknown
  ): Promise<campaign_packages | null>
  orderFactsForProduct(
    ctx: TenantContext,
    productId: string,
    since: Date
  ): Promise<OrderFact[]>
  countConversationsSince(ctx: TenantContext, since: Date): Promise<number>
  metricFacts(ctx: TenantContext, refs: readonly PostRef[]): Promise<MetricFact[]>
}
