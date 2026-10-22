import { cache } from "react"

import type { MockSession } from "@/lib/mock-data"
import { getNavHiddenOverride } from "@/modules/platform/infra/nav-matrix-store"
import { PlatformOperatorRepository } from "@/modules/platform/infra/platform-operator-repository"
import { canOverrideIndustryLock } from "@/modules/organization/domain/organization-settings-policy"
import { describeSession } from "./describe-session"
import { resolveSession } from "./resolve-session"

function viettatTen(name: string | null, email: string): string {
  const nguon = (name ?? email).trim()
  const phan = nguon.split(/\s+/).filter(Boolean)
  const chu = phan.length >= 2 ? phan[0]!.charAt(0) + phan[phan.length - 1]!.charAt(0) : nguon.slice(0, 2)
  return chu.toUpperCase()
}

/**
 * Dựng `MockSession` (khuôn dữ liệu cho `SessionProvider`) từ phiên đăng
 * nhập thật (cookie `floraos_session`) — dùng chung cho layout (dựng
 * `SessionProvider`) và trang chủ (chọn Admin Dashboard hay Experience Grid
 * theo `workspace.kind` THẬT).
 *
 * Trước đây trang chủ chọn màn theo tham số URL thủ công
 * `?che_do=trai-nghiem` (đã gỡ) — bất kỳ ai gõ URL đó cũng thấy Experience
 * Grid bất kể workspace thật của họ là gì. Giờ đọc đúng `workspace.kind` từ
 * CSDL: tài khoản tự đăng ký qua `POST /auth/signup` luôn được tạo workspace
 * `EXPERIENCE` (`sign-up.ts`), nên tự thấy đúng màn Trải nghiệm mà không cần
 * mẹo URL nào.
 *
 * Bọc `cache()` để layout và trang chủ cùng gọi hàm này trong một request
 * chỉ tính một lượt truy vấn CSDL, không phải hai.
 */
export const resolveAppSession = cache(async function resolveAppSession(
  cookieHeader: string
): Promise<MockSession | null> {
  const request = new Request("http://localhost/", { headers: { cookie: cookieHeader } })

  const resolved = await resolveSession(request).catch(() => null)
  if (!resolved || !resolved.ctx || !resolved.membership) return null

  const described = await describeSession(resolved)

  const rawOrgName = described.organization?.name ?? "smeOS"
  const cleanOrgName = rawOrgName.replace(/\s*\(\s*dev\s*\)/gi, "").trim()
  const orgSettings = (described.organization?.settings as Record<string, unknown> | null) ?? null
  const industry = typeof orgSettings?.industry === "string" ? orgSettings.industry : "FLORAL"
  // Quyền vượt khoá ngành lấy từ mã năng lực nền tảng (N1/N12), không từ đuôi email (rà soát H11)
  const operator = await new PlatformOperatorRepository().findActiveByUserId(described.user.id)
  const platformCapabilities = operator?.capabilityCodes ?? []
  const industryLocked = canOverrideIndustryLock(platformCapabilities) ? false : Boolean(orgSettings?.industry_locked)
  // Ma trận điều hướng Admin SaaS ghi đè cho ngành này — đọc ở máy chủ, không đóng gói lúc build (M13)
  const navHiddenKeys = await getNavHiddenOverride(industry)

  return {
    userName: described.user.name ?? described.user.email,
    userEmail: described.user.email,
    userInitials: viettatTen(described.user.name, described.user.email),
    orgName: cleanOrgName,
    workspaceKind: (described.workspace?.kind as MockSession["workspaceKind"]) ?? "PRODUCTION",
    capabilities: described.capabilities,
    platformCapabilities,
    organization: described.organization
      ? {
          id: described.organization.id,
          name: cleanOrgName,
          industry,
          industryLocked,
          navHiddenKeys,
        }
      : undefined,
    // Đặc tả 03b (Role UX): khoá vai + loại tổ chức để chọn trang chủ/thứ tự
    // điều hướng theo vai. Đã có sẵn trong `describeSession` (GET /auth/me).
    roleKey: described.membership?.role_key ?? null,
    organizationType: described.organization?.type ?? null,
    pendingModelChange:
      (orgSettings?.pending_model_change as MockSession["pendingModelChange"]) ?? null,
  }
})
