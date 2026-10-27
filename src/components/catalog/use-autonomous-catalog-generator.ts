import { useState } from "react"
import type { ProcessingStep } from "./journey-processing-state"
import type { SmartInputData } from "./smart-input-dropzone"
import type {
  CatalogProductItem,
  CatalogPageModel,
  StyleDefinition,
  BrandProfile,
  CatalogTemplateId,
  CatalogStyleId,
} from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { resolveCatalogBrief } from "@/modules/catalog-studio/use-cases/resolve-catalog-brief"
import type { CatalogProduct } from "./catalog-management-tab"

export interface AutonomousResult {
  publishedUrl: string
  publishedSlug: string
  name: string
  pages: CatalogPageModel[]
  style: StyleDefinition
  brand: BrandProfile
  products: CatalogProductItem[]
}

interface UseAutonomousCatalogGeneratorOptions {
  activeProducts: CatalogProduct[]
  sampleProductTerm: string
  currentShopName: string
  organizationId?: string | null | undefined
  business?: {
    phone?: string | null
    address?: string | null
  } | null
  onRefresh: () => void
}

export function useAutonomousCatalogGenerator({
  activeProducts,
  sampleProductTerm,
  currentShopName,
  organizationId,
  business,
  onRefresh,
}: UseAutonomousCatalogGeneratorOptions) {
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [autonomousResult, setAutonomousResult] = useState<AutonomousResult | null>(null)

  const [catalogAiSteps, setCatalogAiSteps] = useState<ProcessingStep[]>([
    { id: "analyze", label: "Phân tích yêu cầu & sự kiện", status: "pending" },
    { id: "select", label: `Tuyển chọn các ${sampleProductTerm} phù hợp nhất`, status: "pending" },
    { id: "intro", label: "Sinh lời chào & tiêu đề Catalog bằng AI", status: "pending" },
    { id: "layout", label: "Hoàn thiện cấu hình & Xuất bản Catalog tự động", status: "pending" },
  ])

  const executeGeneration = async (
    data: SmartInputData,
    templateId: CatalogTemplateId,
    styleId: CatalogStyleId
  ) => {
    setIsAiAnalyzing(true)
    setAutonomousResult(null)
    setCatalogAiSteps([
      { id: "analyze", label: "Phân tích yêu cầu & sự kiện", status: "running" },
      { id: "select", label: `Tuyển chọn các ${sampleProductTerm} phù hợp nhất`, status: "pending" },
      { id: "intro", label: "Sinh lời chào & tiêu đề Catalog bằng AI", status: "pending" },
      { id: "layout", label: "Hoàn thiện cấu hình & Xuất bản Catalog tự động", status: "pending" },
    ])

    try {
      const lower = data.userDirectives.toLowerCase()
      let matchedOccasion = ""
      if (lower.includes("20/10") || lower.includes("phụ nữ")) matchedOccasion = "20-10"
      else if (lower.includes("valentine") || lower.includes("14/2")) matchedOccasion = "valentine"
      else if (lower.includes("8/3")) matchedOccasion = "8-3"
      else if (lower.includes("khai trương")) matchedOccasion = "grand-opening"
      else if (lower.includes("sinh nhật")) matchedOccasion = "birthday"

      // Step 1 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "analyze" ? { ...s, status: "done" } : s.id === "select" ? { ...s, status: "running" } : s
        )
      )

      // Ưu tiên các sản phẩm người dùng đã chủ động chọn từ kho ở Step trước
      let chosenProducts: CatalogProduct[] = []
      if (data.selectedProducts && data.selectedProducts.length > 0) {
        chosenProducts = data.selectedProducts
      } else if (matchedOccasion) {
        chosenProducts = activeProducts.filter((p) => p.occasion_code === matchedOccasion)
      }
      if (chosenProducts.length === 0) {
        chosenProducts = activeProducts.slice(0, 6)
      }
      const chosenIds = chosenProducts.map((p) => p.id)

      // Step 2 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "select" ? { ...s, status: "done" } : s.id === "intro" ? { ...s, status: "running" } : s
        )
      )

      let generatedName = `Bộ sưu tập ${sampleProductTerm} Tinh Tuyển`
      if (matchedOccasion) {
        const occName = matchedOccasion === "20-10" ? "Ngày Phụ Nữ 20/10" : matchedOccasion
        generatedName = `Bộ sưu tập ${sampleProductTerm} ${occName}`
      } else if (data.userDirectives) {
        generatedName = `Bộ sưu tập: ${data.userDirectives.slice(0, 30)}...`
      }

      let generatedDesc = `Tuyển chọn ${chosenIds.length} ${sampleProductTerm} nghệ thuật được thiết kế tinh tế nhất từ ${currentShopName}.`
      try {
        const res = await fetch("/api/v1/content-engine/catalog-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionName: generatedName,
            productCount: chosenIds.length,
            styleVariant: "EDITORIAL_LOOKBOOK",
          }),
        })
        if (res.ok) {
          const json = await res.json()
          if (json.data?.description) generatedDesc = json.data.description
        }
      } catch {
        // Fallback
      }

      // Step 3 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "intro" ? { ...s, status: "done" } : s.id === "layout" ? { ...s, status: "running" } : s
        )
      )

      // Step 4: Tự động xuất bản tạo liên kết Catalog luôn trong luồng Autonomous
      let createdSlug = "catalog"
      try {
        const createRes = await fetch("/api/v1/catalog-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generatedName,
            description: generatedDesc,
            filters: {
              product_ids: chosenIds,
              style_variant: "EDITORIAL_LOOKBOOK",
              template_id: templateId,
              style_id: styleId,
            },
          }),
        })
        if (createRes.ok) {
          const json = await createRes.json()
          createdSlug = json.data?.slug || json.slug || "catalog"
        }
      } catch {
        // Fallback
      }

      const publishedUrl = `${window.location.origin}/c/${createdSlug}`

      const studioProducts: CatalogProductItem[] = chosenProducts.map((p, idx) => ({
        productId: p.id,
        name: p.name,
        code: p.code || p.id,
        category: p.category ?? null,
        primaryImage: p.imageUrl || null,
        price: p.price ?? null,
        currency: "VND",
        sortOrder: idx + 1,
        status: p.status,
      }))

      const brandProfile: BrandProfile = {
        brandId: organizationId || "brand",
        name: currentShopName,
        slogan: "Bộ Sưu Tập Tuyển Chọn • smeOS 2026",
        brandColors: { primary: "#9A3412" },
        contacts: {
          phone: business?.phone || null,
          hotline: business?.phone || null,
          zalo: business?.phone || null,
          address: business?.address || null,
        },
      }

      const resolved = resolveCatalogBrief(
        {
          catalogId: createdSlug,
          title: generatedName,
          purpose: "COLLECTION",
          audience: "CONSUMER",
          language: "vi-VN",
          styleId,
          templateId,
          pageSize: "A4_PORTRAIT",
          outputProfile: "DIGITAL_PDF",
          brandId: brandProfile.brandId,
          productIds: studioProducts.map((p) => p.productId),
        },
        brandProfile,
        studioProducts
      )

      await new Promise((r) => setTimeout(r, 500))
      setCatalogAiSteps((prev) => prev.map((s) => (s.id === "layout" ? { ...s, status: "done" } : s)))

      setAutonomousResult({
        publishedUrl,
        publishedSlug: createdSlug,
        name: generatedName,
        pages: resolved.pages,
        style: resolved.style,
        brand: resolved.brand,
        products: studioProducts,
      })
      onRefresh()
    } finally {
      setIsAiAnalyzing(false)
    }
  }

  return {
    isAiAnalyzing,
    autonomousResult,
    setAutonomousResult,
    catalogAiSteps,
    executeGeneration,
  }
}
