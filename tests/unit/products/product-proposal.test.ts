import { describe, expect, it } from "vitest"
import {
  approveProposal,
  decideEdit,
  isPendingProposal,
  newProposal,
  readProposal,
  stripProposal,
} from "@/modules/products/domain/product-proposal"

const SALE = "user-sale"
const pending = { proposal: newProposal(SALE, new Date("2026-10-23T00:00:00Z")) }

describe("nhãn đề xuất", () => {
  it("đọc được mẫu đề xuất đang chờ và bỏ qua dữ liệu hỏng", () => {
    expect(isPendingProposal(pending)).toBe(true)
    expect(isPendingProposal({ proposal: { status: "pending" } })).toBe(false)
    expect(isPendingProposal(null)).toBe(false)
  })

  it("client không tự gắn hay gỡ được nhãn đề xuất", () => {
    expect(stripProposal({ a: 1, proposal: { status: "approved", byUserId: "x" } })).toEqual({ a: 1 })
    expect(stripProposal(null)).toBeNull()
  })

  it("duyệt giữ người đề xuất và ghi người duyệt", () => {
    const out = approveProposal(readProposal(pending)!, "user-dh", new Date("2026-10-24T00:00:00Z"))
    expect(out).toMatchObject({ status: "approved", byUserId: SALE, approvedBy: "user-dh" })
  })
})

describe("decideEdit — ai được sửa gì", () => {
  const official = { price: 1 }

  it("Điều hành sửa được mọi mẫu", () => {
    expect(decideEdit({ canManageCatalog: true, userId: "dh", storedAttributes: official, input: { name: "x" } })).toBe("allow")
  })

  it("không ai khác ghi đè nội dung mẫu chính thức", () => {
    expect(decideEdit({ canManageCatalog: false, userId: SALE, storedAttributes: official, input: { name: "x" } })).toBe("deny")
    expect(decideEdit({ canManageCatalog: false, userId: SALE, storedAttributes: official, input: { attributes: {} } })).toBe("deny")
  })

  it("Điều phối được tạm ẩn / mở bán và chỉnh khả dụng trên mẫu chính thức", () => {
    expect(decideEdit({ canManageCatalog: false, userId: "dp", storedAttributes: official, input: { status: "DRAFT" } })).toBe("allow")
    expect(decideEdit({ canManageCatalog: false, userId: "dp", storedAttributes: official, input: { status: "ACTIVE", availabilityConfig: {} } })).toBe("allow")
    expect(decideEdit({ canManageCatalog: false, userId: "dp", storedAttributes: official, input: { status: "ARCHIVED" } })).toBe("deny")
  })

  it("người đề xuất sửa được mẫu đề xuất của chính mình, người khác thì không", () => {
    expect(decideEdit({ canManageCatalog: false, userId: SALE, storedAttributes: pending, input: { name: "x" } })).toBe("allow")
    expect(decideEdit({ canManageCatalog: false, userId: "other", storedAttributes: pending, input: { name: "x" } })).toBe("deny")
  })

  it("mẫu đã duyệt trở thành chính thức", () => {
    const approved = { proposal: approveProposal(readProposal(pending)!, "dh") }
    expect(decideEdit({ canManageCatalog: false, userId: SALE, storedAttributes: approved, input: { name: "x" } })).toBe("deny")
  })

  it("trường gửi lên với giá trị undefined không tính là sửa", () => {
    expect(decideEdit({ canManageCatalog: false, userId: "dp", storedAttributes: official, input: { name: undefined, status: "DRAFT" } })).toBe("allow")
  })
})
