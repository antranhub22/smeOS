import { describe, expect, it } from "vitest"
import {
  type ConfigSnapshotData,
  createConfigSnapshot,
  verifyConfigSnapshot,
} from "./config-snapshot"

describe("Config Snapshot Engine (§6.5)", () => {
  const sampleData: ConfigSnapshotData = {
    storeId: "store-001",
    orderReferenceId: "order-999",
    snapshotAt: "2026-10-24T12:00:00.000Z",
    registryVersion: "2.1.0",
    taxRatePercent: 8,
    priceComponents: [
      { name: "Sản phẩm chính", amountVnd: 500000, isTaxIncluded: true },
      { name: "Phí giao", amountVnd: 30000, isTaxIncluded: true },
    ],
    effectivePolicies: [
      {
        policyKey: "refund.policy",
        effectiveValue: "NO_REFUND",
        resolvedScope: "CHAIN",
        provenance: [{ scope: "CHAIN", rawValue: "NO_REFUND" }],
      },
    ],
  }

  it("creates a frozen snapshot with a deterministic SHA-256 hash", () => {
    const snapshot = createConfigSnapshot("snap-1", sampleData)
    expect(snapshot.snapshotId).toBe("snap-1")
    expect(snapshot.contentHash).toBeDefined()
    expect(snapshot.contentHash).toHaveLength(64)
    expect(verifyConfigSnapshot(snapshot)).toBe(true)
  })

  it("detects tampering when snapshot data is altered", () => {
    const snapshot = createConfigSnapshot("snap-2", sampleData)
    const tamperedData = {
      ...snapshot.data,
      taxRatePercent: 10, // Tampered!
    }
    const tamperedSnapshot = {
      ...snapshot,
      data: tamperedData,
    }
    expect(verifyConfigSnapshot(tamperedSnapshot)).toBe(false)
  })
})
