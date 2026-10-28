"use client"

import { useI18n } from "@/lib/i18n"
import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"


export default function PoliciesPage() {
  const { t } = useI18n()
  return (
    <TierGovernanceMatrixClient
      systemKey="POLICIES"
      title="Ma Trận Chính Sách & Thỏa Thuận"
      description="Quản lý chính sách đổi trả, bảo hành và các thỏa thuận cần khách hàng xác nhận trước khi thanh toán đơn hàng."
    />
  )
}
