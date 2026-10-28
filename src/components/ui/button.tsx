import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-dark",
        secondary: "bg-surface text-primary border border-border hover:border-primary",
        outline: "border border-border bg-transparent text-text hover:bg-surface-alt",
        ghost: "text-text hover:bg-surface-alt",
        warning: "bg-warning text-white hover:opacity-90",
        danger: "bg-danger text-white hover:opacity-90",
        subtle: "bg-surface-alt text-text hover:bg-border/70 border border-transparent",
      },
      size: {
        default: "h-12 px-5 text-title-sm",
        sm: "h-11 px-4 text-sm",
        xs: "h-8 px-2.5 text-caption rounded-lg",
        lg: "h-14 px-6 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, onClick, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
