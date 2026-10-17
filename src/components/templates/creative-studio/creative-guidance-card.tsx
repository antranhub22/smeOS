"use client"

import React from "react"
import { Wand2, Sparkles, Package, Camera } from "lucide-react"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { useSession } from "@/lib/session"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"

export interface CreativeGuidanceCardProps {
  area?: "area-a" | "area-b" | "area-c" | "area-d" | "area-e" | "area-f"
}

export function CreativeGuidanceCard({ area = "area-a" }: CreativeGuidanceCardProps) {
  const { organization } = useSession()
  const ti = getIndustryTerminology(organization?.industry)

  if (area === "area-b") {
    return (
      <FeatureGuidanceCard
        tag="HƯỚNG DẪN BIẾN THỂ MARKETING M04b"
        icon={Sparkles}
        title="Sinh biến thể tiếp thị trên Master Image đã duyệt"
        description={`Tách nền trong suốt PNG (AIC-11) hoặc ghép ${ti.sampleProduct} vào bối cảnh sang trọng. Biến thể tiếp thị tuyệt đối không làm biến dạng hình dáng và màu sắc sản phẩm thật.`}
        tips={[
          "🎯 Tách nền trong suốt (AIC-11) sẵn sàng cho thiết kế banner quảng cáo",
          "✨ Chọn bối cảnh Studio, Tiệc cưới, Phòng khách theo từng chiến dịch",
          `🔒 Ranh giới bất biến: ${ti.sampleProduct} được bảo toàn 100%, không sinh pixel làm sai sản phẩm`,
          "🏷️ Tự động đóng dấu Watermark bản quyền logo thương hiệu của shop",
        ]}
      />
    )
  }

  if (area === "area-f") {
    return (
      <FeatureGuidanceCard
        tag="HƯỚNG DẪN GÓI CHIẾN DỊCH CHẶNG 07"
        icon={Package}
        title="Đóng gói chiến dịch marketing hoàn chỉnh"
        description="Tổng hợp tất cả tài sản đã sản xuất (nội dung, ảnh, video, audio) thành gói chiến dịch sẵn sàng duyệt và xuất bản đa kênh."
        tips={[
          "📦 Tổng hợp tất cả assets: Caption, Ảnh biến thể, Video, Audio",
          "💰 Kiểm tra chi phí credit trước khi sản xuất",
          "✅ Duyệt từng tài sản trước khi xuất bản",
          "🚀 Xuất bản 1-chạm lên đa kênh (Facebook, TikTok, Zalo)",
        ]}
      />
    )
  }

  if (area === "area-a") {
    return (
      <FeatureGuidanceCard
        tag="HƯỚNG DẪN QUÉT THEO ẢNH SẢN PHẨM CHẶNG 1-5"
        icon={Camera}
        title={`Bóc tách ảnh ${ti.sampleProduct} & Chọn chủ đề trọng tâm`}
        description={`Đưa ảnh thật ${ti.sampleProduct} của cửa hàng vào. Vision AI bóc tách cấu trúc ${ti.rawMaterialItem}, chấm điểm khớp xu hướng và chọn chủ đề nội dung để kích hoạt sản xuất.`}
        tips={[
          `📸 Đưa ảnh thật của ${ti.sampleProduct} vào để Vision AI bóc tách chi tiết ${ti.rawMaterialItem}`,
          "🔥 Chấm điểm Trend Fit & gợi ý 10 chủ đề nội dung kèm Dẫn chứng Video Kép",
          "🎯 Chọn chủ đề trọng tâm để bắt đầu sáng tạo nội dung ở các Khu vực B đến F",
        ]}
      />
    )
  }

  return (
    <FeatureGuidanceCard
      tag="HƯỚNG DẪN SÁNG TẠO NỘI DUNG CREATIVE STUDIO"
      icon={Wand2}
      title="Hệ thống Sáng tạo Đa phương tiện Khép kín"
      description={`Sản xuất nội dung, ảnh biến thể, video và audio đồng bộ từ chủ đề ${ti.sampleProduct} đã chọn.`}
      tips={[
        "✍️ Khu vực B: Soạn kịch bản & bài đăng đa kênh (Facebook, TikTok, Zalo)",
        "🎙️ Khu vực C: Thu âm lồng tiếng AI & phối nhạc nền cảm xúc",
        `🖼️ Khu vực D: Sinh biến thể ảnh tiếp thị bảo toàn nguyên vẹn ${ti.sampleProduct} thật`,
        "🎬 Khu vực E: Dựng video marketing 9:16 chuẩn Reels/TikTok",
      ]}
    />
  )
}
