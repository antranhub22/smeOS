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
        name: "Sản phẩm hồng đỏ tình yêu 30 bông",
        image: "/mock-data/floral/p1.jpg",
        price: 450000,
        originalPrice: 550000,
        category: "BIRTHDAY",
        description: "Sản phẩm hồng đỏ premium 30 bông Ecuador nhập khẩu, thiết kế bó tròn cổ điển sang trọng, kèm baby breath và lá xanh tươi",
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
        category: "SET",
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

  FNB: {
    logo: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
    storeBanner: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
    products: [
      {
        name: "Cà phê Cold Brew ủ lạnh hương cam quế 250ml",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80",
        price: 65000,
        originalPrice: 80000,
        category: "COFFEE",
        description: "Cà phê Arabica Cầu Đất ủ lạnh 18 tiếng, kết hợp lát cam vàng sấy mộc và quế thanh hữu cơ thơm ngát",
      },
      {
        name: "Bánh Croissant bơ Pháp ngàn lớp nướng giòn",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
        price: 45000,
        originalPrice: 55000,
        category: "BAKERY",
        description: "Bánh sừng bò truyền thống bơ nguyên chất nhập Pháp, vỏ giòn xốp ngàn lớp ruột mềm mướt thơm phức",
      },
      {
        name: "Bánh kem bắp phô mai Mascarpone tươi 18cm",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
        price: 350000,
        originalPrice: 420000,
        category: "PASTRY_CAKE",
        description: "Cốt bánh bông lan mềm tan quyện sốt bắp sữa ngọt thanh và lớp kem béo ngậy Mascarpone thanh mát",
      },
      {
        name: "Set tiệc Teabreak bánh ngọt & đồ uống cao cấp",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
        price: 850000,
        originalPrice: 1050000,
        category: "COMBO",
        description: "Set tiệc gồm 16 phần bánh ngọt mặn mini (croissant, tart trái cây, panna cotta) kèm khay bày sang trọng",
      },
    ],
  },

  CRAFT_GIFT: {
    logo: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80",
    storeBanner: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
    products: [
      {
        name: "Bộ ấm chén gốm mộc men tro hỏa biến Bát Tràng",
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
        price: 580000,
        originalPrice: 720000,
        category: "CERAMICS",
        description: "Bộ ấm 6 chén gốm nung củi truyền thống, bề mặt men tro hỏa biến tự nhiên mỗi sản phẩm là một tác phẩm độc bản",
      },
      {
        name: "Nến thơm sáp đậu nành tinh dầu gỗ tuyết tùng 200g",
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
        price: 290000,
        originalPrice: 350000,
        category: "SCENTED_CANDLE",
        description: "Nến sáp đậu nành thiên nhiên 100%, bấc gỗ kêu lách tách khi cháy, hương gỗ thông và tuyết tùng ấm áp thư giãn",
      },
      {
        name: "Hộp quà tặng thủ công khắc tên gỗ mỹ thuật",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
        price: 950000,
        originalPrice: 1200000,
        category: "GIFT_BOX",
        description: "Hộp quà kraft mỹ thuật nơ lụa gồm nến thơm, xà phòng hữu cơ và cốc gốm mộc, hỗ trợ khắc tên hoặc logo miễn phí",
      },
      {
        name: "Bình hoa gốm thủ công vuốt tay men rạn",
        image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80",
        price: 420000,
        originalPrice: 500000,
        category: "CERAMICS",
        description: "Bình gốm vuốt tay dáng củ tỏi, men rạn cổ điển tông mộc, thích hợp cắm cành khô, sen đá hoặc hoa thược dược",
      },
    ],
  },

  RETAIL_GENERAL: {
    logo: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80",
    storeBanner: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80",
    products: [
      {
        name: "Gạo thơm hữu cơ ST25 túi 5kg chuẩn xuất khẩu",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
        price: 220000,
        originalPrice: 260000,
        category: "GROCERY",
        description: "Gạo ST25 gạo ngon nhất thế giới trồng theo chuẩn hữu cơ sinh học, hạt dài trắng đều, cơm dẻo dai thơm mùi lá dứa",
      },
      {
        name: "Hộp trà ô long đặc sản hữu cơ thượng hạng 200g",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
        price: 185000,
        originalPrice: 230000,
        category: "GROCERY",
        description: "Trà ô long búp non vùng cao nguyên Cầu Đất, nước trà vàng óng thanh tao, hậu ngọt thanh kéo dài",
      },
      {
        name: "Bộ hộp thủy tinh chịu nhiệt nắp khóa khí 3 món",
        image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80",
        price: 340000,
        originalPrice: 420000,
        category: "HOUSEHOLD",
        description: "Thủy tinh Borosilicate cao cấp dùng được trong lò vi sóng và máy rửa bát, gioăng silicone kháng khuẩn kín khí 100%",
      },
      {
        name: "Giỏ quà tết sum vầy bánh kẹo ngoại nhập cao cấp",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
        price: 890000,
        originalPrice: 1150000,
        category: "GROCERY",
        description: "Giỏ quà đan mây sang trọng gồm rượu vang nho, sôcôla Bỉ, hạt dẻ cười Mỹ và bánh quy bơ Đan Mạch",
      },
    ],
  },

  SERVICES: {
    logo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
    storeBanner: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&q=80",
    products: [
      {
        name: "Liệu trình gội đầu dưỡng sinh thảo dược 60 phút",
        image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80",
        price: 250000,
        originalPrice: 350000,
        category: "SPA_MASSAGE",
        description: "Nước gội đun từ bồ kết, vỏ bưởi và sả chanh; kết hợp massage bấm huyệt đả thông kinh lạc vùng đầu cổ vai gáy",
      },
      {
        name: "Chăm sóc da mặt chuyên sâu điện di tinh chất HA",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
        price: 550000,
        originalPrice: 750000,
        category: "SKINCARE",
        description: "Quy trình 12 bước: làm sạch sâu, hút bã nhờn, điện di lạnh tinh chất Hyaluronic Acid đa tầng cấp ẩm và phục hồi da",
      },
      {
        name: "Massage body đá nóng Himalaya thư giãn 90 phút",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
        price: 680000,
        originalPrice: 890000,
        category: "SPA_MASSAGE",
        description: "Sử dụng đá muối khoáng nóng kết hợp tinh dầu gừng ấm giải tỏa căng cơ, lưu thông khí huyết và hỗ trợ giấc ngủ sâu",
      },
      {
        name: "Combo phục hồi cổ vai gáy giải tỏa căng thẳng",
        image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
        price: 420000,
        originalPrice: 550000,
        category: "SPA_MASSAGE",
        description: "Trị liệu chuyên sâu cho nhân viên văn phòng: đắp bùn cứu thảo dược, xoa bóp ấn huyệt giải trừ nhức mỏi chỉ sau 1 buổi",
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
 * Danh sách các ngành đã có mock data đầy đủ
 */
export const INDUSTRIES_WITH_MOCK_ASSETS = Object.keys(MOCK_ASSETS_CATALOG)

