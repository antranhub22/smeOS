/**
 * MOTHER NOTIFICATION MATRIX — Trang quản lý thông báo tầng Nền tảng
 *
 * Admin nền tảng (SaaS Mother) quản lý:
 * - Toàn bộ events của tất cả 4 tầng
 * - Channel activation (bật/tắt kênh gửi toàn hệ thống)
 * - Hard Lock cấp cao nhất — không tầng nào ghi đè được
 * - Visibility: event nào hiện ở tầng nào
 */
"use client"

import { NotificationMatrixPage } from "@/components/notification/notification-matrix-page"
import { useNotificationMatrix } from "@/components/notification/use-notification-matrix"

export function MotherNotificationMatrixClient() {
  const {
    sections,
    activeChannels,
    loading,
    toggleCell,
    toggleHardLock,
    removeHardLock,
  } = useNotificationMatrix({
    viewerTier: "MOTHER",
    scopeId: "GLOBAL",
  })

  return (
    <NotificationMatrixPage
      viewerTier="MOTHER"
      title="Ma Trận Thông Báo — Nền Tảng"
      description="Quản lý toàn bộ sự kiện thông báo, kênh gửi, khóa cứng và phân phối hiển thị cho tất cả các tầng trong hệ thống."
      scopeId="GLOBAL"
      activeChannels={activeChannels}
      sections={sections}
      canManageHardLocks={true}
      onToggleCell={toggleCell}
      onToggleHardLock={toggleHardLock}
      onRemoveHardLock={removeHardLock}
      loading={loading}
    />
  )
}
