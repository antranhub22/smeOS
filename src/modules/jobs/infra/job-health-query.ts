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
