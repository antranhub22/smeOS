import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it, beforeEach } from "vitest"
import {
  getPlatformNavMatrixOverrides,
  savePlatformNavMatrixOverrides,
  clearPlatformNavMatrixCache,
} from "./nav-matrix-store"

describe("PlatformNavMatrixStore", () => {
  // Ghi vào tệp tạm — trước đây test ghi thẳng tệp ghi đè đã commit và "dọn" nó về rỗng.
  let dir: string
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "nav-matrix-"))
    process.env.NAV_MATRIX_OVERRIDES_PATH = path.join(dir, "overrides.json")
    clearPlatformNavMatrixCache()
  })
  afterEach(() => {
    delete process.env.NAV_MATRIX_OVERRIDES_PATH
    rmSync(dir, { recursive: true, force: true })
  })

  it("returns default overrides for all 7 industries when no overrides file exists", async () => {
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

  })
})
