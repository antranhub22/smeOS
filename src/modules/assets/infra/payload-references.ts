import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy"

/**
 * Số bản ghi còn trỏ tới một khoá kho trong tổ chức. Payload dùng chung là
 * có thật: `promote-to-master.ts` tạo Master trỏ lại đúng tệp của ảnh gốc —
 * còn bản ghi nào trỏ tới thì không được xoá tệp.
 */
export async function countPayloadReferences(ctx: TenantContext, key: string): Promise<number> {
  const [assets, musicTracks, voiceClones, videoJobs] = await Promise.all([
    prisma.assets.count({ where: scopedWhere(ctx, { OR: [{ storage_key: key }, { thumb_key: key }] }) }),
    prisma.music_tracks.count({ where: scopedWhere(ctx, { storage_key: key }) }),
    prisma.voice_clones.count({ where: scopedWhere(ctx, { sample_storage_key: key }) }),
    prisma.video_jobs.count({
      where: scopedWhere(ctx, { OR: [{ audio_storage_key: key }, { final_video_url: { contains: key } }] }),
    }),
  ])
  return assets + musicTracks + voiceClones + videoJobs
}
