/**
 * Partner Repository Port (Domain Interface).
 * Belongs to Coordinator / Network module (Chain OS).
 * Pure TypeScript — No Prisma or external infrastructure imports.
 */

import type { TenantContext } from "@/core/tenancy"

export interface PartnerEntity {
  id: string
  organization_id: string
  code: string
  name: string
  phone: string
  address: string | null
  district: string | null
  province: string | null
  tier: string
  capacity_daily: number
  is_active: boolean
  rating: number
  created_at: Date
  updated_at: Date
}

export interface CreatePartnerInput {
  code: string
  name: string
  phone: string
  address: string | null
  district: string | null
  province: string | null
  tier: string
  capacityDaily: number
}

export interface IPartnerRepository {
  listPartners(ctx: TenantContext, options: { activeOnly: boolean }): Promise<PartnerEntity[]>
  findPartner(ctx: TenantContext, id: string): Promise<PartnerEntity | null>
  createPartner(ctx: TenantContext, data: CreatePartnerInput): Promise<PartnerEntity>
  updatePartner(
    ctx: TenantContext,
    id: string,
    data: Partial<{
      code: string
      name: string
      phone: string
      address: string | null
      district: string | null
      province: string | null
      tier: string
      capacity_daily: number
      is_active: boolean
      rating: number
    }>
  ): Promise<void>
  countActiveOrdersForPartner(ctx: TenantContext, partnerId: string): Promise<number>
}
