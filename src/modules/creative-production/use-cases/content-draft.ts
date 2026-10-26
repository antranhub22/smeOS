import { AppError } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import type { TenantContext } from "@/core/tenancy"
import { getAssetRepository } from "@/modules/assets/infra/asset-repository"
import type { IAssetRepository } from "@/modules/assets/domain/repositories/asset-repository.interface"

import { getContentDraftRepository } from "../infra/content-draft-repository"
import type {
  ContentDraftKey,
  IContentDraftRepository,
} from "../domain/repositories/content-draft-repository.interface"
import type { PackagePost } from "../domain/campaign-package-rules"

export type { ContentDraftKey }

export interface ContentDraftDto {
  asset_id: string
  topic_id: string
  mode: string
  topic_title: string | null
  posts: PackagePost[]
  updated_at: string
}

function toDto(row: {
  asset_id: string
  topic_id: string
  mode: string
  topic_title: string | null
  posts: unknown
  updated_at: Date
}): ContentDraftDto {
  return {
    asset_id: row.asset_id,
    topic_id: row.topic_id,
    mode: row.mode,
    topic_title: row.topic_title,
    posts: Array.isArray(row.posts) ? (row.posts as PackagePost[]) : [],
    updated_at: row.updated_at.toISOString(),
  }
}

/**
 * Tự lưu bài Khu vực B (24/09/2026). Ảnh phải thuộc ĐÚNG tổ chức của phiên —
 * không nhận một `asset_id` lạ làm khoá.
 */
export async function saveContentDraft(
  ctx: TenantContext,
  key: ContentDraftKey,
  data: { posts: PackagePost[]; topicTitle: string | null },
  repo: IContentDraftRepository = getContentDraftRepository(),
  assetRepo: IAssetRepository = getAssetRepository()
): Promise<ContentDraftDto> {
  requireCapability(ctx, "I1")
  const asset = await assetRepo.findById(ctx, key.assetId)
  if (!asset) throw new AppError("NOT_FOUND", "Không có ảnh sản phẩm này trong kho của tổ chức")
  return toDto(await repo.upsert(ctx, key, data))
}

export async function getContentDraft(
  ctx: TenantContext,
  key: ContentDraftKey,
  repo: IContentDraftRepository = getContentDraftRepository()
): Promise<ContentDraftDto | null> {
  requireCapability(ctx, "I1")
  const row = await repo.find(ctx, key)
  return row ? toDto(row) : null
}
