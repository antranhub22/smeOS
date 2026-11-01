import React from "react"
import {
  ShieldCheck,
  MapPin,
  Globe,
  Calendar,
  Users,
  Target,
  CreditCard,
  TrendingUp,
} from "@/components/ui/icons"
import type {
  PartnerStoreIdentity,
  PartnerStoreContact,
  PartnerStoreDigital,
  PartnerStoreBusiness,
  PartnerStoreMedia,
} from "@/modules/platform/domain/partner-marketplace.types"

interface MarketplaceOverviewTabProps {
  identity: PartnerStoreIdentity
  contact: PartnerStoreContact
  digital: PartnerStoreDigital
  business: PartnerStoreBusiness
  media?: PartnerStoreMedia
}

export function MarketplaceOverviewTab({
  identity,
  contact,
  digital,
  business,
  media,
}: MarketplaceOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Identity & Legal */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> 1. Nhận diện & Pháp lý
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Tên thương hiệu:</span>
            <span className="font-bold text-text">{identity.shopName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Tên pháp nhân:</span>
            <span className="font-medium text-right">{identity.legalName || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Chủ sở hữu / Người đại diện:</span>
            <span className="font-semibold text-text">{identity.ownerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Người phụ trách liên hệ:</span>
            <span className="font-medium">{identity.contactPerson || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Mã số thuế:</span>
            <span className="font-mono font-medium">{identity.taxCode || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Thời gian hoạt động:</span>
            <span className="font-medium">{identity.operatingYears || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Quy mô mạng lưới:</span>
            <span className="font-medium">{identity.scale || "1 cửa hàng"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-1">Tuân thủ pháp lý & quy chuẩn:</span>
            <span className="font-medium bg-success-bg text-success-text px-2 py-1 rounded inline-block text-caption">
              {identity.legalCompliance || "Đang cập nhật"}
            </span>
          </div>
          {media?.requiredDocuments && (
            <div className="py-1">
              <span className="text-text-muted block mb-0.5">Hồ sơ pháp lý cung cấp:</span>
              <span className="font-medium text-text">{media.requiredDocuments}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Contact & Location */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> 2. Liên hệ & Địa bàn
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Hotline:</span>
            <span className="font-mono font-bold text-primary">{contact.phone || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Email:</span>
            <span className="font-medium">{contact.email || "---"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Địa chỉ cửa hàng:</span>
            <span className="font-medium text-text">{contact.address || "---"}</span>
          </div>
          {contact.googleMaps && (
            <div className="py-1">
              <span className="text-text-muted block mb-0.5">Bản đồ / Tọa độ GPS:</span>
              <span className="font-mono text-caption text-text-muted break-all">{contact.googleMaps}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Digital Presence & Marketing */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Globe className="h-4 w-4" /> 3. Hiện diện số & Marketing
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Facebook:</span>
            <span className="font-medium truncate max-w-[220px]">
              {digital.facebook && digital.facebook !== "không" && digital.facebook !== "không có" ? (
                <span className="font-mono text-text-muted">{digital.facebook}</span>
              ) : (
                "Chưa có"
              )}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Followers Facebook:</span>
            <span className="font-bold text-info">{digital.facebookFollowers || "0"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Kênh TikTok:</span>
            <span className="font-medium truncate max-w-[220px]">
              {digital.tiktok && digital.tiktok !== "không" && digital.tiktok !== "không có" ? (
                <span className="font-mono text-text-muted">{digital.tiktok}</span>
              ) : (
                "Chưa có"
              )}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Followers TikTok:</span>
            <span className="font-medium">{digital.tiktokFollowers || "0"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Website chính thức:</span>
            <span className="font-medium truncate max-w-[220px]">
              {digital.website && digital.website !== "không" && digital.website !== "không có" ? (
                <span className="font-mono text-text-muted">{digital.website}</span>
              ) : (
                "Chưa có"
              )}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Google Review / Maps:</span>
            <span className="font-medium">{digital.googleReview || "Chưa có"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Tần suất đăng bài / tuần:</span>
            <span className="font-medium">{digital.postingFrequency || "---"} bài</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Kênh nhận đơn online:</span>
            <span className="font-medium text-right">{digital.onlineOrderChannels || "Chưa chia sẻ"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Chạy quảng cáo & Livestream:</span>
            <span className="font-medium">{digital.adsAndLivestream || "Không"}</span>
          </div>
        </div>
      </div>

      {/* 4. Business & Customers */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface-alt/30">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Calendar className="h-4 w-4" /> 4. Kinh doanh & Khách hàng
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Doanh thu TB/tháng:</span>
            <span className="font-bold text-success">{business.monthlyRevenue || "Chưa chia sẻ"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">AOV (Giá trị đơn TB):</span>
            <span className="font-medium">{business.aov || "---"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Đơn ngày thường / Cao điểm:</span>
            <span className="font-medium">
              {business.dailyOrdersNormal || "---"} / {business.dailyOrdersPeak || "---"} đơn
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-text-muted">Tỷ trọng B2B / Doanh nghiệp:</span>
            <span className="font-medium">{business.b2bShare || "---"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Khách hàng mục tiêu:</span>
            <span className="font-medium text-text">{business.targetCustomers || "Cá nhân, Doanh nghiệp"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Nguồn khách hàng chủ yếu:</span>
            <span className="font-medium text-text">{business.customerSources || "Khách quen, Vãng lai"}</span>
          </div>
          <div className="py-1 border-b border-border/50">
            <span className="text-text-muted block mb-0.5">Phương thức thanh toán:</span>
            <span className="font-medium text-text">{business.paymentMethods || "Tiền mặt, Chuyển khoản"}</span>
          </div>
          {business.challenges && (
            <div className="py-1 border-b border-border/50">
              <span className="text-text-muted block mb-0.5">Khó khăn / Thách thức:</span>
              <span className="font-medium text-warning-text">{business.challenges}</span>
            </div>
          )}
          {business.goals12m && (
            <div className="py-1">
              <span className="text-text-muted block mb-0.5">Mục tiêu phát triển 12 tháng:</span>
              <span className="font-medium text-text">{business.goals12m}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
