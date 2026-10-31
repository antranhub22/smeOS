import { describe, expect, it } from "vitest"
import { channelSessionHealth, summarizeChannelHealth } from "./channel-session-health"

const now = new Date("2026-10-30T00:00:00Z")

describe("channelSessionHealth", () => {
  it("phân loại theo trạng thái đăng nhập và lần đăng nhập cuối", () => {
    expect(channelSessionHealth(undefined, now)).toBe("NOT_CONNECTED")
    expect(channelSessionHealth({ is_logged_in: 0 }, now)).toBe("NEEDS_LOGIN")
    expect(channelSessionHealth({ is_logged_in: true, last_login: "2026-10-20T00:00:00Z" }, now)).toBe("HEALTHY")
    expect(channelSessionHealth({ is_logged_in: 1, last_login: "2026-09-01T00:00:00Z" }, now)).toBe("STALE")
    expect(channelSessionHealth({ is_logged_in: true, last_login: null }, now)).toBe("STALE")
  })
  it("tổng hợp", () => {
    expect(summarizeChannelHealth([
      { is_logged_in: true, last_login: "2026-10-29T00:00:00Z" },
      { is_logged_in: false },
      { is_logged_in: true, last_login: "2026-01-01T00:00:00Z" },
    ], now)).toEqual({ healthy: 1, stale: 1, needsLogin: 1 })
  })
})
