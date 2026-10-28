import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | "sm"
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "default", hasError = false, ...props }, ref) => {
    const sizeClasses = {
      default: "h-11 px-3.5 py-2 text-body",
      sm: "h-9 px-3 py-1.5 text-body-sm",
    }

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border bg-surface text-text transition-colors",
          "placeholder:text-text-muted",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError ? "border-danger focus-visible:outline-danger" : "border-border hover:border-primary/40",
          sizeClasses[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }