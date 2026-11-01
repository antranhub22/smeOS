import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AppShell } from "../app-shell"

// Mock child components that rely on browser/router state in static rendering
vi.mock("@/components/layout/bottom-nav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav">BottomNav</nav>,
}))
vi.mock("@/components/layout/desktop-nav", () => ({
  DesktopNav: () => <nav data-testid="desktop-nav">DesktopNav</nav>,
}))
vi.mock("@/components/layout/mobile-nav-drawer", () => ({
  MobileNavDrawer: ({ children }: { children: React.ReactNode }) => <div data-testid="mobile-nav">{children}</div>,
}))
vi.mock("@/components/layout/session-takeover-watcher", () => ({
  SessionTakeoverWatcher: () => <div data-testid="takeover-watcher" />,
}))
vi.mock("@/components/chat/floraos-global-copilot", () => ({
  FloraOSGlobalCopilot: () => <div data-testid="copilot" />,
}))
vi.mock("@/components/layout/ui-studio-drawer", () => ({
  UiStudioDrawer: () => <div data-testid="ui-studio" />,
}))
vi.mock("@/components/ui/global-image-zoom", () => ({
  GlobalImageZoom: () => <div data-testid="image-zoom" />,
}))

describe("AppShell (S3-01)", () => {
  const dummyTheme = {
    preset: "moc-lan" as const,
    density: "comfortable" as const,
    dataTheme: "moc-lan" as const,
    dataDensity: "comfortable" as const,
    brandStyle: { "--brand-primary": "#1e3a8a" } as React.CSSProperties,
  }

  it("renders skip-link with target #noi-dung-chinh and accessible text", () => {
    const html = renderToStaticMarkup(
      <AppShell theme={dummyTheme}>
        <div>Nội dung kiểm thử</div>
      </AppShell>
    )

    expect(html).toContain('href="#noi-dung-chinh"')
    expect(html).toContain("Bỏ qua tới nội dung chính")
    expect(html).toContain("sr-only")
  })

  it("renders main landmark with id noi-dung-chinh and mobile bottom-nav padding", () => {
    const html = renderToStaticMarkup(
      <AppShell theme={dummyTheme}>
        <div id="test-child">Child Content</div>
      </AppShell>
    )

    expect(html).toContain('<main id="noi-dung-chinh"')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain("pb-[calc(4.5rem+env(safe-area-inset-bottom))]")
    expect(html).toContain("Child Content")
  })

  it("attaches data-theme and data-density to outer shell", () => {
    const html = renderToStaticMarkup(
      <AppShell theme={dummyTheme}>
        <div>Child Content</div>
      </AppShell>
    )

    expect(html).toContain('data-theme="moc-lan"')
    expect(html).toContain('data-density="comfortable"')
  })

  it("renders SessionTakeoverWatcher to guard active user session", () => {
    const html = renderToStaticMarkup(
      <AppShell theme={dummyTheme}>
        <div>Child Content</div>
      </AppShell>
    )

    expect(html).toContain('data-testid="takeover-watcher"')
  })

  it("renders optional copilot and image zoom when enabled", () => {
    const html = renderToStaticMarkup(
      <AppShell theme={dummyTheme} withCopilot withImageZoom>
        <div>Child Content</div>
      </AppShell>
    )

    expect(html).toContain('data-testid="copilot"')
    expect(html).toContain('data-testid="image-zoom"')
  })
})
