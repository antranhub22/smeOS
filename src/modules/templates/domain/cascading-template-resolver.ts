/**
 * 4-TIER CASCADING TEMPLATE & BRAND STYLE RESOLVER
 *
 * Chuẩn hóa Mẫu ấn phẩm & Phong cách thương hiệu theo kiến trúc 4 tầng:
 * - Tier 1 (Mother): Thư viện 12 Visual Styles (Editorial, Minimal, Bento Grid...), quy chuẩn A6
 * - Tier 2 (Industry Profile): Mẫu ấn phẩm đặc thù ngành (Tag giá, Thẻ chúc mừng, Menu, Phiếu bảo hành)
 * - Tier 3 (Chain): Bộ nhận diện thương hiệu Chuỗi (Brand Overlay: Logo, Viền thương hiệu, Hard-lock watermark)
 * - Tier 4 (Store): Thông tin liên hệ cơ sở (Địa chỉ tiệm, Hotline, QR Zalo tiệm)
 */

import {
  resolveCascadingGovernance,
  type HardLock,
  type TierConfigEntry,
} from "@/core/governance/cascading-resolver"
import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"

export interface BrandOverlayConfig {
  /** Logo thương hiệu chuỗi (URL ảnh) */
  logoUrl?: string | null | undefined
  /** Màu nhận diện chủ đạo (hex/token) */
  primaryBrandColor?: string | undefined
  /** Khẩu hiệu / Slogan thương hiệu */
  slogan?: string | undefined
  /** Bắt buộc mọi ấn phẩm của chi nhánh phải mang Logo Chuỗi */
  enforceBrandLogo: boolean
  /** Vị trí Logo: TOP_LEFT | TOP_RIGHT | BOTTOM_CENTER */
  logoPlacement?: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_CENTER" | undefined
}

export interface StoreContactOverlay {
  branchName: string
  hotline?: string | undefined
  address?: string | undefined
  zaloQrUrl?: string | undefined
}

export interface PrintableTemplateConfig {
  templateKey: string
  title: string
  visualStyle: string // "editorial" | "minimal" | "bento" | "cinematic"
  brandOverlay: BrandOverlayConfig
  storeContact?: StoreContactOverlay | undefined
}

export interface ResolveCascadingTemplateInput {
  templateKey: string
  storeOrgId: string
  chainOrgId?: string | null | undefined
  industryKey?: string | null | undefined

  /** Khóa cứng nhận diện thương hiệu từ Chuỗi */
  hardLocks?: HardLock<Partial<PrintableTemplateConfig>>[] | undefined

  /** Cấu hình tùy biến từng tầng */
  storeTemplateRaw?: Partial<PrintableTemplateConfig> | null | undefined
  chainTemplateRaw?: Partial<PrintableTemplateConfig> | null | undefined
}

export interface CascadingTemplateResult {
  effectiveTemplate: PrintableTemplateConfig
  decidedBy: string
  isLocked: boolean
  lockReason?: string | undefined
}

export function resolveCascadingTemplate(
  input: ResolveCascadingTemplateInput
): CascadingTemplateResult {
  const {
    templateKey,
    storeOrgId,
    chainOrgId,
    industryKey,
    hardLocks = [],
    storeTemplateRaw,
    chainTemplateRaw,
  } = input

  const plugin = getIndustryPlugin(industryKey)
  const matchingSpec = plugin.templates.printables.find((p) => p.type === templateKey)

  const industryFallback: PrintableTemplateConfig = {
    templateKey,
    title: matchingSpec?.title ?? "Mẫu ấn phẩm tiêu chuẩn",
    visualStyle: "minimal",
    brandOverlay: {
      enforceBrandLogo: false,
    },
  }

  const templateLocks = hardLocks
    .filter((l) => l.key === templateKey || l.key === "BRAND_TEMPLATE")
    .map((l) => ({
      key: templateKey,
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig
        ? ({ ...industryFallback, ...l.enforcedConfig } as Record<string, unknown>)
        : undefined,
    }))

  const storeEntry: TierConfigEntry<Record<string, unknown>> | null =
    storeTemplateRaw && Object.keys(storeTemplateRaw).length > 0
      ? {
          key: templateKey,
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { ...industryFallback, ...storeTemplateRaw } as Record<string, unknown>,
        }
      : null

  const chainEntry: TierConfigEntry<Record<string, unknown>> | null =
    chainTemplateRaw && Object.keys(chainTemplateRaw).length > 0
      ? {
          key: templateKey,
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { ...industryFallback, ...chainTemplateRaw } as Record<string, unknown>,
        }
      : null

  const res = resolveCascadingGovernance<Record<string, unknown>>({
    key: templateKey,
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: templateLocks,
    storeOverride: storeEntry,
    chainOverride: chainEntry,
    systemFallback: industryFallback as unknown as Record<string, unknown>,
  })

  return {
    effectiveTemplate: res.config as unknown as PrintableTemplateConfig,
    decidedBy: res.decidedBy,
    isLocked: res.isLocked,
    lockReason: res.lockReason,
  }
}
