/**
 * IContentDraftRepository — Port Interface cho Content Drafts.
 *
 * Đặt tại domain/repositories/ theo chuẩn Clean Architecture (Zero ORM).
 */

import type { TenantContext } from "@/core/tenancy"
import type { content_drafts } from "@/modules/creative-production/infra/entities"

export interface ContentDraftKey {
  readonly assetId: string
  readonly topicId: string
  readonly mode: string
}

export interface IContentDraftRepository {
  find(ctx: TenantContext, key: ContentDraftKey): Promise<content_drafts | null>
  upsert(
    ctx: TenantContext,
    key: ContentDraftKey,
    data: { posts: unknown; topicTitle: string | null }
  ): Promise<content_drafts>
}
