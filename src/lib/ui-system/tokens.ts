/**
 * Design Tokens Registry & Mapping — smeOS Architecture (Phase 1)
 *
 * Ánh xạ giữa các Design Tokens trừu tượng và CSS Custom Properties.
 * Density: compact và comfortable (ADR-011 D-UI-03: loại bỏ spacious).
 */

export const CSS_VARIABLE_MAP = {
  primary: "--color-primary",
  primaryDark: "--color-primary-dark",
  primaryMuted: "--color-primary-muted",
  primaryBorder: "--color-primary-border",
  secondary: "--color-secondary",
  secondaryText: "--color-secondary-text",
  accent: "--color-accent",
  accentBg: "--color-accent-bg",
  bg: "--color-bg",
  surface: "--color-surface",
  surfaceAlt: "--color-surface-alt",
  border: "--color-border",
  text: "--color-text",
  textMuted: "--color-text-muted",
  warning: "--color-warning",
  warningBg: "--color-warning-bg",
  danger: "--color-danger",
  dangerBg: "--color-danger-bg",
  success: "--color-success",
  successBg: "--color-success-bg",
  info: "--color-info",
  infoBg: "--color-info-bg",
  selected: "--color-selected",
  selectedText: "--color-selected-text",
} as const

export const DENSITY_CONFIG = {
  compact: {
    tableRowHeight: "2.25rem", // 36px
    tableCellPadding: "0.375rem 0.75rem",
    cardPadding: "0.875rem",
    formGap: "0.75rem",
    buttonHeightSm: "2rem", // 32px
    buttonHeightDef: "2.5rem", // 40px
  },
  comfortable: {
    tableRowHeight: "3rem", // 48px
    tableCellPadding: "0.75rem 1rem",
    cardPadding: "1.25rem",
    formGap: "1rem",
    buttonHeightSm: "2.75rem", // 44px
    buttonHeightDef: "3rem", // 48px
  },
} as const
