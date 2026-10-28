/**
 * Design Tokens Registry & Mapping — smeOS (Phase 2)
 *
 * Ánh xạ giữa các Design Tokens trừu tượng và CSS Custom Properties.
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
  spacious: {
    tableRowHeight: "3.75rem", // 60px
    tableCellPadding: "1rem 1.25rem",
    cardPadding: "1.75rem",
    formGap: "1.5rem",
    buttonHeightSm: "3rem", // 48px
    buttonHeightDef: "3.5rem", // 56px
  },
} as const
