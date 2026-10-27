/**
 * NOTIFICATION HARD LOCK REPOSITORY
 *
 * Tách riêng thao tác truy xuất dữ liệu Hard Locks
 * để đảm bảo SRP và giới hạn 350 dòng/tệp.
 *
 * @module notification/infra
 */
import { prisma } from "@/core/tenancy/infra/prisma"
import type {
  NotifyChannel,
  NotificationTier,
} from "../domain/events/_contract"
import type { HardLockEntry } from "../domain/cascading-policy"

export class NotificationHardLockRepository {
  async getHardLocks(filter?: {
    tier?: NotificationTier | undefined
    scopeId?: string | undefined
    eventKey?: string | undefined
    channel?: NotifyChannel | undefined
  }): Promise<HardLockEntry[]> {
    const rows = await prisma.notification_hard_locks.findMany({
      where: {
        ...(filter?.tier ? { tier: filter.tier } : {}),
        ...(filter?.scopeId ? { scope_id: filter.scopeId } : {}),
        ...(filter?.eventKey ? { event_key: filter.eventKey } : {}),
        ...(filter?.channel ? { channel: filter.channel } : {}),
      },
    })
    return rows.map((r) => ({
      eventKey: r.event_key,
      channel: r.channel as NotifyChannel,
      tier: r.tier as NotificationTier,
      scopeId: r.scope_id,
      enabled: r.enabled,
      reason: r.reason ?? undefined,
    }))
  }

  async setHardLock(lock: HardLockEntry & { lockedBy: string }): Promise<void> {
    await prisma.notification_hard_locks.upsert({
      where: {
        event_key_channel_tier_scope_id: {
          event_key: lock.eventKey,
          channel: lock.channel,
          tier: lock.tier,
          scope_id: lock.scopeId,
        },
      },
      create: {
        event_key: lock.eventKey,
        channel: lock.channel,
        tier: lock.tier,
        scope_id: lock.scopeId,
        enabled: lock.enabled,
        locked_by: lock.lockedBy,
        reason: lock.reason ?? null,
      },
      update: {
        enabled: lock.enabled,
        locked_by: lock.lockedBy,
        reason: lock.reason ?? null,
      },
    })
  }

  async deleteHardLock(
    eventKey: string,
    channel: NotifyChannel,
    tier: NotificationTier,
    scopeId: string
  ): Promise<void> {
    await prisma.notification_hard_locks.deleteMany({
      where: {
        event_key: eventKey,
        channel,
        tier,
        scope_id: scopeId,
      },
    })
  }
}

let hardLockRepoInstance: NotificationHardLockRepository | null = null

export function getNotificationHardLockRepository(): NotificationHardLockRepository {
  if (!hardLockRepoInstance) {
    hardLockRepoInstance = new NotificationHardLockRepository()
  }
  return hardLockRepoInstance
}
