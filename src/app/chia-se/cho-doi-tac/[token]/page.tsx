import type { Metadata } from "next"
import { SharedMarketplaceView } from "./shared-marketplace-view"

// Link chia sẻ chợ đối tác (PO 01/11/2026): xem không cần đăng nhập, không có thanh điều hướng.
export const metadata: Metadata = {
  title: "Chợ cửa hàng & đối tác",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function SharedMarketplacePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <SharedMarketplaceView token={token} />
}
