import { describe, expect, it, vi } from "vitest"

import type { PlatformContext } from "@/core/platform/platform-context"
import { setAssetLegalHold, type SetLegalHoldDeps } from "../set-asset-legal-hold"

const now = new Date("2026-10-29T00:00:00Z")
const until = new Date("2027-01-01T00:00:00Z")
const input = { organizationId: "org-a", assetId: "a1", until, reason: "Tranh chấp hợp đồng" }

function deps(found = true): SetLegalHoldDeps {
  return {
    setHold: vi.fn(async () => (found ? { before: null } : null)),
    audit: vi.fn(async () => ({}) as never),
  }
}
const pctx = (codes: string[]): PlatformContext => ({ userId: "ops-1", capabilities: new Set(codes) }) as PlatformContext

describe("setAssetLegalHold", () => {
  it("thiếu N14 thì bị từ chối, không ghi gì", async () => {
    const d = deps()
    await expect(setAssetLegalHold(pctx(["N1"]), input, d, now)).rejects.toMatchObject({ code: "CAPABILITY_DENIED" })
    expect(d.setHold).not.toHaveBeenCalled()
  })

  it("đặt giữ: ghi hạn và nhật ký nền tảng kèm lý do", async () => {
    const d = deps()
    await expect(setAssetLegalHold(pctx(["N14"]), input, d, now)).resolves.toEqual({ legal_hold_until: until.toISOString() })
    expect(d.setHold).toHaveBeenCalledWith("org-a", "a1", until)
    expect(d.audit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: "asset.legal_hold.set", after: expect.objectContaining({ reason: input.reason }) })
    )
  })

  it("gỡ giữ ghi action release; hạn ở quá khứ bị từ chối; asset lạ trả 404", async () => {
    const d = deps()
    await setAssetLegalHold(pctx(["N14"]), { ...input, until: null }, d, now)
    expect(d.audit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ action: "asset.legal_hold.release" }))
    await expect(
      setAssetLegalHold(pctx(["N14"]), { ...input, until: new Date("2026-01-01T00:00:00Z") }, deps(), now)
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    await expect(setAssetLegalHold(pctx(["N14"]), input, deps(false), now)).rejects.toMatchObject({ code: "NOT_FOUND" })
  })
})
