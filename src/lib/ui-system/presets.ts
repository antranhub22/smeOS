import type { PresetDefinition, UiPresetId, UiSystemConfig } from "./types"

export const DEFAULT_UI_CONFIG: UiSystemConfig = {
  preset: "moc-lan",
  density: "comfortable",
  colorMode: "light",
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
    button: "0.75rem", // 12px (rounded-xl)
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
    "Phong cách công nghệ cao, dữ liệu số rõ ràng, độ tương phản tuyệt đối lấy cảm hứng từ Linear và Stripe. Tối ưu cho SaaS Mother, ChainOS và vận hành.",
  isDefault: false,
  scope: "all",
  fontSans: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
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

export const UI_PRESETS: Record<UiPresetId, PresetDefinition> = {
  "moc-lan": PRESET_MOC_LAN,
  "modern-slate": PRESET_MODERN_SLATE,
  "pure-swiss": PRESET_PURE_SWISS,
}

export function getUiPreset(id?: string | null): PresetDefinition {
  if (id && id in UI_PRESETS) {
    return UI_PRESETS[id as UiPresetId]
  }
  return PRESET_MOC_LAN
}
