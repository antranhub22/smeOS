"use client"

import React from "react"
import { Share2 } from "@/components/ui/icons"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { useI18n } from "@/lib/i18n"

export function PublishingGuidanceCard() {
  const { ti } = useI18n()
  const sampleProduct = ti("sampleProduct") || "sản phẩm"

  return (
    <FeatureGuidanceCard
      tag="HƯỚNG DẪN ĐĂNG BÀI MẠNG XÃ HỘI M07"
      icon={Share2}
      title="Lập lịch & Tự động xuất bản đa kênh"
      description="Quản lý lịch phân phối bài viết đồng bộ lên Facebook Fanpage, Zalo OA và Instagram theo các khung giờ tương tác cao nhất trong ngày."
      tips={[
        `⏰ Khung giờ vàng khuyến nghị: 8h30 sáng (chào ngày mới), 11h30 trưa (thư giãn) và 19h30 tối (đặt ${sampleProduct} ngày mai)`,
        "🔗 Kiểm tra kết nối token trang trước khi xếp lịch để đảm bảo bài không bị ngắt quãng",
        "📊 Xem trạng thái xuất bản tức thì qua nhật ký phân phối đa kênh",
      ]}
    />
  )
}
