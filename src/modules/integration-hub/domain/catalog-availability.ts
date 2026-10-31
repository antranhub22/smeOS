/**
 * Trạng thái hiển thị của từng đầu nối với một tổ chức — luật thuần.
 * Thứ tự xét: môi trường → tầng → gói dịch vụ → mức sẵn sàng → đã kết nối.
 */

import type { GovernanceTier } from "@/core/governance/layered-resolver"
import type { ConnectorManifest } from "./connector-manifest"

export type ConnectorAvailability =
  | "HIDDEN"
  | "NOT_FOR_TIER"
  | "INHERITED"
  | "NEEDS_UPGRADE"
  | "COMING_SOON"
  | "LEGACY"
  | "CONNECTED"
  | "AVAILABLE"

export interface AvailabilityInput {
  readonly tier: GovernanceTier
  readonly planFeatures: ReadonlySet<string>
  readonly connectedKeys: ReadonlySet<string>
  readonly isProduction: boolean
  /** Tuyến đang bị khoá tính năng (production). */
  readonly isRouteLocked?: (href: string) => boolean
}

export function availabilityOf(manifest: ConnectorManifest, input: AvailabilityInput): ConnectorAvailability {
  if (manifest.devOnly && input.isProduction) return "HIDDEN"
  const role = manifest.tiers[input.tier]
  if (role === "NONE") return "HIDDEN"
  if (role === "INHERIT") return "INHERITED"
  if (role !== "CONNECT") return "NOT_FOR_TIER"
  if (manifest.planFeature && !input.planFeatures.has(manifest.planFeature)) return "NEEDS_UPGRADE"
  if (manifest.status === "COMING_SOON") return "COMING_SOON"
  if (manifest.featureRoute && input.isRouteLocked?.(manifest.featureRoute)) return "COMING_SOON"
  if (manifest.status === "LEGACY") return "LEGACY"
  // MANAGED: `connectedKeys` gồm cả trạng thái đọc từ phân hệ sẵn có (legacy-connection-status).
  return input.connectedKeys.has(manifest.key) ? "CONNECTED" : "AVAILABLE"
}

/** Có được bắt đầu kết nối mới tại Trung tâm Tích hợp không. */
export function canStartConnect(availability: ConnectorAvailability, manifest: ConnectorManifest): boolean {
  return availability === "AVAILABLE" || (availability === "CONNECTED" && manifest.multiAccount)
}
