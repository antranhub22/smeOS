import { AppError } from "@/core/http/errors"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { TenantContext } from "@/core/tenancy"
import { BusinessProfileRepository } from "@/modules/profiles/infra/business-profile-repository"
import { BrandProfileRepository } from "@/modules/profiles/infra/brand-profile-repository"
import { getIndustrySeedProfiles } from "@/modules/profiles/use-cases/seed-experience-profile"
import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"
import { getMockAssetsForIndustry } from "@/modules/profiles/domain/mock-data-catalog"

export interface ApplyMockDataResult {
  industryKey: string
  industryName: string
  businessName: string
  productsCount: number
}

/**
 * Ghi đè hoặc nạp mock data của ngành vào hồ sơ và danh mục sản phẩm của tổ chức hiện tại.
 * Chỉ cho phép gọi bởi Điều hành (F2/H4) hoặc khi dev/staging.
 */
export async function applyIndustryMockData(
  ctx: TenantContext,
  targetIndustryKey?: string
): Promise<ApplyMockDataResult> {
  const org = await prisma.organizations.findUnique({
    where: { id: ctx.organizationId },
    select: { id: true, name: true, settings: true },
  })

  if (!org) {
    throw new AppError("NOT_FOUND", "Không tìm thấy tổ chức")
  }

  const orgSettings = (org.settings as Record<string, unknown>) || {}
  const industryKey =
    targetIndustryKey ||
    (typeof orgSettings.industry === "string" ? orgSettings.industry : "FLORAL")

  const plugin = getIndustryPlugin(industryKey)
  const seedProfiles = getIndustrySeedProfiles(industryKey)
  const mockAssets = getMockAssetsForIndustry(industryKey)

  // 1. Cập nhật Business Profile
  const bizRepo = new BusinessProfileRepository(prisma)
  await bizRepo.upsert(ctx, {
    ...seedProfiles.business,
    display_name: seedProfiles.business.display_name,
  })

  // 2. Cập nhật Brand Profile (kèm logo mock)
  const brandRepo = new BrandProfileRepository(prisma)
  await brandRepo.upsert(ctx, {
    ...seedProfiles.brand,
    logo_asset_id: mockAssets?.logo || seedProfiles.brand.logo_asset_id,
  })

  // 3. Nạp danh mục sản phẩm mẫu
  // Xóa các sản phẩm mẫu cũ (nếu có)
  const existingSamples = await prisma.products.findMany({
    where: {
      organization_id: ctx.organizationId,
      code: { startsWith: "DEMO-" },
    },
    select: { id: true },
  })

  if (existingSamples.length > 0) {
    const ids = existingSamples.map((s) => s.id)
    await prisma.product_variants.deleteMany({
      where: { product_id: { in: ids } },
    })
    await prisma.products.deleteMany({
      where: { id: { in: ids } },
    })
  }

  let productsCount = 0
  const categories = plugin.taxonomy.defaultCategories

  if (mockAssets && mockAssets.products.length > 0) {
    for (let i = 0; i < mockAssets.products.length; i++) {
      const p = mockAssets.products[i]!
      const code = `DEMO-${industryKey.slice(0, 3)}-${String(i + 1).padStart(3, "0")}`

      const product = await prisma.products.create({
        data: {
          organization_id: ctx.organizationId,
          code,
          name: p.name,
          category: p.category,
          status: "ACTIVE",
          attributes: {
            sample: true,
            imageUrl: p.image,
            price: p.price,
            original_price: p.originalPrice,
            description: p.description,
            unit: categories[0]?.defaultUnit || "món",
          },
        },
      })

      await prisma.product_variants.create({
        data: {
          organization_id: ctx.organizationId,
          product_id: product.id,
          name: "Tiêu chuẩn",
          multiplier: 1.0,
          attributes: {
            price: p.price,
            original_price: p.originalPrice,
          },
        },
      })

      productsCount++
    }
  }

  return {
    industryKey,
    industryName: plugin.identity.name,
    businessName: seedProfiles.business.display_name,
    productsCount,
  }
}
