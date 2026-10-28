import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Cam Kết Chất Lượng | smeOS",
  description: "Quản lý tiêu chuẩn cam kết chất lượng sản phẩm.",
}

export default function CommitmentsPage() {
  return (
    <TierGovernanceMatrixClient
      systemKey="COMMITMENTS"
      title="Ma Trận Cam Kết Chất Lượng"
      description="Quản lý các cam kết chất lượng sản phẩm (đúng tone màu, đúng mẫu, kiểm tra QC) niêm yết công khai với khách hàng."
    />
  )
}
