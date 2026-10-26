/**
 * Hệ thống Điều hướng 4 Tầng smeOS (Navigation Dispatcher)
 * Chuẩn hóa theo SSOT SMEOS_4_TIER_ARCHITECTURE_AND_NAVIGATION_SSOT.md
 */

import type { RoleUxDefinition } from "@/modules/organization/domain/role-ux-catalog"
import type { NavEntry, NavGroup, NavView, NavGroupKey } from "./nav-types"
import { HOME_ENTRY } from "./nav-types"
import { buildMotherNav, MOTHER_NAV_ENTRIES } from "./nav-mother"
import { buildIndustryNav, INDUSTRY_NAV_ENTRIES } from "./nav-industry"
import { buildChainNav, CHAIN_NAV_ENTRIES } from "./nav-chain"
import { buildStoreNav, STORE_NAV_ENTRIES } from "./nav-store"

export * from "./nav-types"
export * from "./nav-mother"
export * from "./nav-industry"
export * from "./nav-chain"
export * from "./nav-store"

/**
 * Kiểm tra xem tổ chức/vai trò có thuộc Tầng ChainOS hay không
 */
export function isChainOrganization(
  organizationType?: string | null,
  role?: RoleUxDefinition | null
): boolean {
  if (organizationType === "CHAIN" || organizationType === "FLOWER_NETWORK") {
    return true
  }
  if (role?.group === "CHAIN" || role?.group === "FLOWER_NETWORK") {
    return true
  }
  if (role?.key === "flower_network_admin") {
    return true
  }
  return false
}

/**
 * Điều phối sinh cây điều hướng (NavView) chuẩn theo đúng tầng kiến trúc:
 * 1. SaaS Mother: organizationType === "PLATFORM" hoặc roleKey === "platform_admin"
 * 2. SaaS Ngành: organizationType === "INDUSTRY" hoặc roleKey === "industry_admin"
 * 3. ChainOS: organizationType === "CHAIN" | "FLOWER_NETWORK" hoặc roleKey thuộc nhóm Chuỗi
 * 4. StoreOS: Cửa hàng cơ sở đơn lẻ (organizationType === "SINGLE" hoặc mặc định)
 */
export function buildNav(
  can: (code: string) => boolean,
  role: RoleUxDefinition | null,
  industryKey?: string | null,
  navHiddenKeys?: string[] | null,
  organizationType?: string | null
): NavView {
  // Tầng 2: SaaS Ngành (Affiliate & Standardization Hub)
  if (
    organizationType === "INDUSTRY" ||
    role?.key === "industry_admin"
  ) {
    return buildIndustryNav(can)
  }

  // Tầng 1: SaaS Mother
  if (
    organizationType === "PLATFORM" ||
    role?.group === "PLATFORM" ||
    role?.key === "platform_admin"
  ) {
    return buildMotherNav(can)
  }

  // Tầng 3: ChainOS (Chuỗi Thương hiệu Đơn ngành)
  if (isChainOrganization(organizationType, role)) {
    return buildChainNav(can, role)
  }

  // Tầng 4: StoreOS (Cửa hàng cơ sở)
  return buildStoreNav(can, role, industryKey, navHiddenKeys)
}

/**
 * Ô thứ hai của thanh dưới trên mobile (Mobile Second Slot)
 */
export function mobileSecondSlot(
  can: (code: string) => boolean,
  role: RoleUxDefinition | null,
  industryKey?: string | null,
  navHiddenKeys?: string[] | null,
  organizationType?: string | null
): NavEntry {
  // Tầng 2: SaaS Ngành — phải kiểm tra TRƯỚC PLATFORM vì industry_admin có group="PLATFORM"
  if (organizationType === "INDUSTRY" || role?.key === "industry_admin") {
    return {
      href: "/van-hanh/nganh",
      label: "Ma trận ngành",
      group: "tong-quan-nganh",
      iconKey: "Layers",
      navKey: "industry-matrix",
      mobileLabel: "Ngành",
    }
  }

  // Tầng 1: SaaS Mother (platform_admin thuần túy)
  if (organizationType === "PLATFORM" || role?.key === "platform_admin") {
    return {
      href: "/van-hanh/to-chuc",
      label: "Tổ chức",
      group: "quan-tri-to-chuc",
      iconKey: "Building2",
      navKey: "platform-organizations",
      mobileLabel: "Tổ chức",
    }
  }

  if (isChainOrganization(organizationType, role)) {
    return {
      href: "/dieu-phoi",
      label: "Điều phối",
      group: "dieu-phoi-gia-cong",
      iconKey: "Radio",
      navKey: "chain-coordinator",
      mobileLabel: "Điều phối",
    }
  }

  return {
    href: "/don-hang",
    label: "Đơn hàng",
    group: "ban-hang-tiem",
    iconKey: "ShoppingBag",
    navKey: "orders",
    mobileLabel: "Đơn hàng",
  }
}
