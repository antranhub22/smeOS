import { describe, expect, it } from "vitest"
import { DEFAULT_UI_CONFIG } from "./presets"
import { withStoredDensity } from "./ui-provider"

describe("UiSystemProvider: density đọc từ localStorage", () => {
  it("giữ nguyên object config khi density trùng, để context không đổi ngay sau hydrate", () => {
    const prev = { ...DEFAULT_UI_CONFIG, density: "comfortable" as const }
    expect(withStoredDensity(prev, "comfortable")).toBe(prev)
  })

  it("trả config mới khi density khác", () => {
    const prev = { ...DEFAULT_UI_CONFIG, density: "comfortable" as const }
    const next = withStoredDensity(prev, "compact")
    expect(next).not.toBe(prev)
    expect(next).toEqual({ ...prev, density: "compact" })
  })
})
