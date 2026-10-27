import { MotherGovernanceMatrixClient } from "@/components/governance/mother-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Cam Kết Chất Lượng | SaaS Mother",
  description: "Quản trị tiêu chuẩn cam kết chất lượng sản phẩm, nghiệm thu hình ảnh và SOP kiểm định toàn sàn.",
}

export default function MotherCommitmentsMatrixPage() {
  return <MotherGovernanceMatrixClient defaultTab="COMMITMENTS" />
}
