import { describe, expect, it } from "vitest"
import { isToolUnlocked, filterAccessibleEntries } from "./tool-entitlement"

describe("Cascading Tool Entitlement Policy (Luật Phân quyền Công cụ Đa tầng)", () => {
  it("1. Super Admin luôn có quyền truy cập mọi công cụ kể cả khi có danh sách khóa", () => {
    const result = isToolUnlocked("creative-studio", {
      isSuperAdmin: true,
      hiddenToolKeys: ["creative-studio"],
    })
    expect(result).toBe(true)
  })

  it("2. Công cụ nằm trong danh sách bị cấp trên khóa (hiddenToolKeys) sẽ bị chặn", () => {
    const result = isToolUnlocked("video", {
      isSuperAdmin: false,
      hiddenToolKeys: ["video", "creative-studio"],
    })
    expect(result).toBe(false)
  })

  it("3. Khi cấp trên cấu hình Whitelist (unlockedToolKeys), chỉ những công cụ được duyệt mới được phép sử dụng", () => {
    const allowed = isToolUnlocked("catalog", {
      isSuperAdmin: false,
      unlockedToolKeys: ["catalog", "the-chao"],
    })
    expect(allowed).toBe(true)

    const blocked = isToolUnlocked("creative-studio", {
      isSuperAdmin: false,
      unlockedToolKeys: ["catalog", "the-chao"],
    })
    expect(blocked).toBe(false)
  })

  it("4. filterAccessibleEntries lọc chính xác danh mục công cụ cho Sidebar và Picker", () => {
    const mockEntries = [
      { navKey: "toolkit", label: "Thư viện" },
      { navKey: "creative-studio", label: "Studio" },
      { navKey: "catalog", label: "Catalog" },
      { navKey: "video", label: "Video" },
    ]

    const filtered = filterAccessibleEntries(mockEntries, {
      unlockedToolKeys: ["toolkit", "catalog"],
    })

    expect(filtered.map((e) => e.navKey)).toEqual(["toolkit", "catalog"])
  })
})
