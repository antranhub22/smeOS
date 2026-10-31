/**
 * Danh mục ảnh cửa hàng thực tế và sản phẩm mẫu phục vụ Marketplace
 * Kết hợp ảnh chụp mặt tiền tiệm hoa (storefront) và các sản phẩm hoa thực tế
 */

export const MARKETPLACE_STORE_IMAGES: string[] = [
  "/brand/storefront/store-front-01.jpg",
  "/brand/storefront/store-artisan-02.jpg",
  "/brand/storefront/store-display-03.jpg",
  "/brand/storefront/store-workshop-04.jpg",
  "/brand/storefront/store-showcase-05.jpg",
  "/mock-data/floral/store.jpg",
  "/images/flowers/g001.jpeg",
  "/images/flowers/g002.jpeg",
  "/images/flowers/g010.jpeg",
  "/images/flowers/g040.jpg",
  "/images/flowers/g041.jpg",
  "/images/flowers/g042.jpg",
  "/images/flowers/g043.jpg",
  "/images/flowers/g044.jpg",
  "/images/flowers/g050.jpeg",
  "/images/flowers/g070.jpeg",
  "/mock-data/floral/p1.jpg",
  "/mock-data/floral/p2.jpg",
  "/mock-data/floral/p3.jpg",
  "/mock-data/floral/p4.jpg",
]

/**
 * Lấy ảnh thumbnail thực tế của cửa hàng.
 * Ưu tiên ảnh thực tế đã tải về (coverPhotoUrl).
 * Nếu chưa tải, gán ảnh mẫu cố định nhất quán theo hash tên shop.
 */
export function getStoreCoverImage(
  storeId: string,
  shopName: string,
  coverPhotoUrl?: string | null
): string {
  if (coverPhotoUrl && coverPhotoUrl.trim().length > 0) {
    return coverPhotoUrl.trim()
  }

  // Hash chuỗi tên shop để gán ảnh cố định, nhất quán cho từng cửa hàng
  let hash = 0
  for (let i = 0; i < shopName.length; i++) {
    hash = (hash << 5) - hash + shopName.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % MARKETPLACE_STORE_IMAGES.length
  return MARKETPLACE_STORE_IMAGES[idx] ?? "/brand/storefront/store-front-01.jpg"
}
