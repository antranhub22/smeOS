"use client"

import { SkeletonBlock } from "@/components/ui/skeleton"
import { useUxRolloutFlag } from "@/lib/ui-system/use-ux-rollout-flag"
import { ProductPhotoStudioClient } from "./product-photo-studio-client"
import { ProductPhotoStudioFlow } from "./product-photo-studio-flow"

/** Cờ `ux_pd_anh_san_pham` bật cho tổ chức → luồng chuẩn mới; tắt → giữ giao diện cũ (03c E9). */
export function ProductPhotoStudioEntry() {
  const enabled = useUxRolloutFlag("ux_pd_anh_san_pham")
  if (enabled === null) return <SkeletonBlock lines={4} />
  return enabled ? <ProductPhotoStudioFlow /> : <ProductPhotoStudioClient />
}
