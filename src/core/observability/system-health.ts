/**
 * Tổng hợp sức khoẻ hệ thống cho `GET /api/v1/internal/health` (chỉ cron/người vận hành gọi).
 * Hàm thuần: các phép đo được truyền vào, nên test không cần CSDL hay Redis.
 */

export type RedisState = "ok" | "down" | "not_configured"

export interface HealthProbes {
  /** Độ trễ `SELECT 1` (ms); `null` khi CSDL không trả lời. */
  databaseLatencyMs: () => Promise<number | null>
  redis: () => Promise<RedisState>
  jobBacklog: () => Promise<{ pendingTooLong: number; processingTooLong: number }>
}

export interface SystemHealth {
  status: "ok" | "degraded" | "down"
  timestamp: string
  issues: string[]
  database: { up: boolean; latencyMs: number | null }
  redis: RedisState
  jobs: { pendingTooLong: number; processingTooLong: number } | null
}

/** CSDL chậm hơn mức này vẫn sống nhưng đáng báo. */
export const SLOW_DATABASE_MS = 1000

export async function checkSystemHealth(
  probes: HealthProbes,
  options: { production: boolean; now?: Date }
): Promise<SystemHealth> {
  const timestamp = (options.now ?? new Date()).toISOString()
  const [latencyMs, redis] = await Promise.all([probes.databaseLatencyMs(), probes.redis()])
  const issues: string[] = []

  if (latencyMs === null) {
    return { status: "down", timestamp, issues: ["database_unreachable"], database: { up: false, latencyMs }, redis, jobs: null }
  }
  if (latencyMs > SLOW_DATABASE_MS) issues.push("database_slow")
  if (redis === "down") issues.push("redis_down")
  // Production cần Redis cho giới hạn tần suất dùng chung các instance (render.yaml, H7)
  if (redis === "not_configured" && options.production) issues.push("redis_not_configured")

  let jobs: SystemHealth["jobs"] = null
  try {
    jobs = await probes.jobBacklog()
    if (jobs.pendingTooLong > 0) issues.push("jobs_pending_too_long")
    if (jobs.processingTooLong > 0) issues.push("jobs_processing_too_long")
  } catch {
    issues.push("jobs_unreadable")
  }

  return { status: issues.length ? "degraded" : "ok", timestamp, issues, database: { up: true, latencyMs }, redis, jobs }
}
