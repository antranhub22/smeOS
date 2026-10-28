import { describe, expect, it } from "vitest"
import {
  PLATFORM_TOOL_REGISTRY,
  getSidebarToolsForTier,
  getToolkitTools,
} from "./tool-registry"

describe("tool-registry SSOT", () => {
  it("chứa danh sách công cụ hợp lệ với đầy đủ metadata", () => {
    expect(PLATFORM_TOOL_REGISTRY.length).toBeGreaterThan(0)
    for (const tool of PLATFORM_TOOL_REGISTRY) {
      expect(tool.id).toBeGreaterThan(0)
      expect(tool.name).toBeTruthy()
      expect(tool.href).toMatch(/^\//)
      expect(tool.iconKey).toBeTruthy()
      expect(tool.supportedTiers.length).toBeGreaterThan(0)
    }
  })

  it("chiếu chính xác công cụ cho Tầng 2: SaaS Ngành (INDUSTRY)", () => {
    const industryTools = getSidebarToolsForTier("INDUSTRY", {
      sidebarGroupKey: "cong-cu-ban-hang",
    })
    expect(industryTools.length).toBeGreaterThan(0)
    expect(industryTools.every((t) => t.group === "cong-cu-ban-hang")).toBe(true)
    expect(industryTools.some((t) => t.href === "/landing-page")).toBe(true)
    expect(industryTools.some((t) => t.href === "/catalog")).toBe(true)
    expect(industryTools.some((t) => t.href === "/the-chao")).toBe(true)
  })

  it("chiếu chính xác công cụ cho Tầng 3: ChainOS (CHAIN)", () => {
    const chainTools = getSidebarToolsForTier("CHAIN", {
      sidebarGroupKey: "cong-cu-chuoi",
    })
    expect(chainTools.length).toBeGreaterThan(0)
    expect(chainTools.every((t) => t.group === "cong-cu-chuoi")).toBe(true)
    expect(chainTools.some((t) => t.href === "/bo-suu-tap")).toBe(true)
    expect(chainTools.some((t) => t.href === "/creative-studio")).toBe(true)
  })

  it("chiếu chính xác công cụ cho Tầng 4: StoreOS (STORE) kèm hub", () => {
    const storeTools = getSidebarToolsForTier("STORE", {
      sidebarGroupKey: "cong-cu",
      includeToolkitHub: true,
    })
    expect(storeTools.length).toBeGreaterThan(0)
    expect(storeTools[0]?.href).toBe("/cong-cu")
    expect(storeTools.some((t) => t.href === "/the-chao")).toBe(true)
    expect(storeTools.some((t) => t.href === "/noi-dung")).toBe(true)
  })

  it("lọc chính xác công cụ theo category và tier", () => {
    const aiTools = getToolkitTools({ category: "AI_CREATIVE" })
    expect(aiTools.length).toBeGreaterThan(0)
    expect(aiTools.every((t) => t.category === "AI_CREATIVE")).toBe(true)
  })
})
