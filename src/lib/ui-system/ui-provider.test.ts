import { describe, expect, it } from "vitest"
import { DEFAULT_UI_CONFIG } from "./presets"
import { readStoredDensity, withStoredDensity } from "./ui-provider"

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

describe("UiSystemProvider: đọc density cá nhân", () => {
  const storage = (value: string | null, fail = false) => ({
    getItem: (key: string) => {
      if (fail) throw new Error("blocked")
      return key === "smeos_ui_density" ? value : null
    },
  })

  it("trả density hợp lệ người dùng đã lưu", () => {
    expect(readStoredDensity(storage("compact"))).toBe("compact")
    expect(readStoredDensity(storage("comfortable"))).toBe("comfortable")
  })

  it("trả null khi chưa lưu, giá trị lạ hoặc không đọc được localStorage", () => {
    expect(readStoredDensity(storage(null))).toBeNull()
    expect(readStoredDensity(storage("tiny"))).toBeNull()
    expect(readStoredDensity(storage("compact", true))).toBeNull()
  })
})
