/**
 * ICreativeProductionRepository — Port Interface cho Creative Production.
 *
 * Đặt tại domain/repositories/ theo chuẩn Clean Architecture.
 */

import type {
  CampaignPackage,
  ProducedAsset,
  MediaPlanItem,
} from "../production-types"

export interface ICreativeProductionRepository {
  /** Lưu campaign package mới */
  saveCampaign(campaign: CampaignPackage): Promise<void>

  /** Lấy campaign theo ID */
  getCampaign(campaignId: string, organizationId: string): Promise<CampaignPackage | null>

  /** Cập nhật trạng thái campaign */
  updateCampaignStatus(
    campaignId: string,
    organizationId: string,
    status: CampaignPackage["status"]
  ): Promise<void>

  /** Thêm asset đã sản xuất vào campaign */
  addProducedAsset(
    campaignId: string,
    organizationId: string,
    asset: ProducedAsset
  ): Promise<void>

  /** Cập nhật trạng thái 1 media plan item */
  updateMediaPlanItemStatus(
    campaignId: string,
    itemIndex: number,
    status: MediaPlanItem["status"],
    jobId?: string
  ): Promise<void>

  /** Liệt kê campaigns theo organization */
  listCampaigns(
    organizationId: string,
    options?: { status?: CampaignPackage["status"]; limit?: number }
  ): Promise<readonly CampaignPackage[]>
}
