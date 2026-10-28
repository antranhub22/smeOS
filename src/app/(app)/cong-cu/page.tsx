/**
 * Trang chủ 48 công cụ kinh doanh smeOS.
 *
 * Route: /cong-cu
 *
 * - Dev: hiển thị toàn bộ 48 chức năng phân nhóm kèm trạng thái
 * - Production: chỉ hiển thị các chức năng đã hoàn thiện
 *
 * Branch: Nangcap_hethongchucnang (KHÔNG PR/merge)
 */

import { getDictionary, translate } from "@/lib/i18n/server"
import { cookies } from "next/headers"
import { resolveAppSession } from "@/modules/organization/use-cases/resolve-app-session"
import { ToolkitHome } from "@/components/dashboard/toolkit-home"

export default async function ToolkitPage() {
  const dict = getDictionary("vi")
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const session = await resolveAppSession(cookieHeader)
  if (!session) return null

  return <ToolkitHome />
}
