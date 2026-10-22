import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"

// Trang ký lại mỗi lần tải (10 giây/lần) — link ảnh không cần sống 7 ngày như trước (rà soát M7)
const SIGNED_URL_TTL_SECONDS = 3600

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
