/**
 * partner-settlement-contract.interface.ts
 *
 * Public Domain Contract về Quyết toán, Đối soát & Công nợ giữa ChainOS và StoreOS.
 * Pure TypeScript — Tuyệt đối không import Prisma Client hay Infra.
 */

export interface SettlementBatchItem {
  orderId: string
  orderCode: string
  completedAt: Date
  craftFeeVnd: number
  materialCompensationVnd?: number
  penaltyVnd?: number
  finalPayableVnd: number
}

export interface SettlementStatement {
  statementId: string
  chainId: string
  partnerShopId: string
  periodStart: Date
  periodEnd: Date
  totalOrders: number
  totalCraftFeeVnd: number
  totalPenaltiesVnd: number
  netPayableVnd: number
  status: "DRAFT" | "CONFIRMED" | "PAID"
  items: SettlementBatchItem[]
}

export interface IPartnerSettlementContract {
  /**
   * Tạo bảng kê quyết toán định kỳ (hàng tuần/tháng) cho shop đối tác
   */
  generateStatement(
    chainId: string,
    partnerShopId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SettlementStatement>

  /**
   * Xác nhận thanh toán tiền công cắm hoa cho shop đối tác
   */
  markStatementPaid(
    statementId: string,
    transactionRef: string
  ): Promise<{ success: boolean; paidAt: Date }>
}
