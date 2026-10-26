/**
 * Organization Repository Port (Domain Interface).
 * Belongs to Domain Layer of Organization / Tenancy module (Core Platform).
 * Pure TypeScript — No Prisma or external infrastructure imports.
 */

import type { TenantContext } from "@/core/tenancy"

export type OrganizationType =
  | "EXPERIENCE"
  | "SINGLE"
  | "STORE"
  | "CHAIN"
  | "FLOWER_NETWORK"

export interface OrganizationEntity {
  id: string
  name: string
  slug: string
  type: OrganizationType
  credit_balance: number
  credit_plan?: string | null | undefined
  data_region?: string | null | undefined
  settings: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  type: OrganizationType
  credit_balance: number
  settings?: Record<string, unknown> | undefined
}

export interface UpdateOrganizationInput {
  name?: string | undefined
  settings?: Record<string, unknown> | undefined
}

export interface IOrganizationRepository {
  /** Tổ chức đang hoạt động của phiên. Cách ly tuyệt đối theo ctx.organizationId. */
  current(ctx: TenantContext): Promise<OrganizationEntity | null>

  /** Tìm tổ chức theo slug công khai. */
  findBySlug(slug: string): Promise<OrganizationEntity | null>

  /** Đọc tổ chức theo ID (dành cho console vận hành nền tảng). */
  findById(organizationId: string): Promise<OrganizationEntity | null>

  /** Cập nhật tên hoặc cấu hình tổ chức hiện tại. */
  update(ctx: TenantContext, input: UpdateOrganizationInput): Promise<OrganizationEntity | null>

  /** Tạo mới tổ chức lúc đăng ký hoặc cấp phát tài khoản. */
  create(input: CreateOrganizationInput): Promise<OrganizationEntity>

  /** Trừ credit có điều kiện chống đua cho job. */
  tryDeductCredit(ctx: TenantContext, cost: number): Promise<boolean>

  /** Nạp credit cấp nền tảng. */
  topUpCredit(organizationId: string, amount: number): Promise<number | null>

  /** Hoàn credit khi job thất bại hoặc bị huỷ. */
  refundCredit(ctx: TenantContext, amount: number): Promise<void>

  /** Danh sách tổ chức mà user là thành viên. */
  listForUser(userId: string): Promise<OrganizationEntity[]>

  /** Cập nhật settings. */
  updateSettings(ctx: TenantContext, settings: Record<string, unknown>): Promise<void>

  /** Cập nhật loại tổ chức và settings (dành cho console vận hành / nâng cấp gói). */
  updateTypeAndSettings(
    organizationId: string,
    type: OrganizationType,
    settings: Record<string, unknown>
  ): Promise<OrganizationEntity>
}
