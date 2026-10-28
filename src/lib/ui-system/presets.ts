import type { PresetDefinition, UiPresetId, UiSystemConfig } from "./types"

export const DEFAULT_UI_CONFIG: UiSystemConfig = {
  preset: "moc-lan",
  density: "comfortable",
  layoutMode: "sidebar",
  colorMode: "light",
  fontPairing: "sans-clean",
  surfaceEffect: "flat",
  borderWidth: "thin",
  motionSpeed: "snappy",
  shadowStyle: "soft",
  backgroundTexture: "none",
}

export const PRESET_MOC_LAN: PresetDefinition = {
  id: "moc-lan",
  name: "Mộc Lan Artisan",
  tagline: "Ấm áp, thủ công & cảm xúc boutique",
  description:
    "Bộ nhận diện chuẩn cho smeOS. Cánh hoa ngà kem, mận chín, lá xanh sage và nhuỵ đồng mùa thu. Tôn vinh tính thủ công và sự chu đáo.",
  isDefault: true,
  scope: "all",
  fontSans: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
  fontDisplay: '"Playfair Display", Georgia, serif',
  tokens: {
    primary: "#7A2E42",
    primaryDark: "#57202F",
    primaryMuted: "#F5E6EA",
    primaryBorder: "#E0B4C0",
    secondary: "#9CAF88",
    secondaryText: "#52643F",
    accent: "#C89B3C",
    accentBg: "#FBF5E9",
    bg: "#FBF6F2",
    surface: "#FFFFFF",
    surfaceAlt: "#F5ECE4",
    border: "#E7DCD0",
    text: "#2A1E22",
    textMuted: "#746364",
    warning: "#C97A2E",
    warningBg: "#FBF1E4",
    danger: "#C4463D",
    dangerBg: "#FBEBE9",
    success: "#52643F",
    successBg: "#EAF0E6",
    info: "#1D4ED8",
    infoBg: "#EFF6FF",
    selected: "#F5ECE4",
    selectedText: "#7A2E42",
  },
  radius: {
    sm: "0.5rem",      // 8px
    md: "0.75rem",     // 12px
    lg: "1rem",        // 16px
    card: "1rem",      // 16px (rounded-2xl)
    button: "0.75rem",  // 12px (rounded-xl)
    dialog: "1rem",    // 16px (rounded-2xl)
  },
  shadows: {
    subtle: "0 1px 3px 0 rgba(42, 30, 34, 0.05)",
    card: "0 4px 20px -2px rgba(122, 46, 66, 0.05)",
    dialog: "0 25px 50px -12px rgba(42, 30, 34, 0.25)",
  },
}

export const PRESET_MODERN_SLATE: PresetDefinition = {
  id: "modern-slate",
  name: "Modern Enterprise Slate",
  tagline: "Sắc nét, chính xác & tối ưu năng suất",
  description:
    "Phong cách công nghệ cao, dữ liệu số rõ ràng, độ tương phản tuyệt đối lấy cảm hứng từ Linear và Stripe. Tối ưu cho bán lẻ chuỗi và kho vận.",
  isDefault: false,
  scope: "all",
  fontSans: '"Be Vietnam Pro", "Inter", ui-sans-serif, system-ui, sans-serif',
  tokens: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryMuted: "#EFF6FF",
    primaryBorder: "#BFDBFE",
    secondary: "#475569",
    secondaryText: "#334155",
    accent: "#EA580C",
    accentBg: "#FFF7ED",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    border: "#E2E8F0",
    text: "#0F172A",
    textMuted: "#64748B",
    warning: "#D97706",
    warningBg: "#FEF3C7",
    danger: "#DC2626",
    dangerBg: "#FEE2E2",
    success: "#059669",
    successBg: "#ECFDF5",
    info: "#0284C7",
    infoBg: "#F0F9FF",
    selected: "#EFF6FF",
    selectedText: "#2563EB",
  },
  radius: {
    sm: "0.25rem",     // 4px
    md: "0.5rem",      // 8px
    lg: "0.75rem",     // 12px
    card: "0.75rem",   // 12px (rounded-xl)
    button: "0.5rem",  // 8px (rounded-lg)
    dialog: "0.75rem", // 12px (rounded-xl)
  },
  shadows: {
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    dialog: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
}

