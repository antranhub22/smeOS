import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Chính Sách & Thỏa Thuận | smeOS",
  description: "Quản lý chính sách đổi trả và thỏa thuận đơn hàng.",
}

export default function PoliciesPage() {
  return (
    <TierGovernanceMatrixClient
      systemKey="POLICIES"
      title="Ma Trận Chính Sách & Thỏa Thuận"
      description="Quản lý chính sách đổi trả, bảo hành và các thỏa thuận cần khách hàng xác nhận trước khi thanh toán đơn hàng."
    />
  )
}
