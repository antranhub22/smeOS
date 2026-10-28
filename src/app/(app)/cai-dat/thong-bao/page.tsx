"use client"

import { useI18n } from "@/lib/i18n"
import { TierNotificationMatrixClient } from "@/components/notification/tier-notification-matrix-client"
import { useSession } from "@/lib/session"

export default function NotificationSettingsPage() {
  const { t } = useI18n()
  const { organizationType, organization } = useSession()

  // Xác định viewer tier tương ứng
  const viewerTier =
    organizationType === "INDUSTRY"
      ? "INDUSTRY"
      : organizationType === "CHAIN" || organizationType === "HEADQUARTERS"
      ? "CHAIN"
      : "STORE"

  const tierName =
    viewerTier === "INDUSTRY"
      ? "Ngành Hàng"
      : viewerTier === "CHAIN"
      ? "Chuỗi Chi Nhánh"
      : "Cửa Hàng"

  return (
    <TierNotificationMatrixClient
      viewerTier={viewerTier}
      title={`Ma Trận Quản Lý Thông Báo — ${tierName}`}
      description={`Thiết lập cơ chế nhận thông báo cho tài khoản và nhân sự trực thuộc ${organization?.name ?? tierName}. Bạn có thể thiết lập bật/tắt các kênh gửi và ban hành Khóa cứng (Hard Lock) cấp ${tierName}.`}
    />
  )
}
