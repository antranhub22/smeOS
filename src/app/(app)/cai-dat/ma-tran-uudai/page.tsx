import { TierGovernanceMatrixClient } from "@/components/governance/tier-governance-matrix-client"

export const metadata = {
  title: "Ma Trận Ưu Đãi & Khuyến Mãi | smeOS",
  description: "Quản lý danh mục ưu đãi và voucher phân tầng.",
}

export default function PromotionsPage() {
  return (
    <TierGovernanceMatrixClient
      systemKey="PROMOTIONS"
      title="Ma Trận Ưu Đãi & Khuyến Mãi"
      description="Quản lý và kích hoạt các ưu đãi, voucher giảm giá áp dụng cho khách hàng khi đặt mua qua Thẻ chào và Catalog."
    />
  )
}
