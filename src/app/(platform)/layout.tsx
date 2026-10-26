import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { resolvePlatformSession } from "@/modules/platform/use-cases/resolve-platform-session"
import { SessionProvider } from "@/lib/session"
import { DesktopNav } from "@/components/layout/desktop-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { DevRoleOverrideBanner } from "@/components/layout/dev-role-override-banner"
import { I18nProvider } from "@/lib/i18n"
import { LiveRegionProvider } from "@/components/ui/live-region"

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
    orgName: "smeOS Mother",
    workspaceKind: "PRODUCTION" as const,
    capabilities: Array.from(pctx.capabilities),
    roleKey: "platform_admin",
    organizationType: "PLATFORM",
  }

  return (
    <SessionProvider session={platformSession}>
      <I18nProvider>
        <LiveRegionProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-none md:flex-row">
            <DesktopNav isDev={process.env.NODE_ENV !== "production"} />
            <div id="noi-dung-chinh" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-y-auto focus:outline-none">
              {children}
            </div>
            <BottomNav />
          </div>
          <DevRoleOverrideBanner activeRoleKey="platform_admin" isDev={process.env.NODE_ENV !== "production"} />
        </LiveRegionProvider>
      </I18nProvider>
    </SessionProvider>
  )
}
