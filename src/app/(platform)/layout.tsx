// Console Vận hành Nền tảng — ngữ cảnh song song với `(app)/layout.tsx`
// (chốt 18/09, kế hoạch mục 4.2/4.6). Giải `PlatformContext` từ CÙNG
// cookie phiên (`floraos_session`) nhưng KHÔNG qua `resolveAppSession` —
// hai bảng nguồn (`memberships`, `platform_operators`) độc lập, một tài
// khoản có thể vừa là thành viên tổ chức vừa là người vận hành.
//
// Không phải người vận hành (chưa đăng nhập, hoặc đã đăng nhập nhưng
// không có dòng `platform_operators` đang hoạt động) → về "/", không lộ
// rằng route này tồn tại.

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { resolvePlatformSession } from "@/modules/platform/use-cases/resolve-platform-session"
import { SessionProvider } from "@/lib/session"
import { I18nProvider } from "@/lib/i18n"
import { DesktopNav } from "@/components/layout/desktop-nav"
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { UiStudioDrawer } from "@/components/layout/ui-studio-drawer"

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")
  const request = new Request("http://localhost/", { headers: { cookie: cookieHeader } })

  const pctx = await resolvePlatformSession(request)
  if (!pctx) redirect("/")

  const platformSession = {
    userName: "Quản trị Nền tảng",
    userInitials: "AD",
    orgName: "Vận hành Nền tảng",
    workspaceKind: "PRODUCTION" as const,
    capabilities: Array.from(pctx.capabilities),
    roleKey: "platform_admin",
    organizationType: "PLATFORM" as const,
  }

  const isDev = process.env.NODE_ENV !== "production"

  return (
    <SessionProvider session={platformSession}>
      <I18nProvider>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-none md:flex-row">
          <MobileNavDrawer>
            <DesktopNav isDev={isDev} />
            <div id="noi-dung-chinh" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-hidden focus:outline-none">
              <main className="h-full overflow-auto">{children}</main>
            </div>
          </MobileNavDrawer>
          <BottomNav />
          <UiStudioDrawer />
        </div>
      </I18nProvider>
    </SessionProvider>
  )
}

