import { prisma } from "@/core/tenancy/infra/prisma"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { driveThumbProxySrc } from "../domain/drive-thumb"

export interface OrderSampleSource {
  organization_id: string
  items?: Array<{
    product_id?: string | null
    description?: string | null
    metadata?: unknown
  }> | null
  greeting_sessions?: Array<{
    selected_product_id?: string | null
    product_snapshot?: unknown
  }> | null
}

/**
 * Giải quyết URL ảnh mẫu hoa của đơn hàng cho các kênh đối tác / màn hình gia công:
 * 1. Kiểm tra product_snapshot của greeting_sessions (ảnh chụp lúc khách chọn mẫu)
 * 2. Kiểm tra metadata của items[0] (ảnh chụp lưu ở dòng đơn)
 * 3. Nếu chưa có ảnh: Truy vấn ngược vào bảng products và product_images của kho hàng
 * 4. Nếu là storage key (org/... hoặc floraos-core/org/...) -> ký URL signedUrl GET hạn 7 ngày
 * 5. Nếu là link Google Drive -> proxy qua driveThumbProxySrc
 */
export async function resolveSubcontractSamplePhoto(
  order: OrderSampleSource,
  options?: { baseUrl?: string }
): Promise<string | null> {
  const firstItem = order.items?.[0]
  const session = order.greeting_sessions?.[0]
  const snapshot = (session?.product_snapshot as Record<string, unknown> | null) ?? {}
  const firstItemMeta = (firstItem?.metadata as Record<string, unknown> | null) ?? {}

  let rawImageUrl: string | null =
    (snapshot.image_url as string | undefined) ||
    (snapshot.imageUrl as string | undefined) ||
    (snapshot.image as string | undefined) ||
    (firstItemMeta.imageUrl as string | undefined) ||
    (firstItemMeta.image as string | undefined) ||
    (firstItemMeta.image_url as string | undefined) ||
    null

  const productId = firstItem?.product_id || session?.selected_product_id || null
  const productName = firstItem?.description || (snapshot.name as string | undefined) || null

  // Fallback 1: Nếu đơn chưa có ảnh trong snapshot/metadata nhưng có productId hoặc productName -> tra bảng products
  if (!rawImageUrl && (productId || productName)) {
    try {
      const productRow = await prisma.products.findFirst({
        where: productId
          ? { id: productId, organization_id: order.organization_id }
          : {
              organization_id: order.organization_id,
              name: { equals: productName!, mode: "insensitive" },
            },
        select: {
          attributes: true,
          images: {
            orderBy: { position: "asc" },
            take: 10,
            select: { asset_id: true, role: true },
          },
        },
      })

      if (productRow) {
        const firstImg = productRow.images.find((i) => i.role === "MAIN") ?? productRow.images[0]
        if (firstImg?.asset_id) {
          const asset = await prisma.assets.findFirst({
            where: { id: firstImg.asset_id, organization_id: order.organization_id },
            select: { storage_key: true },
          })
          if (asset?.storage_key) {
            rawImageUrl = asset.storage_key
          }
        }

        if (!rawImageUrl) {
          const attrs = (productRow.attributes as Record<string, unknown> | null) ?? {}
          if (typeof attrs.imageUrl === "string" && attrs.imageUrl) {
            rawImageUrl = attrs.imageUrl
          } else if (typeof attrs.drive_link === "string" && attrs.drive_link) {
            rawImageUrl = driveThumbProxySrc(attrs.drive_link)
          }
        }
      }
    } catch {
      // Fallback an toàn nếu lỗi DB
    }
  }

  // Fallback 2: Kiểm tra driveLink nếu có trong snapshot hoặc metadata
  if (!rawImageUrl) {
    const driveLink =
      (snapshot.driveLink as string | undefined) ||
      (snapshot.drive_link as string | undefined) ||
      (firstItemMeta.driveLink as string | undefined) ||
      (firstItemMeta.drive_link as string | undefined) ||
      null
    if (driveLink) {
      rawImageUrl = driveThumbProxySrc(driveLink)
    }
  }

  // Nếu là storage key -> ký signed URL
  if (rawImageUrl && (rawImageUrl.startsWith("org/") || rawImageUrl.includes("floraos-core/org/"))) {
    try {
      const storage = getStorageProvider()
      const key = rawImageUrl.startsWith("org/")
        ? rawImageUrl
        : rawImageUrl.match(/floraos-core\/(org\/[^?]+)/)?.[1]
      if (key) {
        rawImageUrl = await storage.signedUrl(key, 604800, "GET").catch(() => rawImageUrl)
      }
    } catch {
      // Return original URL on error
    }
  }

  // Fallback 3: Nếu vẫn chưa có ảnh, tìm bất kỳ ảnh sản phẩm nào có sẵn trong tổ chức làm ảnh đại diện mẫu
  if (!rawImageUrl) {
    try {
      const anyAsset = await prisma.assets.findFirst({
        where: {
          organization_id: order.organization_id,
          mime_type: { startsWith: "image/" },
        },
        orderBy: { created_at: "desc" },
        select: { storage_key: true },
      })
      if (anyAsset?.storage_key) {
        const storage = getStorageProvider()
        rawImageUrl = await storage.signedUrl(anyAsset.storage_key, 604800, "GET").catch(() => null)
      }
    } catch {
      // fallback
    }
  }

  if (!rawImageUrl) return null

  // Chuẩn hóa thành absolute URL nếu có baseUrl và rawImageUrl là relative path (/api/v1/...)
  if (rawImageUrl.startsWith("/") && options?.baseUrl) {
    const origin = options.baseUrl.replace(/\/+$/, "")
    return `${origin}${rawImageUrl}`
  }

  return rawImageUrl
}
