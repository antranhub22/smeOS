import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { PartnerStoreMarketplaceEntity } from "../domain/partner-marketplace.types"
import {
  DEFAULT_TIER,
  MAX_IMPORT_ROWS,
  matchKeyOf,
  searchTextOf,
  type PartnerStoreProfile,
} from "../domain/partner-marketplace-row-mapper"
import type {
  IPartnerMarketplaceRepository,
  MarketplaceImportSource,
  MarketplacePhotoState,
} from "../domain/repositories/partner-marketplace-repository.interface"

/** Bảng cấp nền tảng (không có organization_id) — chỉ console vận hành truy cập, qua N1/N17. */
type Row = { id: string; profile: unknown; photo_keys: string[]; search_text: string }

function toEntity(row: Pick<Row, "id" | "profile">): PartnerStoreMarketplaceEntity {
  return { ...(row.profile as PartnerStoreProfile), id: row.id }
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

export class PartnerMarketplaceRepository implements IPartnerMarketplaceRepository {
  async listAll() {
    const rows = await prisma.partner_marketplace_stores.findMany({
      select: { id: true, profile: true, photo_keys: true, search_text: true },
      orderBy: { shop_name: "asc" },
      take: MAX_IMPORT_ROWS,
    })
    return rows.map((r) => ({ store: toEntity(r), searchText: r.search_text, photoKeys: r.photo_keys }))
  }

  async upsertMany(profiles: PartnerStoreProfile[], source: MarketplaceImportSource) {
    const keys = profiles.map((p) => matchKeyOf(p.identity.shopName))
    const existing = new Set(
      (await prisma.partner_marketplace_stores.findMany({ where: { match_key: { in: keys } }, select: { match_key: true } })).map(
        (r) => r.match_key
      )
    )
    await prisma.$transaction(
      profiles.map((profile, i) => {
        const data = {
          shop_name: profile.identity.shopName,
          tier: profile.scoreAndTier.suggestedTier || DEFAULT_TIER,
          address: profile.contact.address,
          profile: profile as unknown as Prisma.InputJsonValue,
          search_text: searchTextOf(profile),
          source,
        }
        return prisma.partner_marketplace_stores.upsert({
          where: { match_key: keys[i]! },
          create: { match_key: keys[i]!, ...data },
          update: data,
        })
      })
    )
    const added = keys.filter((k) => !existing.has(k)).length
    const total = await prisma.partner_marketplace_stores.count()
    return { added, updated: profiles.length - added, total }
  }

  async listPhotoPending(limit: number): Promise<{ items: MarketplacePhotoState[]; remaining: number }> {
    const rows = await prisma.partner_marketplace_stores.findMany({
      select: { id: true, profile: true, photo_keys: true, photo_source_ids: true },
      orderBy: { created_at: "asc" },
      take: MAX_IMPORT_ROWS,
    })
    const pending = rows
      .map((r) => ({
        id: r.id,
        driveImageIds: toEntity(r).media.driveImageIds ?? [],
        photoKeys: r.photo_keys,
        photoSourceIds: r.photo_source_ids,
      }))
      .filter((s) => s.driveImageIds.length > 0 && !sameList(s.driveImageIds, s.photoSourceIds))
    return { items: pending.slice(0, limit), remaining: Math.max(0, pending.length - limit) }
  }

  async setPhotos(id: string, photoKeys: string[], photoSourceIds: string[]) {
    await prisma.partner_marketplace_stores.update({
      where: { id },
      data: { photo_keys: photoKeys, photo_source_ids: photoSourceIds },
    })
  }
}

let instance: IPartnerMarketplaceRepository | null = null

export function getPartnerMarketplaceRepository(): IPartnerMarketplaceRepository {
  instance ??= new PartnerMarketplaceRepository()
  return instance
}
