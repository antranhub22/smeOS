import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublicStoreProfile, recordStoreProfileView } from "@/modules/profiles/use-cases/get-public-store-profile"
import { PublicStoreProfileView } from "@/components/store-share/public-store-profile-view"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Ảnh và tiêu đề xem trước khi dán link vào Zalo/Facebook. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getPublicStoreProfile((await params).slug)
  if (result.status !== "ACTIVE") return { title: "Cửa hàng", robots: { index: false } }
  const { name, description, address, logoUrl } = result.profile
  const desc = description ?? address ?? `Thông tin liên hệ của ${name}`
  return {
    title: name,
    description: desc,
    openGraph: { title: name, description: desc, type: "profile", ...(logoUrl ? { images: [logoUrl] } : {}) },
  }
}

export default async function StoreSharePage({ params }: PageProps) {
  const { slug } = await params
  const result = await getPublicStoreProfile(slug)
  if (result.status === "NOT_FOUND") notFound()
  if (result.status === "REVOKED") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border text-center">
          <h1 className="text-xl font-bold text-text mb-2">Cửa hàng đã ngừng chia sẻ trang này</h1>
          <p className="text-sm text-text-muted">Vui lòng liên hệ cửa hàng để nhận đường dẫn mới.</p>
        </div>
      </main>
    )
  }
  await recordStoreProfileView(slug)
  return <PublicStoreProfileView profile={result.profile} />
}
