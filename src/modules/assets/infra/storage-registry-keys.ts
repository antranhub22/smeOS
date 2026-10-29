import { prisma } from "@/core/tenancy/infra/prisma"
import { storageKeyFromReference } from "@/modules/assets/domain/storage-reconciliation"

const PAGE = 5000
/** Trần an toàn số trang mỗi bảng — vòng lặp luôn có giới hạn. */
const MAX_PAGES = 400

async function paged<T extends { id: string }>(fetch: (cursor: string | undefined) => Promise<T[]>): Promise<T[]> {
  const all: T[] = []
  let cursor: string | undefined
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await fetch(cursor)
    all.push(...rows)
    if (rows.length < PAGE) return all
    cursor = rows[rows.length - 1]!.id
  }
  throw new Error("Vượt trần trang khi đọc registry — tăng MAX_PAGES có chủ đích")
}

const pageArgs = (cursor: string | undefined) => ({
  take: PAGE,
  orderBy: { id: "asc" as const },
  ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
})

/**
 * Mọi khoá kho mà registry đang trỏ tới, của MỌI tổ chức — chỉ script đối
 * soát hệ thống dùng (`scripts/storage-reconcile.ts`), chỉ đọc.
 */
export async function loadRegistryKeys(): Promise<{ registry: Set<string>; pendingDeletes: Set<string> }> {
  const registry = new Set<string>()
  const add = (value: string | null | undefined) => {
    const key = value ? storageKeyFromReference(value) : null
    if (key) registry.add(key)
  }

  const assets = await paged((c) => prisma.assets.findMany({ ...pageArgs(c), select: { id: true, storage_key: true, thumb_key: true } }))
  assets.forEach((r) => (add(r.storage_key), add(r.thumb_key)))
  const tracks = await paged((c) => prisma.music_tracks.findMany({ ...pageArgs(c), select: { id: true, storage_key: true } }))
  tracks.forEach((r) => add(r.storage_key))
  const voices = await paged((c) => prisma.voice_clones.findMany({ ...pageArgs(c), select: { id: true, sample_storage_key: true } }))
  voices.forEach((r) => add(r.sample_storage_key))
  const videos = await paged((c) =>
    prisma.video_jobs.findMany({ ...pageArgs(c), select: { id: true, audio_storage_key: true, final_video_url: true } })
  )
  videos.forEach((r) => (add(r.audio_storage_key), add(r.final_video_url)))

  const pending = await prisma.storage_outbox.findMany({ where: { done_at: null }, select: { storage_key: true } })
  return { registry, pendingDeletes: new Set(pending.map((r) => r.storage_key)) }
}
