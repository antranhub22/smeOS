/**
 * Trang Trung tâm Tích hợp: tổng quan (L0) + danh mục theo tầng/gói (L1) + kết nối hiện có.
 * Quyền: W1. Không trả bí mật — chỉ `credentialHint`.
 */

import { requireCapability } from "@/core/rbac/capabilities"
import type { TenantContext } from "@/core/tenancy"
import { availabilityOf, canStartConnect, type ConnectorAvailability } from "../domain/catalog-availability"
import { CONNECTOR_CATALOG } from "../domain/connector-catalog"
import type { ConnectorManifest } from "../domain/connector-manifest"
import { needsAttention } from "../domain/connection-lifecycle"
import { toView, type ConnectionView } from "../infra/connection-repository"
import { defaultHubDeps, type HubDeps } from "./hub-deps"

export interface CatalogItem {
  readonly key: string
  readonly category: ConnectorManifest["category"]
  readonly label: string
  readonly description: string
  readonly availability: ConnectorAvailability
  readonly canConnect: boolean
  readonly auth: ConnectorManifest["auth"]
  readonly legacyHref: string | null
}

export interface IntegrationHubView {
  readonly overview: { active: number; needsAttention: number; failedEvents24h: number }
  readonly catalog: CatalogItem[]
  readonly connections: ConnectionView[]
}

export async function getIntegrationHub(ctx: TenantContext, deps: HubDeps = defaultHubDeps()): Promise<IntegrationHubView> {
  requireCapability(ctx, "W1")
  const [profile, records] = await Promise.all([deps.loadProfile(ctx), deps.connections.list(ctx)])
  const since = new Date(deps.now().getTime() - 24 * 3_600_000)
  const [failed, dead] = await Promise.all([
    deps.events.countByStatusSince(ctx, "FAILED", since),
    deps.events.countByStatusSince(ctx, "DEAD", since),
  ])
  const connectedKeys = new Set(records.map((r) => r.connectorKey))
  const input = { tier: profile.tier, planFeatures: profile.planFeatures, connectedKeys, isProduction: deps.isProduction }

  const catalog = CONNECTOR_CATALOG.map((m) => ({ manifest: m, availability: availabilityOf(m, input) }))
    .filter(({ availability }) => availability !== "HIDDEN")
    .map(({ manifest, availability }) => ({
      key: manifest.key,
      category: manifest.category,
      label: manifest.label,
      description: manifest.description,
      availability,
      canConnect: canStartConnect(availability, manifest) && deps.getConnector(manifest.key) !== null,
      auth: manifest.auth,
      legacyHref: manifest.legacyHref ?? null,
    }))

  return {
    overview: {
      active: records.filter((r) => r.status === "ACTIVE").length,
      needsAttention: records.filter((r) => needsAttention(r.status)).length,
      failedEvents24h: failed + dead,
    },
    catalog,
    connections: records.map(toView),
  }
}
