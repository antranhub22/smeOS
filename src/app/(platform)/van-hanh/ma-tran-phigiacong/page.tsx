import { MotherGovernanceMatrixClient } from "@/components/governance/mother-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Phí Gia Công & Thợ | SaaS Mother",
  description: "Quản trị sàn tiền công tối thiểu, trần khấu trừ phạt lỗi gia công và chính sách bảo vệ thợ chế tác.",
}

export default function MotherCraftFeesMatrixPage() {
  return <MotherGovernanceMatrixClient defaultTab="CRAFT_FEES" />
}
