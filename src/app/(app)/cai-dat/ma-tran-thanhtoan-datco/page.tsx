"use client"

import { useI18n } from "@/lib/i18n"
import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"


export default function PaymentsPage() {
  const { t } = useI18n()
  return (
    <TierGovernanceMatrixClient
      systemKey="PAYMENTS"
      title="Ma Trận Thanh Toán & Đặt Cọc"
      description="Quản lý chính sách đặt cọc theo tỷ lệ %, thời hạn giữ đơn và hình thức thanh toán VietQR động."
    />
  )
}
