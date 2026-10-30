import { prisma } from "@/core/tenancy/infra/prisma"

/**
 * Đếm job tồn đọng cho `GET /internal/health`. Chạy toàn hệ thống, không theo tổ chức — cùng
 * lý do với `GenerationJobRepository.markStuckAsFailed` — và chỉ trả hai con số, không trả dòng.
 */
export async function countJobBacklog(
  now: Date,
  olderThanMs: number
): Promise<{ pendingTooLong: number; processingTooLong: number }> {
  const threshold = new Date(now.getTime() - olderThanMs)
  const [pendingTooLong, processingTooLong] = await Promise.all([
    prisma.generation_jobs.count({ where: { status: "PENDING", created_at: { lt: threshold } } }),
    prisma.generation_jobs.count({ where: { status: "PROCESSING", started_at: { lt: threshold } } }),
  ])
  return { pendingTooLong, processingTooLong }
}

/**
 * Worker còn sống = còn kết nối Postgres mang `application_name` `smeos-worker:<tên>` (kết nối
 * `LISTEN` mở suốt vòng đời worker). Không cần bảng hay Redis riêng (ROADMAP E1.4).
 */
export async function countLiveWorkers(): Promise<Record<string, number>> {
  const rows = await prisma.$queryRaw<{ name: string; n: bigint }[]>`
    SELECT substr(application_name, 14) AS name, count(*) AS n
      FROM pg_stat_activity
     WHERE application_name LIKE 'smeos-worker:%'
     GROUP BY 1`
  return Object.fromEntries(rows.map((r) => [r.name, Number(r.n)]))
}
