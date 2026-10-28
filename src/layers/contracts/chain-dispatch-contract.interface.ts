/**
 * chain-dispatch-contract.interface.ts
 *
 * Public Domain Contract giữa ChainOS (Chuỗi/Điện hoa) và StoreOS (Cửa hàng cơ sở).
 * Pure TypeScript — Tuyệt đối không import Prisma Client hay Infra.
 * Cho phép tách ChainOS và StoreOS thành 2 Git repo độc lập bất kỳ lúc nào.
 */

export interface SubcontractOrderPayload {
  orderId: string
  orderCode: string
  /** Mã chuỗi hoặc mã công ty mẹ phát lệnh */
  chainId: string
  /** Tên hoặc loại sản phẩm hoa (Bó hoa, Giỏ hoa, Kệ khai trương...) */
  productName: string
  /** Chi tiết mẫu cắm, yêu cầu thiết kế hoặc ảnh tham chiếu */
  recipeDescription?: string | null
  sampleImageUrl?: string | null
  /** Khung giờ giao hàng cam kết với khách */
  deliveryDeadline: Date
  deliveryAddress: {
    recipientName: string
    recipientPhone: string
    fullAddress: string
    ward?: string
    district?: string
    province?: string
  }
  /** Đơn giá khoán công cho shop nhận cắm (VND) */
  craftFeeVnd: number
  /** Ghi chú đặc biệt hoặc thiệp chúc mừng */
  cardMessage?: string | null
  specialNotes?: string | null
}

export interface SubcontractClaimResult {
  success: boolean
  claimedAt: Date
  assignedShopId: string
  message: string
}

export interface SubcontractQcSubmission {
  orderId: string
  shopId: string
  photoUrls: string[]
  completedAt: Date
  note?: string
}

export interface IChainDispatchContract {
  /**
   * Phát lệnh mời gia công đơn hoa tới cửa hàng đối tác
   */
  dispatchOrderToPartner(
    partnerShopId: string,
    payload: SubcontractOrderPayload
  ): Promise<{ inviteId: string; status: "SENT" | "FAILED" }>

  /**
   * Cửa hàng đối tác bấm nhận đơn (Claim)
   */
  claimSubcontractOrder(
    orderId: string,
    partnerShopId: string
  ): Promise<SubcontractClaimResult>

  /**
   * Cửa hàng đối tác gửi ảnh QC thành phẩm trước giờ giao
   */
  submitQcPhotos(submission: SubcontractQcSubmission): Promise<{
    approved: boolean
    feedback?: string
  }>
}
