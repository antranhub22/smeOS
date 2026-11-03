"use client"

import React, { useCallback, useState } from "react"
import { Card } from "@/components/ui/card"
import { LinkIcon } from "@/components/ui/icons"
import { formatDateTime } from "@/lib/i18n/formatters"
import { MarketplaceBrowser, type MarketplaceLoadResult } from "@/app/(platform)/van-hanh/marketplace/marketplace-browser"

const errorFor = (status: number) => (status === 429 ? "Bạn tải lại quá nhanh, vui lòng thử lại sau ít phút." : null)

function LinkUnavailable() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="max-w-md space-y-3 p-8 text-center">
        <LinkIcon className="mx-auto h-10 w-10 text-text-muted/50" />
        <h1 className="text-base font-semibold text-text">Link không còn hiệu lực</h1>
        <p className="text-xs text-text-muted">Link đã hết hạn hoặc đã bị huỷ. Vui lòng xin người gửi một link mới.</p>
      </Card>
    </main>
  )
}

export function SharedMarketplaceView({ token }: { token: string }) {
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const onLoaded = useCallback((d: MarketplaceLoadResult) => {
    if (typeof d.expiresAt === "string") setExpiresAt(d.expiresAt)
  }, [])
  const renderError = useCallback((status: number) => (status === 404 ? <LinkUnavailable /> : null), [])

  return (
    <main className="min-h-dvh bg-bg py-6">
      <MarketplaceBrowser
        endpoint={`/api/v1/public/marketplace-share/${encodeURIComponent(token)}`}
        title="Chợ cửa hàng & đối tác"
        errorFor={errorFor}
        emptyHint="Chưa có hồ sơ khảo sát nào."
        onLoaded={onLoaded}
        renderError={renderError}
        readOnly
        actions={() =>
          expiresAt ? (
            <span className="rounded-full bg-surface-alt px-3 py-1 text-xs text-text-muted">
              Link xem đến {formatDateTime(expiresAt)}
            </span>
          ) : null
        }
      />
    </main>
  )
}
