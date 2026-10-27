import { MotherGovernanceMatrixClient } from "@/components/governance/mother-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Thanh Toán & Đặt Cọc | SaaS Mother",
  description: "Quản trị danh mục cổng thanh toán, sàn đặt cọc tối thiểu và cơ chế khớp tiền tự động.",
}

export default function MotherPaymentMatrixPage() {
  return <MotherGovernanceMatrixClient defaultTab="PAYMENTS" />
}
