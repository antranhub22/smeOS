/**
 * Content Draft Repository — bảng `content_drafts` (TENANT, 24/09/2026).
 * Bài đăng Khu vực B tự lưu theo ảnh + chủ đề + mode.
 */

import type { Prisma, PrismaClient, content_drafts } from "@/generated/prisma/client"
import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedData, scopedWhere, type TenantContext } from "@/core/tenancy"

import type {
  ContentDraftKey,
  IContentDraftRepository,
} from "../domain/repositories/content-draft-repository.interface"

type DbClient = PrismaClient | Prisma.TransactionClient

export type { content_drafts, ContentDraftKey, IContentDraftRepository }

export class ContentDraftRepository implements IContentDraftRepository {
  constructor(private readonly db: DbClient = prisma) {}

  find(ctx: TenantContext, key: ContentDraftKey): Promise<content_drafts | null> {
    return this.db.content_drafts.findFirst({
      where: scopedWhere(ctx, { asset_id: key.assetId, topic_id: key.topicId, mode: key.mode }),
    })
  }

  async upsert(
    ctx: TenantContext,
    key: ContentDraftKey,
    data: { posts: unknown; topicTitle: string | null }
  ): Promise<content_drafts> {
    const existing = await this.find(ctx, key)
    if (existing) {
      await this.db.content_drafts.updateMany({
        where: scopedWhere(ctx, { id: existing.id }),
        data: {
          posts: data.posts as Prisma.InputJsonValue,
          topic_title: data.topicTitle,
          updated_by: ctx.userId,
        },
      })
      return (await this.find(ctx, key)) as content_drafts
    }
    return this.db.content_drafts.create({
      data: scopedData(ctx, {
        asset_id: key.assetId,
        topic_id: key.topicId,
        mode: key.mode,
        topic_title: data.topicTitle,
        posts: data.posts as Prisma.InputJsonValue,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      }),
    })
  }
}

let defaultRepo: IContentDraftRepository | null = null

export function getContentDraftRepository(): IContentDraftRepository {
  if (!defaultRepo) {
    defaultRepo = new ContentDraftRepository()
  }
  return defaultRepo
}
