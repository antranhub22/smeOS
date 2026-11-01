"use client"

import * as React from "react"
import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { User } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl"

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "className"> {
  src?: string | null | undefined
  alt?: string | undefined
  fallback?: React.ReactNode | undefined
  size?: AvatarSize | undefined
  shape?: "circle" | "rounded" | undefined
  className?: string | undefined
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "Ảnh đại diện",
      fallback,
      size = "md",
      shape = "circle",
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses: Record<AvatarSize, string> = {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-8 w-8 text-caption",
      md: "h-10 w-10 text-body-sm",
      lg: "h-12 w-12 text-title-sm",
      xl: "h-16 w-16 text-title",
    }

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl"

    return (
      <BaseAvatar.Root
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-alt font-bold text-text-muted select-none",
          sizeClasses[size],
          shapeClass,
          className
        )}
        {...props}
      >
        {src && (
          <BaseAvatar.Image
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        )}
        <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center uppercase font-bold text-text">
          {fallback || <User className="h-1/2 w-1/2 opacity-70" />}
        </BaseAvatar.Fallback>
        {children}
      </BaseAvatar.Root>
    )
  }
)
Avatar.displayName = "Avatar"
