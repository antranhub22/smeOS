import { describe, it, expect } from "vitest"
import { getUiPreset, UI_PRESETS, DEFAULT_UI_CONFIG } from "./presets"
import { DENSITY_CONFIG } from "./tokens"

describe("UI System Presets & Foundation", () => {
  it("defaults to moc-lan preset with comfortable density", () => {
    expect(DEFAULT_UI_CONFIG.preset).toBe("moc-lan")
    expect(DEFAULT_UI_CONFIG.density).toBe("comfortable")
    expect(DEFAULT_UI_CONFIG.colorMode).toBe("light")
  })

  it("returns moc-lan preset for unknown or null ids", () => {
    const fallback = getUiPreset("non-existent-preset")
    expect(fallback.id).toBe("moc-lan")
    expect(fallback.isDefault).toBe(true)

    const nullFallback = getUiPreset(null)
    expect(nullFallback.id).toBe("moc-lan")
  })

  it("registers exactly 3 official presets with complete token definitions", () => {
    const presetIds = ["moc-lan", "modern-slate", "pure-swiss"]
    expect(Object.keys(UI_PRESETS)).toEqual(presetIds)

    for (const id of presetIds) {
      const preset = UI_PRESETS[id as keyof typeof UI_PRESETS]
      expect(preset).toBeDefined()
      expect(preset.id).toBe(id)
      expect(preset.tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(preset.tokens.bg).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(preset.tokens.surface).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(preset.tokens.text).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(preset.radius.card).toBeDefined()
      expect(preset.radius.button).toBeDefined()
      expect(preset.radius.dialog).toBeDefined()
    }
  })

  it("provides density configurations for compact and comfortable (pruned spacious)", () => {
    expect(DENSITY_CONFIG.compact.tableRowHeight).toBe("2.25rem")
    expect(DENSITY_CONFIG.comfortable.tableRowHeight).toBe("3rem")
    expect("spacious" in DENSITY_CONFIG).toBe(false)
  })
})