export const PRESET_PURE_SWISS: PresetDefinition = {
  id: "pure-swiss",
  name: "Minimal Pure Swiss",
  tagline: "Tối giản tuyệt đối, tôn vinh hình ảnh",
  description:
    "Phong cách Thụy Sĩ cổ điển: đơn sắc thanh lịch, không đổ bóng thừa, đường kẻ viền mảnh dẻ. Tôn vinh 100% hình ảnh sản phẩm.",
  isDefault: false,
  scope: "all",
  fontSans: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
  tokens: {
    primary: "#18181B",
    primaryDark: "#09090B",
    primaryMuted: "#F4F4F5",
    primaryBorder: "#E4E4E7",
    secondary: "#71717A",
    secondaryText: "#52525B",
    accent: "#059669",
    accentBg: "#ECFDF5",
    bg: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceAlt: "#F4F4F5",
    border: "#E4E4E7",
    text: "#09090B",
    textMuted: "#71717A",
    warning: "#B45309",
    warningBg: "#FFFBEB",
    danger: "#B91C1C",
    dangerBg: "#FEF2F2",
    success: "#047857",
    successBg: "#ECFDF5",
    info: "#1D4ED8",
    infoBg: "#EFF6FF",
    selected: "#F4F4F5",
    selectedText: "#18181B",
  },
  radius: {
    sm: "0.125rem",    // 2px
    md: "0.25rem",     // 4px
    lg: "0.375rem",    // 6px
    card: "0.25rem",   // 4px
    button: "0.25rem", // 4px
    dialog: "0.375rem",// 6px
  },
  shadows: {
    subtle: "none",
    card: "none",
    dialog: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  },
}

export const PRESET_AURORA_UI: PresetDefinition = {
  id: "aurora-ui",
  name: "Aurora Gradient",
  tagline: "Bắc Cực Quang — gradient sống động, premium SaaS",
  description:
    "Lấy cảm hứng từ Aurora Borealis. Mesh gradient chảy mượt, màu sắc bổ sung (xanh-tím-hồng), hiệu ứng phát sáng tản mờ. Dành cho SaaS Mother Console và AI Studio.",
  isDefault: false,
  scope: "saas-mother",
  sourceStyleId: "aurora-ui",
  fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontDisplay: '"Inter", ui-sans-serif, system-ui, sans-serif',
  animationCss: `@keyframes aurora-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }`,
  tokens: {
    // Brand: Electric Blue chủ đạo, Magenta accent, Cyan highlight
    primary: "#6366F1",         // Indigo-violet — anchor màu thương hiệu
    primaryDark: "#4F46E5",
    primaryMuted: "#EEF2FF",
    primaryBorder: "#C7D2FE",
    secondary: "#8B5CF6",       // Purple — complementary
    secondaryText: "#6D28D9",
    accent: "#EC4899",          // Magenta/Pink — neon accent
    accentBg: "#FDF2F8",
    // Nền: gradient aurora (áp dụng qua animationCss + CSS var)
    bg: "#0F0F1A",              // Dark deep navy — nền stage tối
    surface: "#1A1A2E",        // Surface panels: dark glass
    surfaceAlt: "#16213E",
    border: "rgba(99,102,241,0.2)",   // Viền phát sáng tím
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    warning: "#F59E0B",
    warningBg: "rgba(245,158,11,0.1)",
    danger: "#EF4444",
    dangerBg: "rgba(239,68,68,0.1)",
    success: "#10B981",
    successBg: "rgba(16,185,129,0.1)",
    info: "#38BDF8",            // Cyan — info highlight
    infoBg: "rgba(56,189,248,0.1)",
    selected: "rgba(99,102,241,0.15)",
    selectedText: "#818CF8",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    card: "1.25rem",    // Bo lớn — glassmorphism card
    button: "0.75rem",
    dialog: "1.25rem",
  },
  shadows: {
    subtle: "0 1px 3px 0 rgba(99,102,241,0.1)",
    card: "0 8px 32px -4px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.1)",
    dialog: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.15)",
  },
}

/** Editorial Grid / Magazine — ChainOS & StoreOS
 *  Source: ui-ux-pro-max catalog → editorial-grid-magazine
 *  Scope: chain-store (ChainOS /chain & StoreOS /store)
 */
