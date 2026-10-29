import { describe, expect, it } from "vitest"

import { payloadKeysToPurge } from "./payload-deletion"

describe("payloadKeysToPurge", () => {
  it("chỉ lấy khoá dưới org/<tổ chức của phiên>/, bỏ trùng", () => {
    expect(
      payloadKeysToPurge("org-a", { storage_key: "org/org-a/p/x.jpg", thumb_key: "org/org-a/p/x.jpg" })
    ).toEqual(["org/org-a/p/x.jpg"])
    expect(
      payloadKeysToPurge("org-a", { storage_key: "org/org-a/p/x.jpg", thumb_key: "org/org-a/p/x_t.webp" })
    ).toEqual(["org/org-a/p/x.jpg", "org/org-a/p/x_t.webp"])
  })

  it("không đụng khoá của tổ chức khác, khoá videos/ hay khoá có ..", () => {
    expect(payloadKeysToPurge("org-a", { storage_key: "org/org-b/p/x.jpg", thumb_key: null })).toEqual([])
    expect(payloadKeysToPurge("org-a", { storage_key: "videos/org-a/j.mp4", thumb_key: null })).toEqual([])
    expect(payloadKeysToPurge("org-a", { storage_key: "org/org-a/../org-b/x.jpg", thumb_key: null })).toEqual([])
  })
})
