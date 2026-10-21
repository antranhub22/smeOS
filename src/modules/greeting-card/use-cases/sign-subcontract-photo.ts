import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"

const SIGNED_URL_TTL_SECONDS = 604800

/**
 * Ảnh QC / giao hàng lưu dạng khoá kho (`org/...`) hoặc URL cũ chứa khoá — đổi thành URL ký
 * để trang Thẻ Gia Công hiển thị. Ký lỗi thì giữ nguyên giá trị gốc.
 */
export async function signSubcontractPhoto(photo: string): Promise<string> {
  if (!photo) return photo
  const key = photo.startsWith("org/") ? photo : photo.match(/floraos-core\/(org\/[^?]+)/)?.[1]
  if (!key) return photo
  try {
    return await getStorageProvider().signedUrl(key, SIGNED_URL_TTL_SECONDS, "GET")
  } catch {
    return photo
  }
}