export const PRESET_EDITORIAL_GRID: PresetDefinition = {
  id: "editorial-grid",
  name: "Editorial Magazine",
  tagline: "Lưới biên tập — tôn vinh sản phẩm như tạp chí",
  description:
    "Phong cách magazine đương đại: lưới bất đối xứng, typography biên tập, khoảng trắng có chủ đích. Dành cho ChainOS và StoreOS — tôn vinh lookbook ngành hàng.",
  isDefault: false,
  scope: "chain-store",
  sourceStyleId: "editorial-grid-magazine",
  fontSans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  fontDisplay: '"Playfair Display", Georgia, serif',
  tokens: {
    // High contrast editorial: black ink + white paper + accent brand
    primary: "#111111",         // Ink black — heading, border chủ đạo
    primaryDark: "#000000",
    primaryMuted: "#F5F5F5",
    primaryBorder: "#D4D4D4",
    secondary: "#525252",       // Body text muted
    secondaryText: "#404040",
    accent: "#B45309",          // Amber/Ochre — editorial accent (thay đổi theo ngành)
    accentBg: "#FFFBEB",
    bg: "#FAFAFA",              // Paper white — nền trang
    surface: "#FFFFFF",        // Card/panel: trắng tinh khôi
    surfaceAlt: "#F5F5F5",     // Alt surface: off-white nhẹ
    border: "#E5E5E5",         // Đường kẻ mảnh như magazine
    text: "#111111",           // Ink black
    textMuted: "#737373",
    warning: "#B45309",
    warningBg: "#FFFBEB",
    danger: "#DC2626",
    dangerBg: "#FEF2F2",
    success: "#15803D",
    successBg: "#F0FDF4",
    info: "#1D4ED8",
    infoBg: "#EFF6FF",
    selected: "#F5F5F5",
    selectedText: "#111111",
  },
  radius: {
    sm: "0rem",       // 0px — sharp editorial corners
    md: "0.125rem",   // 2px — nearly flat
    lg: "0.25rem",    // 4px
    card: "0rem",     // Card vuông — magazine block style
    button: "0.125rem",
    dialog: "0.25rem",
  },
  shadows: {
    subtle: "none",
    card: "0 1px 0 0 #E5E5E5",  // Chỉ border-bottom — magazine divider
    dialog: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
  },
}

// =============================================================================
// PRESET 6: GLASSMORPHISM LUXE (Translucent frosted glass, Z-depth)
// Source: ui-ux-pro-max catalog style "glassmorphism"
// =============================================================================
export const PRESET_GLASSMORPHISM: PresetDefinition = {
  id: "glassmorphism",
  name: "Glassmorphism Luxe",
  tagline: "Kính mờ xuyên thấu, ánh sáng phân tầng cao cấp",
  description:
    "Lấy cảm hứng từ giao diện Frosted Glass. Thẻ kính bán trong suốt, hiệu ứng đổ bóng mờ Z-depth, viền phản quang vi mô sang trọng.",
  scope: "all",
  sourceStyleId: "glassmorphism",
  fontSans: '"Be Vietnam Pro", system-ui, sans-serif',
  fontDisplay: '"Plus Jakarta Sans", system-ui, sans-serif',
  tokens: {
    primary: "#0284C7",
    primaryDark: "#0369A1",
    primaryMuted: "#E0F2FE",
    primaryBorder: "#BAE6FD",
    secondary: "#64748B",
    secondaryText: "#334155",
    accent: "#8B5CF6",
    accentBg: "#F5F3FF",
    bg: "#F0F4F8",
    surface: "rgba(255, 255, 255, 0.78)",
    surfaceAlt: "rgba(255, 255, 255, 0.55)",
    border: "rgba(255, 255, 255, 0.65)",
    text: "#0F172A",
    textMuted: "#64748B",
    warning: "#F59E0B",
    warningBg: "#FEF3C7",
    danger: "#EF4444",
    dangerBg: "#FEE2E2",
    success: "#10B981",
    successBg: "#D1FAE5",
    info: "#0284C7",
    infoBg: "#E0F2FE",
    selected: "rgba(2, 132, 199, 0.12)",
    selectedText: "#0369A1",
  },
  radius: {
    sm: "0.5rem",
    md: "0.875rem",
    lg: "1.25rem",
    card: "1.25rem",
    button: "0.875rem",
    dialog: "1.5rem",
  },
  shadows: {
    subtle: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    card: "0 12px 32px 0 rgba(31, 38, 135, 0.08)",
    dialog: "0 24px 48px -12px rgba(15, 23, 42, 0.25)",
  },
}

