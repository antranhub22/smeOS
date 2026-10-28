import { MotherGovernanceMatrixClient } from "@/components/governance/mother-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Chính Sách & Thỏa Thuận | SaaS Mother",
  description: "Quản trị chính sách đổi trả, thỏa thuận dịch vụ và SLA xử lý khiếu nại khách hàng toàn hệ thống.",
}

export default function MotherPoliciesMatrixPage() {
  return <MotherGovernanceMatrixClient defaultTab="POLICIES" />
}
