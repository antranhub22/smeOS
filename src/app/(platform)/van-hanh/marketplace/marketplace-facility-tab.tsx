import React from "react"
import { Truck, Home, Cpu, Users } from "@/components/ui/icons"
import type { PartnerStoreFacilityAndDelivery } from "@/modules/platform/domain/partner-marketplace.types"

interface MarketplaceFacilityTabProps {
  facility: PartnerStoreFacilityAndDelivery
}

export function MarketplaceFacilityTab({ facility }: MarketplaceFacilityTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Premises, Coolers & Equipment */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Home className="h-4 w-4" /> Cơ Sở Vật Chất & Thiết Bị
        </h4>
        <div className="space-y-2 text-xs">
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Mặt bằng cửa hàng:</span>
            <span className="font-medium text-text">{facility.premises || "---"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Không gian & khu vực chức năng:</span>
            <span className="font-medium text-text">{facility.space || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Tủ mát trưng bày hoa:</span>
            <span className="font-medium text-text">{facility.coolers || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Kho lạnh bảo quản riêng:</span>
            <span className="font-medium text-text">{facility.coldStorage || "Không có"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Trang thiết bị hỗ trợ:</span>
            <span className="font-medium text-text">{facility.equipment || "Máy tính tiền, POS, Máy in"}</span>
          </div>
          <div className="py-1">
            <span className="text-text-muted block mb-0.5">Đánh giá nhân lực & vận hành:</span>
            <span className="font-medium text-text">{facility.staffing || "Đủ nhân sự, chuyên nghiệp"}</span>
          </div>
        </div>
      </div>

      {/* 2. Delivery & Logistics */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Truck className="h-4 w-4" /> Năng Lực Giao Vận (Delivery & Logistics)
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Phương tiện giao vận:</span>
            <span className="font-medium text-text">{facility.deliveryVehicles || "Xe máy, Đội giao nội bộ"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Bán kính / Phạm vi giao hàng:</span>
            <span className="font-bold text-text">{facility.deliveryRadius || "Nội thành"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Thời gian giao cam kết:</span>
            <span className="font-medium text-text">{facility.deliveryCommitmentTime || "Đúng hẹn"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Khả năng giữ lạnh khi giao xa:</span>
            <span className="font-medium text-text">{facility.coldDeliveryAbility || "---"}</span>
          </div>
          <div className="py-1">
            <span className="text-text-muted block mb-0.5">Chính sách phí giao hàng:</span>
            <span className="font-medium text-text">{facility.deliveryFeePolicy || "Theo biểu phí thỏa thuận"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

