import { describe, expect, it, vi } from "vitest"

import { sweepExpiredTrash } from "../sweep-storage-lifecycle"

describe("sweepExpiredTrash", () => {
  it("xoá từng asset quá hạn dưới ngữ cảnh đúng tổ chức của nó", async () => {
    const now = new Date("2026-10-29T00:00:00Z")
    const remove = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const findExpired = vi.fn().mockResolvedValue([
      { id: "a1", organization_id: "org-a", storage_key: "org/org-a/p/a1.jpg", thumb_key: null },
      { id: "b1", organization_id: "org-b", storage_key: "org/org-b/p/b1.jpg", thumb_key: null },
    ])
    expect(await sweepExpiredTrash(now, { findExpired, remove })).toBe(1)
    expect(findExpired).toHaveBeenCalledWith(now, expect.any(Number))
    expect(remove.mock.calls[0]![0].organizationId).toBe("org-a")
    expect(remove.mock.calls[1]![0].organizationId).toBe("org-b")
  })
})
