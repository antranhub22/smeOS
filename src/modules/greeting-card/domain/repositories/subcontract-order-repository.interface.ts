/**
 * Subcontract Order Repository Port (Domain Interface).
 * Pure TypeScript — No Prisma imports.
 * Belongs to Domain Layer of M05 — Greeting Card (Store OS).
 *
 * Ranh giới: Repository này cung cấp quyền truy cập vào dữ liệu đơn gia công
 * từ góc nhìn của Coordinator Stream. Dữ liệu đơn hàng gốc thuộc về `orders` module —
 * interface này chỉ expose những gì cần thiết cho workflow điều phối.
 *
 * NOTE: findSubcontractByCode/findSubcontractById trả về kiểu dữ liệu Prisma phong phú
 * (kèm include) nên dùng `Promise<unknown>` để tương thích, caller cần cast sang kiểu phù hợp.
 */

export interface BranchLookupResult {
  id: string
  name: string
  is_active: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubcontractOrderRecord = Record<string, any>

export interface ISubcontractOrderRepository {
  /** Tìm đơn gia công theo mã đơn công khai (không scope tenant). */
  findSubcontractByCode(orderCode: string): Promise<SubcontractOrderRecord | null>

  /** Tìm đơn gia công theo ID nội bộ có scope tenant. */
  findSubcontractById(orderId: string, organizationId: string): Promise<SubcontractOrderRecord | null>

  /** Tìm thông tin chi nhánh trong tổ chức (DB + settings.chain_branches). */
  findBranchInOrganization(branchId: string, orgId: string): Promise<BranchLookupResult | null>

  /** Ghi nhận hình phạt KPI khi chi nhánh hủy nhận đơn. */
  recordBranchCancellationPenalty(
    orgId: string,
    branchId: string,
    reason?: string
  ): Promise<{ newQualityScore: number; cancellationCount: number }>

  /** Ghi nhận hình phạt KPI khi Coordinator duyệt bypass. */
  recordBranchBypassPenalty(
    orgId: string,
    branchId: string,
    reason?: string
  ): Promise<{ newQualityScore: number; bypassCount: number }>
}
