import { describe, expect, it } from "vitest"
import { NotConfiguredChannelAdapter } from "@/modules/products/adapters/not-configured-channel-adapter"
import { toChannelListing, type ListingSource } from "../channel-listing"

const base: ListingSource = {
  id: "p1",
  code: "BH-01",
  name: "Bó hồng đỏ 20 bông",
  status: "ACTIVE",
  price_vnd: 450_000,
  imageUrls: ["https://cdn/x.jpg"],
  commerce: { barcode: null, weight_grams: 800, tags: ["Sinh nhật"] },
}

describe("toChannelListing", () => {
  it("maps a ready product to a listing", () => {
    const res = toChannelListing(base, "meta_catalog")
    expect(res).toEqual({
      ok: true,
      listing: expect.objectContaining({ productId: "p1", sku: "BH-01", priceVnd: 450_000, availability: "in_stock", weightGrams: 800 }),
    })
  })

  it("lists every missing requirement instead of pushing a broken listing", () => {
    const res = toChannelListing({ ...base, status: "DRAFT", price_vnd: null, imageUrls: [] }, "shopee")
    expect(res).toEqual({ ok: false, issues: ["Chưa mở bán", "Chưa có giá", "Chưa có ảnh"] })
  })

  it("marks out-of-stock and caps images at 10", () => {
    const res = toChannelListing({ ...base, inStock: false, imageUrls: Array.from({ length: 12 }, (_, i) => `u${i}`) }, "tiktok_shop")
    expect(res.ok && res.listing.availability).toBe("out_of_stock")
    expect(res.ok && res.listing.imageUrls).toHaveLength(10)
  })
})

describe("NotConfiguredChannelAdapter", () => {
  it("never calls out and reports NOT_CONFIGURED per listing", async () => {
    const adapter = new NotConfiguredChannelAdapter("shopee")
    const res = toChannelListing(base, "shopee")
    if (!res.ok) throw new Error("expected ok")
    await expect(adapter.upsertListings("org-1", [res.listing])).resolves.toEqual([
      { productId: "p1", status: "NOT_CONFIGURED", reason: "Kênh bán chưa được kết nối" },
    ])
  })
})
