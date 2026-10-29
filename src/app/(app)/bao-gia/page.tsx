"use client"

import { useI18n } from "@/lib/i18n"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Filter,
  Layers,
  Receipt,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { useSession } from "@/lib/session"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { extractComponentNames } from "@/modules/products/domain/bom"
import { EmptyState } from "@/components/ui/empty-state"
import { InlineError } from "@/components/ui/inline-error"

type ProductItem = {
  id: string
  title: string
  price: number
  category?: string
  image_url?: string
  description?: string
  composition?: string[]
}

export default function BaoGiaPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { organization } = useSession()
  const ti = getIndustryTerminology(organization?.industry)
  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "PARTNER">("CUSTOMER")
  const [dangTai, setDangTai] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [budgetFilter, setBudgetFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  // Partner form state
  const [partnerItemName, setPartnerItemName] = useState("Sản phẩm đặt hàng")
  const [partnerPrice, setPartnerPrice] = useState("450000")
  const [deliveryFee, setDeliveryFee] = useState("30000")
  const [deadlineTime, setDeadlineTime] = useState("14:30 hôm nay")

  // `/api/v1/products` trả `{ data: [...] }` — trước đây đọc `data.products` nên luôn rơi về sản phẩm mẫu giả.
  const napDuLieu = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/products?status=ACTIVE&limit=100")
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { data?: Array<Record<string, unknown>> }
      setProducts(
        (body.data ?? [])
          .filter((item) => typeof item.price_vnd === "number")
          .map((item) => ({
            id: String(item.id),
            title: String(item.name ?? ""),
            price: Number(item.price_vnd),
            category: typeof item.category === "string" ? item.category : ti.catalogTitle,
            image_url: typeof item.masterImageUrl === "string" ? item.masterImageUrl : "",
            composition: extractComponentNames((item.attributes as Record<string, unknown> | null)?.bom),
          })),
      )
    } catch {
      setLoadError("Chưa tải được danh sách sản phẩm. Hãy thử tải lại trang.")
    }
  }, [ti.catalogTitle])

  useEffect(() => {
    let cancelled = false
    napDuLieu().finally(() => {
      if (!cancelled) setDangTai(false)
    })
    return () => {
      cancelled = true
    }
  }, [napDuLieu])

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false
    if (budgetFilter === "UNDER_500" && p.price >= 500000) return false
    if (budgetFilter === "500_700" && (p.price < 500000 || p.price > 700000)) return false
    if (budgetFilter === "700_1000" && (p.price < 700000 || p.price > 1000000)) return false
    if (budgetFilter === "ABOVE_1000" && p.price <= 1000000) return false
    return true
  })

  const toggleProductSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id))

  const handleCopyQuote = () => {
    const text = selectedProducts
      .map(
        (p, idx) =>
          `Mẫu ${idx + 1}: ${p.title} - ${p.price.toLocaleString("vi-VN")} đ\nThành phần: ${p.composition?.join(", ")}`
      )
      .join("\n\n")

    navigator.clipboard.writeText(`BẢNG BÁO GIÁ SẢN PHẨM\n\n${text}\n\nLiên hệ đặt hàng: Hotline của Cửa hàng`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-selected text-primary">
            <Receipt className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-title font-extrabold text-primary">Tạo Thẻ báo giá sản phẩm</h1>
            <p className="text-caption text-text-muted">
              Tạo bộ lựa chọn sản phẩm gửi khách mua hoa hoặc xuất thẻ báo giá cho đối tác shop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/gia")}
            className="flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Cấu hình quy tắc giá</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Trang chủ</span>
          </Button>
        </div>
      </header>

      {/* Mode Selector Tabs (Hiển thị đầy đủ trên cả Cửa hàng hoa và Điện hoa) */}
      <div className="border-b border-border bg-surface px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMER")}
            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "CUSTOMER"
                ? "bg-primary text-surface font-semibold"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Gửi khách mua (Store Admin)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PARTNER")}
            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "PARTNER"
                ? "bg-primary text-surface font-semibold"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Báo giá đối tác Shop
          </button>
        </div>

        <span className="text-caption text-text-muted hidden sm:inline-block">
          {activeTab === "CUSTOMER"
            ? `Đã chọn ${selectedProducts.length} ${ti.sampleProduct} vào bảng giá`
            : "Chế độ giao việc cho Shop gia công điện hoa"}
        </span>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
        {dangTai ? (
          <div className="space-y-4">
            <SkeletonBlock lines={4} label="Đang tải dữ liệu sản phẩm" />
          </div>
        ) : activeTab === "CUSTOMER" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Source Selection + Filter & Products (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-body-sm text-text-muted">
                Mẫu chưa có trong kho?{" "}
                <Link href="/san-pham/tao-moi" className="font-semibold text-primary underline">Thêm sản phẩm bằng ảnh</Link>{" "}
                — AI phân tích thành phần thật rồi đưa vào kho.
              </p>
              {/* Source View 2: PRODUCT LIBRARY & FILTER */}
              {(
                <>
                  <Card className="p-4 bg-surface border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-body-sm font-semibold text-text">
                        <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
                        <span>Lọc {ti.sampleProduct} theo nhu cầu của khách</span>
                      </div>
                      <span className="text-caption text-text-muted">
                        {filteredProducts.length} mẫu phù hợp
                      </span>
                    </div>

                    {/* Budget filter buttons */}
                    <div>
                      <span className="text-caption text-text-muted block mb-1.5">Ngân sách mong muốn:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "ALL", label: "Tất cả mức giá" },
                          { id: "UNDER_500", label: "Dưới 500K" },
                          { id: "500_700", label: "500K – 700K" },
                          { id: "700_1000", label: "700K – 1 Triệu" },
                          { id: "ABOVE_1000", label: "Trên 1 Triệu" },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBudgetFilter(b.id)}
                            className={`px-2.5 py-1 rounded-md text-caption font-medium transition-colors cursor-pointer ${
                              budgetFilter === b.id
                                ? "bg-primary text-surface font-semibold"
                                : "bg-surface border border-border text-text hover:bg-surface-alt"
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category filter buttons */}
                    <div>
                      <span className="text-caption text-text-muted block mb-1.5">Loại sản phẩm:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "ALL", label: `Tất cả ${ti.catalogTitle}` },
                          { id: "Danh mục A", label: "Danh mục A" },
                          { id: "Danh mục B", label: "Danh mục B" },
                          { id: "Danh mục C", label: "Danh mục C" },
                          { id: "Danh mục D", label: "Danh mục D" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoryFilter(c.id)}
                            className={`px-2.5 py-1 rounded-md text-caption font-medium transition-colors cursor-pointer ${
                              categoryFilter === c.id
                                ? "bg-primary text-surface font-semibold"
                                : "bg-surface border border-border text-text hover:bg-surface-alt"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {loadError && <InlineError message={loadError} onRetry={() => void napDuLieu()} />}
                  {!loadError && products.length === 0 && (
                    <EmptyState
                      title="Kho chưa có sản phẩm đang bán có giá"
                      reason="Thêm sản phẩm và giá bán trước, rồi quay lại đây để tạo thẻ báo giá gửi khách."
                      action={{ label: "Thêm sản phẩm", href: "/san-pham/tao-moi" }}
                    />
                  )}
                  {/* Product list */}
                  <div className="space-y-2.5">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-selected/40 shadow-xs"
                              : "border-border bg-surface hover:border-text-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-14 h-14 rounded-lg object-cover border border-border"
                            />
                            <div>
                              <div className="text-body-sm font-bold text-text">{p.title}</div>
                              <div className="text-caption text-text-muted mt-0.5">
                                {p.composition?.join(" • ") || p.description}
                              </div>
                              <div className="text-body-sm font-extrabold text-primary mt-1">
                                {p.price.toLocaleString("vi-VN")} đ
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleProductSelection(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-primary text-surface"
                                : "border border-border bg-surface text-text hover:bg-surface-alt"
                            }`}
                          >
                            {isSelected ? "Đã chọn ✓" : "Chọn vào bộ"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Live Quote Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-4 bg-surface border-border space-y-4 sticky top-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span className="text-body-sm font-bold text-text">Bản xem trước Thẻ báo giá</span>
                  </div>
                  <Badge tone="neutral" className="text-caption">
                    Chuẩn A6 gửi Zalo
                  </Badge>
                </div>

                {/* Printable / Shareable Card Container */}
                <div className="rounded-xl border-2 border-dashed border-border p-4 bg-surface-alt space-y-4">
                  <div className="text-center pb-2 border-b border-border">
                    <div className="text-title-sm font-extrabold text-primary tracking-wide uppercase">
                      BỘ {ti.sampleProduct.toUpperCase()} GỢI Ý
                    </div>
                    <div className="text-caption text-text-muted mt-0.5">
                      Gợi ý theo ngân sách và dịp tặng của quý khách
                    </div>
                  </div>

                  {selectedProducts.length === 0 ? (
                    <div className="py-8 text-center text-text-muted text-caption">
                      Chưa có {ti.sampleProduct} nào được chọn. Hãy bấm chọn {ti.sampleProduct} bên trái hoặc tải ảnh mới để đưa vào bảng giá.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {selectedProducts.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-border"
                        >
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-12 h-12 rounded-md object-cover border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-caption font-bold text-primary">Mẫu {idx + 1}</span>
                              <span className="text-body-sm font-extrabold text-text">
                                {p.price.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                            <div className="text-caption font-semibold text-text truncate">{p.title}</div>
                            <div className="text-caption text-text-muted truncate">
                              {p.composition?.join(", ")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between text-caption text-text-muted">
                    <span>* Giá đã bao gồm thiệp chúc mừng</span>
                    <span className="font-semibold text-primary">Hotline cửa hàng</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopyQuote}
                    disabled={selectedProducts.length === 0}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" />
                        <span>Đã sao chép nội dung báo giá!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        <span>Sao chép bảng giá gửi Zalo</span>
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Đã lưu thẻ báo giá vào kho tài nguyên cửa hàng!")}
                      disabled={selectedProducts.length === 0}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      <span>Tải ảnh thẻ</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/don-hang")}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      <span>Tạo đơn từ mẫu</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Partner Quote Form (Tab 2) */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Partner Quick Select from Library */}
            {(
              <Card className="p-4 bg-surface border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-caption font-semibold text-text">
                    Chọn nhanh {ti.sampleProduct} từ kho để điền thông số:
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {products.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPartnerItemName(p.title)
                        setPartnerPrice(String(Math.round(p.price * 0.75)))
                      }}
                      className="flex-shrink-0 flex items-center gap-2 p-2 rounded-lg border border-border bg-surface hover:border-primary text-left cursor-pointer transition-colors"
                    >
                      <img src={p.image_url} alt={p.title} className="w-8 h-8 rounded-md object-cover" />
                      <div className="max-w-[130px]">
                        <div className="text-caption font-bold text-text truncate">{p.title}</div>
                        <div className="text-caption text-primary">{Math.round(p.price * 0.75).toLocaleString("vi-VN")} đ</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6 bg-surface border-border space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="p-2 rounded-lg bg-selected text-primary">
                  <Layers className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-title-sm font-bold text-text">
                    Thông tin Thẻ báo giá cho Shop đối tác (Gia công {ti.makerAction})
                  </h2>
                  <p className="text-caption text-text-muted">
                    Áp dụng cho các đơn giao việc trong mạng lưới điều phối điện hoa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="partner-item-name" className="text-caption font-semibold text-text">
                    Tên {ti.sampleProduct} cần gia công
                  </label>
                  <input
                    id="partner-item-name"
                    type="text"
                    value={partnerItemName}
                    onChange={(e) => setPartnerItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="partner-price" className="text-caption font-semibold text-text">
                    Giá trả cho đối tác (VNĐ)
                  </label>
                  <input
                    id="partner-price"
                    type="number"
                    value={partnerPrice}
                    onChange={(e) => setPartnerPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="delivery-fee" className="text-caption font-semibold text-text">
                    Phí giao hoa hỗ trợ (VNĐ)
                  </label>
                  <input
                    id="delivery-fee"
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="deadline-time" className="text-caption font-semibold text-text">
                    Hạn chót cắm xong
                  </label>
                  <input
                    id="deadline-time"
                    type="text"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Preview Partner Ticket */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-surface-alt space-y-2">
                <div className="flex items-center justify-between text-body-sm font-bold text-primary">
                  <span>PHIẾU GIAO VIỆC ĐIỆN HOA — MÃ GIA CÔNG #DH-982</span>
                  <Badge tone="neutral">Chờ đối tác nhận</Badge>
                </div>
                <div className="text-caption text-text">
                  <strong>Yêu cầu sản xuất:</strong> {partnerItemName}
                </div>
                <div className="text-caption text-text">
                  <strong>Thực nhận của Shop:</strong>{" "}
                  {(Number(partnerPrice) + Number(deliveryFee)).toLocaleString("vi-VN")} đ (bao gồm cả phí ship)
                </div>
                <div className="text-caption text-text-muted">
                  <strong>Hạn chót hoàn thành:</strong> {deadlineTime}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => alert("Đã lưu nháp phiếu báo giá gia công!")}
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert("Đã xuất thẻ báo giá gửi Shop đối tác qua Zalo/Portal!")}
                  className="bg-primary text-surface hover:bg-primary-hover font-semibold border-transparent"
                >
                  Xuất phiếu báo giá gửi Shop
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
