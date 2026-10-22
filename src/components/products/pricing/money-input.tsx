"use client"

import React from "react"
import { formatVndInput, parseVndInput } from "./pricing-form"

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"

/** Ô nhập tiền: chỉ nhận số, tự chấm phân cách nghìn. */
export function MoneyInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(formatVndInput(parseVndInput(e.target.value)))}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}
