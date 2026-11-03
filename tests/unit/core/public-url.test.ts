import { afterEach, describe, expect, it, vi } from "vitest"
import { publicAppUrl } from "@/lib/public-url"

describe("publicAppUrl — gốc URL cho ảnh xem trước link và link trong tin nhắn", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("ưu tiên PUBLIC_APP_URL, bỏ dấu / cuối", () => {
    vi.stubEnv("PUBLIC_APP_URL", "https://shop.example.vn/")
    vi.stubEnv("RENDER_EXTERNAL_URL", "https://x.onrender.com")
    expect(publicAppUrl()).toBe("https://shop.example.vn")
  })

  it("rơi về RENDER_EXTERNAL_URL khi chưa cấu hình", () => {
    vi.stubEnv("PUBLIC_APP_URL", "")
    vi.stubEnv("RENDER_EXTERNAL_URL", "https://x.onrender.com")
    expect(publicAppUrl()).toBe("https://x.onrender.com")
  })

  it("rỗng khi chạy local chưa cấu hình", () => {
    vi.stubEnv("PUBLIC_APP_URL", "")
    vi.stubEnv("RENDER_EXTERNAL_URL", "")
    expect(publicAppUrl()).toBe("")
  })

  it("dev chưa cấu hình: rơi về cổng của `npm run dev` (3200)", () => {
    for (const k of ["PUBLIC_APP_URL", "NEXT_PUBLIC_APP_URL", "RENDER_EXTERNAL_URL", "VERCEL_URL", "PORT"]) {
      vi.stubEnv(k, "")
    }
    vi.stubEnv("NODE_ENV", "development")
    expect(publicAppUrl()).toBe("http://localhost:3200")
  })
})
