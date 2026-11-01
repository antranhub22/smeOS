// Theo docs/dac-ta/04-frontend-architecture.md mục 2:
// "(app)/layout.tsx — giải phiên, nạp năng lực, dựng khung điều hướng".
//
// Đã nối backend thật: đọc cookie phiên (`floraos_session`) rồi giải qua
// `resolveAppSession` (dùng chung với trang chủ — xem chú thích ở đó) — cùng
// use-case mà GET /auth/me dùng, gọi trực tiếp trong Server Component thay
// vì round-trip qua HTTP. Không có phiên hợp lệ → chuyển sang /dang-nhap.

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SessionProvider } from "@/lib/session"
import { AppShell } from "@/components/layout/app-shell"
import { resolveAppSession } from "@/modules/organization/use-cases/resolve-app-session"
import { checkSession } from "@/modules/organization/use-cases/check-session"
import { SESSION_SUPERSEDED } from "@/core/http/errors"
import { I18nProvider } from "@/lib/i18n"
import { resolveUiTheme } from "@/lib/ui-system/resolve-ui-theme"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const session = await resolveAppSession(cookieHeader)
  if (!session) {
    // Phiên bị thay bởi lần đăng nhập ở thiết bị khác → trang đăng nhập hiện
    // cảnh báo thay vì im lặng.
    const lyDo = await checkSession(new Request("http://localhost/", { headers: { cookie: cookieHeader } }))
      .then(() => null)
      .catch((e: { details?: { reason?: string } }) => e?.details?.reason ?? null)
    redirect(lyDo === SESSION_SUPERSEDED ? "/dang-nhap?ly-do=thiet-bi-khac" : "/dang-nhap")
  }

  const uiTheme = resolveUiTheme(session)

  return (
    <SessionProvider session={session}>
      <I18nProvider industryKey={session.organization?.industry}>
        <AppShell
          theme={uiTheme}
          withToolGuard
          withCopilot
          withImageZoom
          withUiStudio={process.env.NODE_ENV !== "production"}
        >
          {children}
        </AppShell>
      </I18nProvider>
    </SessionProvider>
  )
}
