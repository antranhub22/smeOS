/**
 * SMEOS Platform Admin — Get Organization Folder Data (Platform-Level)
 *
 * Tương tự get-store-folder-data.ts nhưng ở tầng Platform:
 * - Input: organizationId bất kỳ (không phải branch/store)
 * - Platform admin có quyền xem RAW mọi trường (không qua DSA filter)
 * - Gom dữ liệu theo Input Domains giống mô hình Folder-in-Folder
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import type { PlatformContext } from "@/core/platform/platform-context"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import { INPUT_DOMAINS, type InputDomainKey } from "@/modules/field-platform/domain/input-domains"
import { STANDARD_G1_CORE_FIELDS } from "@/modules/field-platform/domain/standard-core-fields"

export interface PlatformOrgFieldRecord {
  readonly fieldKey: string
  readonly fieldNameVi: string
  readonly displayValue: string
  readonly sensitivity: string
  readonly isPii: boolean
  readonly source: "business_profile" | "brand_profile" | "branches" | "catalog" | "settings"
}

export interface PlatformOrgDomainFolder {
  readonly domainKey: InputDomainKey
  readonly domainNameVi: string
  readonly descriptionVi: string
  readonly fieldCount: number
  readonly fields: readonly PlatformOrgFieldRecord[]
}

export interface PlatformOrgFolderDataResult {
  readonly orgId: string
  readonly orgName: string
  readonly orgSlug: string
  readonly orgType: string
  readonly folders: readonly PlatformOrgDomainFolder[]
  readonly totalFieldCount: number
  readonly stats: {
    readonly memberCount: number
    readonly branchCount: number
    readonly productCount: number
    readonly orderCount: number
    readonly creditBalance: number
  }
}

export async function getPlatformOrgFolderData(
  pctx: PlatformContext,
  orgId: string
): Promise<PlatformOrgFolderDataResult | null> {
  requirePlatformCapability(pctx, "N1")

  const org = await prisma.organizations.findUnique({
    where: { id: orgId },
    include: {
      business_profile: true,
      brand_profile: true,
      _count: {
        select: {
          memberships: true,
          branches: true,
        },
      },
      branches: {
        select: { id: true, name: true, address: true, code: true },
        take: 5,
        orderBy: { created_at: "asc" },
      },
    },
  })

  if (!org) return null

  // Batch counts
  const [productCount, orderCount] = await Promise.all([
    prisma.products.count({ where: { organization_id: orgId } }),
    prisma.orders.count({ where: { organization_id: orgId } }),
  ])

  // Xây dựng map values thực tế từ org data
  const business = org.business_profile
  const brand = org.brand_profile
  const primaryBranch = org.branches[0]
  const settings = org.settings as Record<string, unknown> | null

  const valuesMap: Record<string, unknown> = {
    "core.org.store_name": org.name,
    "core.org.store_address": business?.address ?? primaryBranch?.address ?? "Chưa thiết lập",
    "core.org.hotline_phone": business?.phone ?? "Chưa thiết lập",
    "core.org.tax_code": business?.tax_code ?? "Chưa thiết lập",
    "core.org.legal_name": business?.legal_name ?? org.name,
    "core.org.industry": settings?.industry_key ?? "Chưa phân loại",
    "core.brand.logo_url": brand?.logo_asset_id ?? "Chưa có logo",
    "core.brand.primary_color": brand?.primary_color ?? "Chưa thiết lập",
    "core.catalog.product_name": `${productCount} sản phẩm trong catalog`,
    "core.catalog.price_vnd": `${org.credit_balance.toLocaleString("vi-VN")} credit còn lại`,
    "core.finance.bank_account_number": business?.website ?? "Chưa thiết lập",
    "core.policy.min_lead_time_hours": `${org._count.branches} chi nhánh, ${org._count.memberships} thành viên`,
  }

  const folderMap = new Map<InputDomainKey, PlatformOrgFieldRecord[]>()

  for (const field of STANDARD_G1_CORE_FIELDS) {
    const rawVal = valuesMap[field.fieldKey] ?? "Chưa có dữ liệu"
    const displayVal = rawVal === null || rawVal === undefined ? "—" : String(rawVal)

    // Determine source
    let source: PlatformOrgFieldRecord["source"] = "settings"
    if (field.domain === "org_legal") source = "business_profile"
    else if (field.domain === "brand") source = "brand_profile"
    else if (field.domain === "catalog") source = "catalog"
    else if (field.domain === "supply_inventory") source = "branches"

    const record: PlatformOrgFieldRecord = {
      fieldKey: field.fieldKey,
      fieldNameVi: field.fieldName.vi,
      displayValue: displayVal,
      sensitivity: field.sensitivity,
      isPii: field.pii.isPii,
      source,
    }

    if (!folderMap.has(field.domain)) {
      folderMap.set(field.domain, [])
    }
    folderMap.get(field.domain)!.push(record)
  }

  // Thêm thư mục đặc biệt: Chi nhánh
  if (org.branches.length > 0) {
    const branchRecords: PlatformOrgFieldRecord[] = org.branches.map((b) => ({
      fieldKey: `branch.${b.id}`,
      fieldNameVi: b.name,
      displayValue: b.address ?? b.code,
      sensitivity: "S1",
      isPii: false,
      source: "branches" as const,
    }))
    folderMap.set("supply_inventory" as InputDomainKey, [
      ...(folderMap.get("supply_inventory" as InputDomainKey) ?? []),
      ...branchRecords,
    ])
  }

  const folders: PlatformOrgDomainFolder[] = Array.from(folderMap.entries()).map(
    ([domainKey, fields]) => {
      const meta = INPUT_DOMAINS[domainKey]
      return {
        domainKey,
        domainNameVi: meta?.nameVi ?? domainKey,
        descriptionVi: meta?.descriptionVi ?? "",
        fieldCount: fields.length,
        fields,
      }
    }
  )

  return {
    orgId: org.id,
    orgName: org.name,
    orgSlug: org.slug,
    orgType: org.type,
    folders,
    totalFieldCount: folders.reduce((s, f) => s + f.fieldCount, 0),
    stats: {
      memberCount: org._count.memberships,
      branchCount: org._count.branches,
      productCount,
      orderCount,
      creditBalance: org.credit_balance,
    },
  }
}
