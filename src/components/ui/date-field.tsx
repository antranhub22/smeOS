"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/icons"
import { useFormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"

export interface DateFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      className,
      hasError: explicitHasError,
      id: explicitId,
      name: explicitName,
      required: explicitRequired,
      disabled: explicitDisabled,
      ...props
    },
    ref
  ) => {
    const field = useFormField()

    const id = explicitId || field?.id
    const name = explicitName || field?.name
    const isRequired = explicitRequired ?? field?.required
    const isDisabled = explicitDisabled ?? field?.disabled
    const hasError = explicitHasError ?? field?.hasError ?? false

    const describedBy = [
      props["aria-describedby"],
      field?.descriptionId,
      hasError ? field?.errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="date"
          id={id}
          name={name}
          required={isRequired}
          disabled={isDisabled}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-12 w-full rounded-xl border bg-surface px-3.5 py-2.5 text-body text-text transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-danger focus-visible:outline-danger"
              : "border-border hover:border-primary/40",
            className
          )}
          {...props}
        />
        <Calendar className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      </div>
    )
  }
)
DateField.displayName = "DateField"
