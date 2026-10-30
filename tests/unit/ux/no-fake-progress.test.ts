import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (rel: string) => readFileSync(path.resolve(__dirname, "../../..", rel), "utf-8")

/**
 * 03c UX-016: không giả lập tiến độ, không báo thành công khi backend chưa xác nhận.
 * Rollout công cụ #08 Landing page và #09 Catalog (29/10/2026).
 */
describe("Không tiến độ giả / link giả ở công cụ Landing page & Catalog", () => {
  it("tạo catalog tự động không tự chờ giả lập và không bịa link khi xuất bản lỗi", () => {
    const src = read("src/components/catalog/use-autonomous-catalog-generator.ts")
    expect(src).not.toMatch(/setTimeout\(r,\s*\d+\)/)
    expect(src).not.toMatch(/\|\|\s*"catalog"/)
    expect(src).toContain("setPublishError(")
  })

  it("tạo landing page không còn bước thị giác/chất lượng ảnh tự xong theo giờ và báo khi dùng nội dung mẫu", () => {
    const src = read("src/components/catalog/landing-campaign-tab.tsx")
    expect(src).not.toMatch(/setTimeout\(r,\s*\d+\)/)
    expect(src).not.toMatch(/id: "vision"/)
    expect(src).toContain("setUsedFallbackContent(true)")
  })
})

