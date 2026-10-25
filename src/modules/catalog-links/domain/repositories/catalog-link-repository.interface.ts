/**
 * Catalog Link Repository Port (Domain Interface).
 * Pure TypeScript — No Prisma imports.
 * Belongs to Domain Layer of Catalog Links Module.
 */

import type { TenantContext } from "@/core/tenancy"

export interface CatalogLinkRecord {
  id: string
  organization_id: string
  slug: string
  name: string
  description: string | null
  filters: unknown
  is_revoked: boolean
  revoked_at: Date | null
  revoked_by: string | null
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateCatalogLinkInput {
  slug: string
  name: string
  description?: string | null | undefined
  filters?: Record<string, unknown> | null | undefined
  createdBy: string
}

export interface UpdateCatalogLinkInput {
  name?: string | undefined
  description?: string | null | undefined
  filters?: Record<string, unknown> | null | undefined
}

export interface CatalogLeadInput {
  phone: string
  message: string | null
  submittedAt: string
}

export interface ICatalogLinkRepository {
  findBySlug(slug: string): Promise<CatalogLinkRecord | null>
  findBySlugInOrg(ctx: TenantContext, slug: string): Promise<CatalogLinkRecord | null>
  create(ctx: TenantContext, input: CreateCatalogLinkInput): Promise<CatalogLinkRecord>
  list(ctx: TenantContext, options?: { includeRevoked?: boolean }): Promise<CatalogLinkRecord[]>
  update(ctx: TenantContext, slug: string, input: UpdateCatalogLinkInput): Promise<CatalogLinkRecord | null>
  revoke(ctx: TenantContext, slug: string, revokedBy: string): Promise<boolean>
  getPublicCatalogRaw(slug: string): Promise<unknown>
  recordLead(slug: string, lead: CatalogLeadInput): Promise<boolean | null>
}
