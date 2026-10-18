import { describe, expect, it, beforeEach } from "vitest"
import {
  getPlatformNavMatrixOverrides,
  savePlatformNavMatrixOverrides,
  clearPlatformNavMatrixCache,
} from "./nav-matrix-store"

describe("PlatformNavMatrixStore", () => {
  beforeEach(() => {
    clearPlatformNavMatrixCache()
  })

  it("returns default overrides for all 7 industries when loaded", async () => {
    const overrides = await getPlatformNavMatrixOverrides()
    expect(overrides).toBeDefined()
    expect(overrides.FLORAL).toEqual([])
    expect(overrides.FASHION).toEqual([])
    expect(overrides.FNB).toEqual([])
    expect(overrides.CRAFT_GIFT).toEqual([])
    expect(overrides.RETAIL_GENERAL).toEqual([])
    expect(overrides.SERVICES).toEqual([])
    expect(overrides.HOMESTAY).toEqual([])
  })

  it("saves and retrieves custom overrides per industry", async () => {
    const custom = {
      FNB: ["scan-photo", "greeting-card"],
      HOMESTAY: ["create-product"],
    }

    const saved = await savePlatformNavMatrixOverrides(custom)
    expect(saved.FNB).toEqual(["scan-photo", "greeting-card"])
    expect(saved.HOMESTAY).toEqual(["create-product"])
    expect(saved.FLORAL).toEqual([])

    // Clear cache to verify persistence
    clearPlatformNavMatrixCache()
    const reloaded = await getPlatformNavMatrixOverrides()
    expect(reloaded.FNB).toEqual(["scan-photo", "greeting-card"])
    expect(reloaded.HOMESTAY).toEqual(["create-product"])

    // Clean up back to empty
    await savePlatformNavMatrixOverrides({
      FLORAL: [],
      FASHION: [],
      FNB: [],
      CRAFT_GIFT: [],
      RETAIL_GENERAL: [],
      SERVICES: [],
      HOMESTAY: [],
    })
  })
})
