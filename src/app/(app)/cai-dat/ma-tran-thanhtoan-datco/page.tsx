import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Thanh Toán & Đặt Cọc | smeOS",
  description: "Quản lý kế hoạch thanh toán và tỷ lệ cọc đơn hàng.",
}

export default function PaymentsPage() {
  return (
    <TierGovernanceMatrixClient
      systemKey="PAYMENTS"
      title="Ma Trận Thanh Toán & Đặt Cọc"
      description="Quản lý chính sách đặt cọc theo tỷ lệ %, thời hạn giữ đơn và hình thức thanh toán VietQR động."
    />
  )
}
