/**
 * MANAGE EVENT VISIBILITY USE-CASE
 *
 * Chỉ dành cho SaaS Mother (Console /van-hanh).
 * Cho phép thiết lập ma trận hiển thị (Visibility Matrix):
 * Quyết định event nào được phép hiển thị ở tầng nào (INDUSTRY, CHAIN, STORE).
 *
 * @module notification/use-cases
 */
import type { NotificationSubTier } from "../domain/events/_contract"
import { getAllNotificationEvents } from "../domain/events"
import type { INotificationPreferenceRepository } from "../domain/repositories/notification-preference-repository.interface"
import { getNotificationPreferenceRepository } from "../infra/notification-preference-repository"

export interface EventVisibilityRow {
  eventKey: string
  label: string
  tier: string
  group: string
  visibility: Record<NotificationSubTier, boolean>
}

export async function getVisibilityMatrix(
  repo: INotificationPreferenceRepository = getNotificationPreferenceRepository()
): Promise<EventVisibilityRow[]> {
  const allEvents = getAllNotificationEvents()
  const dbVisibility = await repo.getEventVisibilityMap()

  return allEvents.map((evt) => {
    const dbRow = dbVisibility[evt.key]
    const defaultVisible = (t: NotificationSubTier) => evt.defaultVisibleToTiers.includes(t)

    return {
      eventKey: evt.key,
      label: evt.label,
      tier: evt.tier,
      group: evt.group,
      visibility: {
        INDUSTRY: dbRow?.INDUSTRY ?? defaultVisible("INDUSTRY"),
        CHAIN: dbRow?.CHAIN ?? defaultVisible("CHAIN"),
        STORE: dbRow?.STORE ?? defaultVisible("STORE"),
      },
    }
  })
}

export async function updateEventVisibility(
  input: {
    eventKey: string
    tier: NotificationSubTier
    visible: boolean
    updatedBy: string
  },
  repo: INotificationPreferenceRepository = getNotificationPreferenceRepository()
): Promise<void> {
  await repo.setEventVisibility(input.eventKey, input.tier, input.visible, input.updatedBy)
}
