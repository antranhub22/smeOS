import { MotherGovernanceMatrixClient } from "@/components/governance/mother-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Ưu Đãi & Khuyến Mãi | SaaS Mother",
  description: "Quản trị danh mục ưu đãi, trần giảm giá toàn sàn và chính sách voucher phân tầng 4 cấp.",
}

export default function MotherPromotionsMatrixPage() {
  return <MotherGovernanceMatrixClient defaultTab="PROMOTIONS" />
}
