import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy"
import type { asset_kind } from "@/generated/prisma/client"
import { AI_IMAGE_KINDS, type CreatorFilter, type LibraryType } from "../domain/library"

/** Một mục thư viện đã chuẩn hoá, trước khi gắn chi nhánh/ảnh xem trước. */
export type LibraryRow = {
  id: string
  type: LibraryType
  title: string
  createdAt: Date
  createdBy: string | null
  status: string | null
  /** Phân loại con: kind của asset, MUSIC/VOICE của âm thanh. */
  subtype: string | null
  storageKey: string | null
  mimeType: string | null
}

export type LibraryQuery = { creator: CreatorFilter; q: string | null; from: Date | null; cursor: string | null; take: number }

function creatorWhere(field: string, filter: CreatorFilter): Record<string, unknown> {
  if (filter.kind === "none") return {}
  if (filter.kind === "only") return { [field]: { in: filter.userIds } }
  return filter.userIds.length ? { [field]: { notIn: filter.userIds } } : {}
}

/** Bảng không lưu người tạo (video): mọi mục tính là trụ sở. */
function noCreatorAllowed(filter: CreatorFilter): boolean {
  return filter.kind !== "only"
}

const page = (query: LibraryQuery) => ({
  take: query.take,
  orderBy: [{ created_at: "desc" as const }, { id: "desc" as const }],
  ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
})

const since = (from: Date | null) => (from ? { created_at: { gte: from } } : {})
const titleLike = (field: string, q: string | null) => (q ? { [field]: { contains: q, mode: "insensitive" } } : {})

export async function listLibraryRows(ctx: TenantContext, type: LibraryType, query: LibraryQuery): Promise<LibraryRow[]> {
  switch (type) {
    case "original":
    case "ai_image": {
      const kinds: asset_kind[] = type === "original" ? ["ORIGINAL"] : [...AI_IMAGE_KINDS]
      const rows = await prisma.assets.findMany({
        where: scopedWhere(ctx, {
          kind: { in: kinds },
          state: { not: "ARCHIVED" as const },
          ...since(query.from),
          ...creatorWhere("created_by", query.creator),
        }),
        ...page(query),
        select: { id: true, kind: true, state: true, created_at: true, created_by: true, storage_key: true, thumb_key: true, mime_type: true, metadata: true },
      })
      return rows.map((r) => {
        const meta = (r.metadata as Record<string, unknown> | null) ?? {}
        return {
          id: r.id,
          type,
          title: typeof meta.filename === "string" ? meta.filename : "",
          createdAt: r.created_at,
          createdBy: r.created_by,
          status: r.state,
          subtype: r.kind,
          storageKey: r.thumb_key ?? r.storage_key,
          mimeType: r.mime_type,
        }
      })
    }
    case "video": {
      if (!noCreatorAllowed(query.creator)) return []
      const rows = await prisma.video_jobs.findMany({
        where: scopedWhere(ctx, { ...since(query.from), ...titleLike("title", query.q) }),
        ...page(query),
        select: { id: true, title: true, stage: true, created_at: true },
      })
      return rows.map((r) => ({ id: r.id, type, title: r.title, createdAt: r.created_at, createdBy: null, status: r.stage, subtype: null, storageKey: null, mimeType: null }))
    }
    case "audio": {
      const [tracks, voices] = await Promise.all([
        prisma.music_tracks.findMany({
          where: scopedWhere(ctx, { deleted_at: null, ...since(query.from), ...titleLike("title", query.q), ...creatorWhere("attested_by", query.creator) }),
          orderBy: { created_at: "desc" },
          take: query.take,
          select: { id: true, title: true, created_at: true, attested_by: true },
        }),
        prisma.voice_clones.findMany({
          where: scopedWhere(ctx, { deleted_at: null, ...since(query.from), ...titleLike("name", query.q), ...creatorWhere("consented_by", query.creator) }),
          orderBy: { created_at: "desc" },
          take: query.take,
          select: { id: true, name: true, status: true, created_at: true, consented_by: true },
        }),
      ])
      return [
        ...tracks.map((r) => ({ id: r.id, type, title: r.title, createdAt: r.created_at, createdBy: r.attested_by, status: null, subtype: "MUSIC", storageKey: null, mimeType: null })),
        ...voices.map((r) => ({ id: r.id, type, title: r.name, createdAt: r.created_at, createdBy: r.consented_by, status: r.status, subtype: "VOICE", storageKey: null, mimeType: null })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, query.take)
    }
    case "content": {
      const rows = await prisma.content_generations.findMany({
        where: scopedWhere(ctx, { ...since(query.from), ...creatorWhere("created_by", query.creator) }),
        ...page(query),
        select: { id: true, channels: true, status: true, created_at: true, created_by: true },
      })
      return rows.map((r) => ({
        id: r.id,
        type,
        title: Array.isArray(r.channels) ? r.channels.filter((c) => typeof c === "string").join(", ") : "",
        createdAt: r.created_at,
        createdBy: r.created_by,
        status: r.status,
        subtype: null,
        storageKey: null,
        mimeType: null,
      }))
    }
    case "catalog": {
      const rows = await prisma.catalog_links.findMany({
        where: scopedWhere(ctx, { ...since(query.from), ...titleLike("name", query.q), ...creatorWhere("created_by", query.creator) }),
        ...page(query),
        select: { id: true, name: true, is_revoked: true, created_at: true, created_by: true },
      })
      return rows.map((r) => ({ id: r.id, type, title: r.name, createdAt: r.created_at, createdBy: r.created_by, status: r.is_revoked ? "REVOKED" : "ACTIVE", subtype: null, storageKey: null, mimeType: null }))
    }
    case "greeting_catalog": {
      const rows = await prisma.greeting_catalogs.findMany({
        where: scopedWhere(ctx, { ...since(query.from), ...titleLike("name", query.q), ...creatorWhere("created_by", query.creator) }),
        ...page(query),
        select: { id: true, name: true, type: true, created_at: true, created_by: true },
      })
      return rows.map((r) => ({ id: r.id, type, title: r.name, createdAt: r.created_at, createdBy: r.created_by, status: r.type, subtype: null, storageKey: null, mimeType: null }))
    }
  }
}

/** user → chi nhánh và id → tên chi nhánh của tổ chức (để phân loại và hiện nhãn). */
export async function loadBranchDirectory(ctx: TenantContext): Promise<{
  isChain: boolean
  branchOfUser: Map<string, string | null>
  branchNames: Map<string, string>
}> {
  const [org, members, branches] = await Promise.all([
    prisma.organizations.findUnique({ where: { id: ctx.organizationId }, select: { type: true } }),
    prisma.memberships.findMany({ where: scopedWhere(ctx, {}), select: { user_id: true, branch_id: true } }),
    prisma.branches.findMany({ where: scopedWhere(ctx, { is_active: true }), select: { id: true, name: true } }),
  ])
  return {
    isChain: org?.type === "CHAIN",
    branchOfUser: new Map(members.map((m) => [m.user_id, m.branch_id])),
    branchNames: new Map(branches.map((b) => [b.id, b.name])),
  }
}
