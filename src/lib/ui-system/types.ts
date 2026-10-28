/**
 * UI System Types — smeOS Architecture (Phase 2)
 *
 * Định nghĩa hợp đồng kiểu dữ liệu cho toàn bộ hệ thống Runtime UI System:
 * - Presets: Mộc Lan (chuẩn), Modern Slate, Pure Swiss
 * - Density: Compact (kế toán/kho), Comfortable (mặc định), Spacious (cảm ứng/bán lẻ)
 * - Layout: Sidebar (mặc định), TopNav, CompactDock
 */

export type UiPresetId = "moc-lan" | "modern-slate" | "pure-swiss" | "aurora-ui" | "editorial-grid"

/** Scope xác định preset này dành cho platform nào */
export type UiPresetScope = "saas-mother" | "chain-store" | "all"

export type UiDensity = "compact" | "comfortable" | "spacious"

export type UiLayoutMode = "sidebar" | "top-nav" | "compact-dock"

export type UiColorMode = "light" | "dark" | "system"

export interface UiSystemConfig {
  preset: UiPresetId
  density: UiDensity
  layoutMode: UiLayoutMode
  colorMode: UiColorMode
}

export interface PresetTokenValues {
  primary: string
  primaryDark: string
  primaryMuted: string
  primaryBorder: string
  secondary: string
  secondaryText: string
  accent: string
  accentBg: string
  bg: string
  surface: string
  surfaceAlt: string
  border: string
  text: string
  textMuted: string
  warning: string
  warningBg: string
  danger: string
  dangerBg: string
  success: string
  successBg: string
  info: string
  infoBg: string
  selected: string
  selectedText: string
}

export interface PresetRadiusValues {
  sm: string
  md: string
  lg: string
  card: string
  button: string
  dialog: string
}

export interface PresetDefinition {
  id: UiPresetId
  name: string
  tagline: string
  description: string
  isDefault?: boolean
  /** Platform scope: saas-mother (console /van-hanh), chain-store (ChainOS/StoreOS), all */
  scope: UiPresetScope
  /** Source style từ ui-ux-pro-max catalog */
  sourceStyleId?: string
  fontSans: string
  fontDisplay?: string
  /** CSS animation keyframe string cho styles có ambient animation (e.g. aurora) */
  animationCss?: string
  tokens: PresetTokenValues
  radius: PresetRadiusValues
  shadows: {
    subtle: string
    card: string
    dialog: string
  }
}

export interface UiSystemContextValue {
  config: UiSystemConfig
  currentPreset: PresetDefinition
  /** Tất cả presets có scope phù hợp với platform hiện tại */
  availablePresets: PresetDefinition[]
  setPreset: (preset: UiPresetId) => void
  setDensity: (density: UiDensity) => void
  setLayoutMode: (mode: UiLayoutMode) => void
  setColorMode: (mode: UiColorMode) => void
  resetToDefault: () => void
}