describe("Thẻ báo giá /bao-gia — không dữ liệu giả, không AI giả (PO 29/10/2026)", () => {
  it("đọc đúng `{ data }` của /api/v1/products, không sản phẩm mẫu cài cứng, không giả lập phân tích ảnh", () => {
    const src = read("src/app/(app)/bao-gia/page.tsx")
    expect(src).toContain("body.data")
    expect(src).not.toContain("SAMPLE_PRODUCTS")
    expect(src).not.toContain("unsplash.com")
    expect(src).not.toMatch(/setTimeout\(\(\) => \{\s*setAnalyzing/)
  })
})

describe("Poster & banner #05 — không dữ liệu mẫu trên ấn phẩm tải về (MEUX rollout 29/10/2026)", () => {
  it("không cài sẵn hotline/địa chỉ/ảnh mẫu; lấy từ hồ sơ cửa hàng; không báo đã lưu mẫu khi không lưu", () => {
    const src = read("src/components/ad-banner-poster/poster-banner-client.tsx")
    expect(src).not.toMatch(/0901 234 567|123 Đường Trung Tâm|images\.unsplash\.com/)
    expect(src).not.toContain("setProductImageUrl(tpl.sampleImageUrl)")
    expect(src).not.toContain("Đã lưu mẫu thiết kế thành công")
    expect(src).toContain("useTenantProfile()")
  })
})

describe("Xuất bản landing/catalog — link thật, có xác nhận (audit sâu MEUX 29/10/2026)", () => {
  it("landing không gửi slug cố định (slug duy nhất toàn hệ thống) và dùng slug server trả về; lỗi hiện đúng lý do", () => {
    const src = read("src/components/catalog/landing-campaign-tab.tsx")
    expect(src).not.toMatch(/slug: campaignSlug/)
    expect(src).toContain("data?.slug")
    expect(src).toContain("data.error?.message")
  })

  it("catalog không bịa link /c/catalog khi thiếu slug", () => {
    expect(read("src/components/catalog/catalog-wizard-flow.tsx")).not.toMatch(/\|\|\s*"catalog"\)/)
  })

  it("xuất bản landing đi qua hộp xác nhận R3", () => {
    expect(read("src/components/catalog/landing-wizard-nav.tsx")).toContain("useConfirmPublish(onPublish)")
    expect(read("src/components/catalog/landing-campaign-preview.tsx")).not.toContain("Duyệt & Xuất bản Landing Page")
  })
})

describe("Nội dung mẫu landing không bịa khẳng định về cửa hàng (audit sâu MEUX 29/10/2026)", () => {
  it("không xuất xứ, giờ giấc, số ngày tươi cụ thể khi cửa hàng chưa cung cấp", () => {
    const src = read("src/modules/content-engine/domain/landing-content-generator.ts")
    expect(src).not.toMatch(/nhập khẩu|Ecuador|Hà Lan|từ 5:00|3–5 ngày|hẹn 2h|hoàn tiền 100%|miễn phí|7 năm|90–120 phút/)
  })
})

describe("Trang landing công khai không có đồng hồ đếm ngược giả", () => {
  it("không còn chuỗi giờ cố định trong hero", () => {
    expect(read("src/components/catalog/public/public-hero.tsx")).not.toMatch(/\d\d : \d\d : \d\d/)
  })
})

describe("Không đánh giá khách hàng giả trên trang công khai", () => {
  it("mục đánh giá không có dữ liệu viết cứng và ẩn khi chưa có đánh giá thật", () => {
    const src = read("src/components/catalog/landing-templates/landing-template-reviews.tsx")
    expect(src).not.toContain("DEFAULT_REVIEWS")
    expect(src).not.toMatch(/verified: true/)
    expect(src).toContain("if (reviews.length === 0) return null")
  })
})

describe("Mẫu trang công khai không cam kết thay cửa hàng", () => {
  it("hero, lead, gallery, video không còn giờ giao/độ tươi/100%/nhập khẩu viết cứng", () => {
    for (const f of [
      "public/public-hero",
      "landing-templates/landing-template-lead",
      "landing-templates/landing-template-gallery",
      "landing-templates/landing-template-video",
    ]) {
      const src = read(`src/components/catalog/${f}.tsx`)
      expect(src, f).not.toMatch(/hẹn 2h|nhanh 2h|3–5 ngày|100%|nhập khẩu|loại 1/)
    }
  })
})

describe("Catalog #09 — xuất bản do người dùng quyết, thấy được link sau xuất bản (audit sâu 29/10/2026)", () => {
  it("chế độ AI không tự tạo link công khai trong lúc dựng; chỉ tạo trong publish()", () => {
    const src = read("src/components/catalog/use-autonomous-catalog-generator.ts")
    const generate = src.slice(src.indexOf("executeGeneration"), src.indexOf("const publish = async"))
    expect(generate).not.toContain('fetch("/api/v1/catalog-links"')
    expect(src).toContain("publishedUrl: null")
  })

  it("xuất bản catalog có xác nhận; sau xuất bản ở luồng tự chọn không bị đưa về màn chọn chế độ", () => {
    expect(read("src/components/catalog/catalog-wizard-flow.tsx")).toContain("useConfirmPublish(handlePublishCatalog")
    const tab = read("src/components/catalog/catalog-management-tab.tsx")
    expect(tab).toContain('useConfirmPublish(publish, "catalog")')
    expect(tab.slice(tab.indexOf("onCreated={"), tab.indexOf("onCancelToManage"))).not.toContain("setJourneyPhase")
  })

  it("không hứa tích hợp chatbot không có thật", () => {
    expect(read("src/components/catalog/catalog-wizard-step4-success.tsx")).not.toContain("Tích hợp Chatbot AI")
  })
})

describe("Poster #05 — ấn phẩm tải về không cắt hotline, không tự in ưu đãi (audit sâu 29/10/2026)", () => {
  it("dòng liên hệ không bị truncate; không ưu đãi mặc định", () => {
    const card = read("src/components/ad-banner-poster/banner-preview-card.tsx")
    const contact = card.slice(card.indexOf("Hotline không bao giờ bị cắt"))
    expect(contact.slice(0, 400)).not.toContain("truncate")
    expect(read("src/components/ad-banner-poster/poster-banner-client.tsx")).not.toContain("Tặng kèm băng rôn")
  })
})

describe("Nội dung #04 — đọc đúng hợp đồng /api/v1/products, xem trước không số liệu giả (audit sâu 29/10/2026)", () => {
  it("đọc price_vnd và masterImageUrl; xem trước không còn 128 lượt thích giả", () => {
    const src = read("src/app/(app)/noi-dung/use-product-data.ts")
    expect(src).toContain("p.price_vnd")
    expect(src).toContain("p.masterImageUrl")
    expect(read("src/components/templates/content-engine/social-post-preview.tsx")).not.toMatch(/>128<|16 bình luận/)
    expect(read("src/components/templates/content-engine/multichannel-post-card.tsx")).not.toMatch(/Offline Fallback|Critic|GPU Metal/)
  })
})
