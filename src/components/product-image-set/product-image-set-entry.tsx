"use client"

import { SkeletonBlock } from "@/components/ui/skeleton"
import { useUxRolloutFlag } from "@/lib/ui-system/use-ux-rollout-flag"
import { ProductImageSetClient } from "./product-image-set-client"
import { ProductImageSetFlow } from "./product-image-set-flow"

/** Cờ `ux_pd_bo_anh_san_pham` bật cho tổ chức → luồng chuẩn mới; tắt → giữ giao diện cũ (03c E9). */
export function ProductImageSetEntry() {
  const enabled = useUxRolloutFlag("ux_pd_bo_anh_san_pham")
  if (enabled === null) return <SkeletonBlock lines={4} />
  return enabled ? <ProductImageSetFlow /> : <ProductImageSetClient />
}
