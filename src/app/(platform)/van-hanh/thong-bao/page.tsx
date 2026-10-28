import { MotherNotificationMatrixClient } from "@/components/notification/mother-notification-matrix-client"

export const metadata = {
  title: "Ma Trận Thông Báo Toàn Hệ Thống | smeOS",
  description: "Quản trị danh mục sự kiện, khóa cứng (Hard Lock) và phân phối thông báo 4 tầng kiến trúc.",
}

export default function MotherNotificationMatrixPage() {
  return <MotherNotificationMatrixClient />
}