// =============================================================================
// PRESET 7: NEO-BRUTALISM SHARP (High contrast, 0px radius, stark borders)
// Source: ui-ux-pro-max catalog style "brutalism"
// =============================================================================
export const PRESET_NEO_BRUTALISM: PresetDefinition = {
  id: "neo-brutalism",
  name: "Neo-Brutalism Stark",
  tagline: "Cực kỳ sắc nét, tương phản tuyệt đối, viền khối dứt khoát",
  description:
    "Ảnh hưởng từ phong cách Brutalist hiện đại. Góc phẳng 0px, viền khối dập nổi, không chuyển màu rườm rà, tối ưu tốc độ đọc dữ liệu.",
  scope: "all",
  sourceStyleId: "brutalism",
  fontSans: '"Space Grotesk", "Be Vietnam Pro", monospace, sans-serif',
  fontDisplay: '"Space Grotesk", sans-serif',
  tokens: {
    primary: "#000000",
    primaryDark: "#18181B",
    primaryMuted: "#F4F4F5",
    primaryBorder: "#000000",
    secondary: "#3F3F46",
    secondaryText: "#18181B",
    accent: "#E11D48",
    accentBg: "#FFE4E6",
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F4F4F5",
    border: "#000000",
    text: "#000000",
    textMuted: "#52525B",
    warning: "#CA8A04",
    warningBg: "#FEF08A",
    danger: "#DC2626",
    dangerBg: "#FEE2E2",
    success: "#16A34A",
    successBg: "#DCFCE7",
    info: "#2563EB",
    infoBg: "#DBEAFE",
    selected: "#000000",
    selectedText: "#FFFFFF",
  },
  radius: {
    sm: "0rem",
    md: "0rem",
    lg: "0rem",
    card: "0rem",
    button: "0rem",
    dialog: "0rem",
  },
  shadows: {
    subtle: "2px 2px 0px 0px #000000",
    card: "4px 4px 0px 0px #000000",
    dialog: "8px 8px 0px 0px #000000",
  },
}

// =============================================================================
// PRESET 8: SOFT NEUMORPHISM (Mềm mại, dập nổi 3D, thanh tịnh)
// Source: ui-ux-pro-max catalog style "neumorphism"
// =============================================================================
export const PRESET_SOFT_NEUMORPHISM: PresetDefinition = {
  id: "soft-neumorphism",
  name: "Soft Neumorphism",
  tagline: "Đổ bóng nổi chìm mềm mại, nhẹ nhàng và thư thái",
  description:
    "Giao diện xúc giác Soft UI. Nút bấm và thẻ như được đúc liền khối trên bề mặt chất liệu mịn, mang lại cảm giác dễ chịu và tập trung cao.",
  scope: "all",
  sourceStyleId: "neumorphism",
  fontSans: '"Be Vietnam Pro", system-ui, sans-serif',
  fontDisplay: '"Plus Jakarta Sans", system-ui, sans-serif',
  tokens: {
    primary: "#4F46E5",
    primaryDark: "#4338CA",
    primaryMuted: "#EEF2FF",
    primaryBorder: "#C7D2FE",
    secondary: "#6B7280",
    secondaryText: "#374151",
    accent: "#06B6D4",
    accentBg: "#ECFEFF",
    bg: "#EBF0F5",
    surface: "#EBF0F5",
    surfaceAlt: "#E2E8F0",
    border: "#CBD5E1",
    text: "#1E293B",
    textMuted: "#64748B",
    warning: "#D97706",
    warningBg: "#FEF3C7",
    danger: "#E11D48",
    dangerBg: "#FFE4E6",
    success: "#059669",
    successBg: "#D1FAE5",
    info: "#3B82F6",
    infoBg: "#EFF6FF",
    selected: "#E2E8F0",
    selectedText: "#4F46E5",
  },
  radius: {
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    card: "1.25rem",
    button: "1rem",
    dialog: "1.5rem",
  },
  shadows: {
    subtle: "3px 3px 6px #d1d9e2, -3px -3px 6px #ffffff",
    card: "6px 6px 14px #d1d9e2, -6px -6px 14px #ffffff",
    dialog: "10px 10px 24px #d1d9e2, -10px -10px 24px #ffffff",
  },
}

export const UI_PRESETS: Record<UiPresetId, PresetDefinition> = {
  "moc-lan": PRESET_MOC_LAN,
  "modern-slate": PRESET_MODERN_SLATE,
  "pure-swiss": PRESET_PURE_SWISS,
  "aurora-ui": PRESET_AURORA_UI,
  "editorial-grid": PRESET_EDITORIAL_GRID,
  "glassmorphism": PRESET_GLASSMORPHISM,
  "neo-brutalism": PRESET_NEO_BRUTALISM,
  "soft-neumorphism": PRESET_SOFT_NEUMORPHISM,
}

export function getUiPreset(id?: string | null): PresetDefinition {
  if (id && id in UI_PRESETS) {
    return UI_PRESETS[id as UiPresetId]
  }
  return PRESET_MOC_LAN
}
