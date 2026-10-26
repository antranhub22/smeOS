/**
 * banner-presets.ts — 5 phong cách thiết kế thẩm mỹ cao cho poster & banner.
 * Tuân thủ Rich Aesthetics, màu sắc hài hòa và tương phản chuẩn trợ năng WCAG.
 */

import type { BannerStylePresetId } from "./banner-types"

export interface BannerStylePreset {
  readonly id: BannerStylePresetId
  readonly name: string
  readonly tag: string
  readonly description: string
  readonly backgroundClass: string
  readonly surfaceClass: string
  readonly textPrimaryClass: string
  readonly textMutedClass: string
  readonly badgeBgClass: string
  readonly badgeTextClass: string
  readonly ctaBgClass: string
  readonly ctaTextClass: string
  readonly borderClass: string
  readonly decorativeAccent: string
}

export const BANNER_PRESETS: Record<BannerStylePresetId, BannerStylePreset> = {
  MODERN_MINIMAL: {
    id: "MODERN_MINIMAL",
    name: "Hiện đại & Tối giản",
    tag: "Minimalist",
    description: "Nền sáng trang nhã, bố cục thoáng đãng, tập trung tôn vinh sản phẩm",
    backgroundClass: "bg-gradient-to-br from-stone-50 via-white to-stone-100",
    surfaceClass: "bg-white/80 backdrop-blur-md",
    textPrimaryClass: "text-stone-900",
    textMutedClass: "text-stone-600",
    badgeBgClass: "bg-stone-900",
    badgeTextClass: "text-white",
    ctaBgClass: "bg-stone-900 hover:bg-stone-800",
    ctaTextClass: "text-white",
    borderClass: "border-stone-200/80",
    decorativeAccent: "from-stone-400 to-stone-600",
  },
  VIBRANT_SALE: {
    id: "VIBRANT_SALE",
    name: "Khuyến mãi bùng nổ",
    tag: "High Energy",
    description: "Tông màu năng động, tương phản sắc nét, tạo ấn tượng mua sắm tức thì",
    backgroundClass: "bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white",
    surfaceClass: "bg-black/20 backdrop-blur-md shadow-2xl",
    textPrimaryClass: "text-white drop-shadow-sm",
    textMutedClass: "text-amber-100/90",
    badgeBgClass: "bg-amber-300 shadow-lg",
    badgeTextClass: "text-stone-950 font-black",
    ctaBgClass: "bg-amber-300 hover:bg-amber-200 shadow-xl shadow-amber-900/30",
    ctaTextClass: "text-stone-950 font-black tracking-wide",
    borderClass: "border-amber-300/40",
    decorativeAccent: "from-amber-300 to-yellow-500",
  },
  ELEGANT_LUXURY: {
    id: "ELEGANT_LUXURY",
    name: "Sang trọng & Tinh tế",
    tag: "Boutique Luxury",
    description: "Nền tối huyền bí kết hợp ánh kim quý phái, dành cho sản phẩm cao cấp",
    backgroundClass: "bg-gradient-to-br from-stone-950 via-zinc-900 to-neutral-950 text-white",
    surfaceClass: "bg-white/5 backdrop-blur-md border border-amber-500/30",
    textPrimaryClass: "text-amber-100 drop-shadow-sm",
    textMutedClass: "text-stone-300",
    badgeBgClass: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-amber-500/30",
    badgeTextClass: "text-slate-950 font-black",
    ctaBgClass: "bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 shadow-lg shadow-amber-500/20",
    ctaTextClass: "text-slate-950 font-black",
    borderClass: "border-amber-500/30",
    decorativeAccent: "from-amber-300 via-yellow-400 to-amber-600",
  },
  FESTIVE_SEASON: {
    id: "FESTIVE_SEASON",
    name: "Lễ hội & Rực rỡ",
    tag: "Holiday Festive",
    description: "Gam màu đỏ ấm áp hoặc xanh lễ hội, ngập tràn không khí sự kiện",
    backgroundClass: "bg-gradient-to-br from-rose-700 via-red-800 to-rose-950 text-white",
    surfaceClass: "bg-black/25 backdrop-blur-md border border-yellow-400/30",
    textPrimaryClass: "text-white drop-shadow-sm",
    textMutedClass: "text-rose-100/90",
    badgeBgClass: "bg-gradient-to-r from-amber-300 to-yellow-400 shadow-lg",
    badgeTextClass: "text-red-950 font-black",
    ctaBgClass: "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 hover:brightness-105 shadow-xl shadow-red-950/40",
    ctaTextClass: "text-red-950 font-black tracking-wide",
    borderClass: "border-yellow-400/30",
    decorativeAccent: "from-yellow-300 via-amber-400 to-yellow-500",
  },
  BRAND_ACCENT: {
    id: "BRAND_ACCENT",
    name: "Nhận diện thương hiệu",
    tag: "Brand Accent",
    description: "Tự động kết hợp sắc thái màu chủ đạo của cửa hàng tạo sự đồng bộ",
    backgroundClass: "bg-gradient-to-br from-sky-50 via-indigo-50/50 to-blue-100",
    surfaceClass: "bg-white/90 backdrop-blur-md shadow-md",
    textPrimaryClass: "text-slate-900",
    textMutedClass: "text-slate-600",
    badgeBgClass: "bg-indigo-600 shadow-md",
    badgeTextClass: "text-white",
    ctaBgClass: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20",
    ctaTextClass: "text-white",
    borderClass: "border-indigo-100",
    decorativeAccent: "from-sky-400 to-indigo-600",
  },
}

export function getBannerPreset(presetId: BannerStylePresetId): BannerStylePreset {
  return BANNER_PRESETS[presetId] ?? BANNER_PRESETS.MODERN_MINIMAL
}
