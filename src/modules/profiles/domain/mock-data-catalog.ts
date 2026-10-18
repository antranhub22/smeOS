/**
 * mock-data-catalog.ts — SSOT dữ liệu mẫu đầy đủ theo ngành (hình ảnh + hồ sơ)
 *
 * Nguyên tắc:
 * - Ảnh đã tạo bằng AI (superrealistic minimalist): lưu tại /public/mock-data/<industry>/
 * - Ảnh chưa tạo: dùng Unsplash URL chất lượng cao làm placeholder
 * - File này CHỈ import trong môi trường dev hoặc bởi superadmin
 * - Khi tạo ngành mới + mock data → bổ sung entry tương ứng vào đây
 *
 * Cập nhật: FLORAL ✅  FASHION ✅  HOMESTAY ✅
 * Chờ quota AI: FNB ⏳  CRAFT_GIFT ⏳  SERVICES ⏳  RETAIL_GENERAL ⏳
 */

export interface MockProductAsset {
  name: string
  image: string
  price: number
  originalPrice: number
  category: string
  description: string
}

export interface IndustryMockAssets {
  logo: string
  storeBanner: string
  products: MockProductAsset[]
}

export const MOCK_ASSETS_CATALOG: Record<string, IndustryMockAssets> = {
  FLORAL: {
    logo: "/mock-data/floral/logo.jpg",
    storeBanner: "/mock-data/floral/store.jpg",
    products: [
      {
        name: "Bó hoa hồng đỏ tình yêu 30 bông",
        image: "/mock-data/floral/p1.jpg",
        price: 450000,
        originalPrice: 550000,
        category: "BIRTHDAY",
        description: "Bó hoa hồng đỏ premium 30 bông Ecuador nhập khẩu, thiết kế bó tròn cổ điển sang trọng, kèm baby breath và lá xanh tươi",
      },
      {
        name: "Hộp hoa sinh nhật pastel mix",
        image: "/mock-data/floral/p2.jpg",
        price: 650000,
        originalPrice: 780000,
        category: "BIRTHDAY",
        description: "Hộp hoa vuông pastel tone hồng – tím – trắng, mix hồng ngoại, thược dược, tulip và baby breath, hộp kraft thiết kế riêng",
      },
      {
        name: "Kệ hoa khai trương sự kiện",
        image: "/mock-data/floral/p3.jpg",
        price: 1200000,
        originalPrice: 1500000,
        category: "EVENT",
        description: "Kệ hoa khai trương 1.6m, thiết kế bất đối xứng hiện đại, hoa mix hồng – cúc – baby breath – lá nhiệt đới xanh mướt",
      },
      {
        name: "Bình hoa cưới trang trí bàn tiệc",
        image: "/mock-data/floral/p4.jpg",
        price: 380000,
        originalPrice: 450000,
        category: "WEDDING",
        description: "Bình hoa bàn tiệc tone white – blush, hoa hồng trắng, mẫu đơn, lá bạch đàn cành, hoa baby breath bồng bềnh lãng mạn",
      },
    ],
  },

  FASHION: {
    logo: "/mock-data/fashion/logo.jpg",
    storeBanner: "/mock-data/fashion/store.jpg",
    products: [
      {
        name: "Đầm dự tiệc lụa xéo vai off-shoulder",
        image: "/mock-data/fashion/p1.jpg",
        price: 2800000,
        originalPrice: 3500000,
        category: "EVENING_DRESS",
        description: "Đầm dự tiệc lụa Ý xéo vai off-shoulder, form A-line ôm dáng, màu champagne gold, khóa kéo ẩn sau lưng, thiết kế độc quyền",
      },
      {
        name: "Vest công sở nữ slim-fit vải tweed",
        image: "/mock-data/fashion/p2.jpg",
        price: 1900000,
        originalPrice: 2400000,
        category: "BUSINESS_WEAR",
        description: "Bộ vest nữ công sở vải tweed Pháp cao cấp, cổ V thanh lịch, form slim-fit tôn dáng, phù hợp meetings và sự kiện doanh nghiệp",
      },
      {
        name: "Áo dài cách tân vải gấm thêu hoa",
        image: "/mock-data/fashion/p3.jpg",
        price: 3200000,
        originalPrice: 4000000,
        category: "AO_DAI",
        description: "Áo dài cách tân vải gấm lụa thêu tay họa tiết hoa sen, cổ đứng truyền thống, quần ống suông đi kèm, may đo theo số đo riêng",
      },
      {
        name: "Set đồ street style blazer + jogger",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90",
        price: 1450000,
        originalPrice: 1800000,
        category: "CASUAL",
        description: "Set đồ casual-chic: blazer oversize monochrome + jogger vải nỉ co giãn, tông màu kem – đen tương phản, phù hợp đi cafe và làm việc",
      },
    ],
  },

  HOMESTAY: {
    logo: "/mock-data/homestay/logo.jpg",
    storeBanner: "/mock-data/homestay/store.jpg",
    products: [
      {
        name: "Phòng Studio Deluxe ban công view thung lũng",
        image: "/mock-data/homestay/p1.jpg",
        price: 890000,
        originalPrice: 1100000,
        category: "STUDIO_ROOM",
        description: "Phòng studio 30m² ban công tầng 3 view thung lũng xanh mướt, giường king-size, minibar, Smart TV 43\", tắm vòi sen rain shower",
      },
      {
        name: "Phòng đôi Superior giường King hướng vườn",
        image: "/mock-data/homestay/p2.jpg",
        price: 1150000,
        originalPrice: 1400000,
        category: "STUDIO_ROOM",
        description: "Phòng đôi 35m² view sân vườn nhiệt đới thoáng mát, bồn tắm nằm cao cấp, ban công thư giãn thưởng trà sáng sớm",
      },
      {
        name: "Căn hộ nghỉ dưỡng 2 phòng ngủ ấm cúng gia đình",
        image: "/mock-data/homestay/p3.jpg",
        price: 1800000,
        originalPrice: 2200000,
        category: "FAMILY_ROOM",
        description: "Căn hộ 2 phòng ngủ 65m², phòng khách riêng, bếp nhỏ tiện nghi, ban công ngắm rừng, phù hợp gia đình 4–6 người, tặng bữa sáng",
      },
      {
        name: "Bungalow gỗ mộc sân vườn view thiên nhiên",
        image: "/mock-data/homestay/p4.jpg",
        price: 1350000,
        originalPrice: 1650000,
        category: "BUNGALOW",
        description: "Bungalow biệt lập xây dựng từ gỗ thông tự nhiên, hiên nhà rộng rãi, không gian yên tĩnh thư giãn giữa cỏ cây hoa lá",
      },
      {
        name: "Villa nguyên căn sân vườn hồ bơi tiệc nướng BBQ",
        image: "/mock-data/homestay/p5.jpg",
        price: 4500000,
        originalPrice: 5500000,
        category: "ENTIRE_VILLA",
        description: "Villa nguyên căn 120m² + sân vườn 200m², bể bơi vô cực, khu BBQ ngoài trời, 3 phòng ngủ, không gian riêng tư lý tưởng cho đoàn khách",
      },
    ],
  },
}

/**
 * Lấy assets mock data cho một ngành
 */
export function getMockAssetsForIndustry(industryKey: string): IndustryMockAssets | null {
  return MOCK_ASSETS_CATALOG[industryKey] ?? null
}

/**
 * Danh sách các ngành đã có mock data đầy đủ (ảnh AI đã tạo)
 */
export const INDUSTRIES_WITH_MOCK_ASSETS = Object.keys(MOCK_ASSETS_CATALOG)
