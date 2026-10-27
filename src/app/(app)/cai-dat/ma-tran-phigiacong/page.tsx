import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Phí Gia Công & Thợ | smeOS",
  description: "Quản lý biểu phí khoán thợ và chính sách gia công.",
}

export default function CraftFeesPage() {
  return (
    <TierGovernanceMatrixClient
      systemKey="CRAFT_FEES"
      title="Ma Trận Phí Gia Công & Thợ"
      description="Quản lý phương án tính phí gia công, phụ cấp đơn gấp và biểu phí khoán thợ chế tác trong chuỗi."
    />
  )
}
