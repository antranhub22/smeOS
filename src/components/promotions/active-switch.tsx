"use client"

/** Công tắc Đang dùng / Tắt — cùng kiểu công tắc ưu đãi trong ma trận ưu đãi. */
export function ActiveSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean | undefined
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  )
}
