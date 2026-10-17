/**
 * industry-profile.ts — Định nghĩa và danh mục cấu hình ngành (Industry Profile SSOT)
 *
 * Cho phép smeOS thích ứng linh hoạt đa ngành (Bán lẻ, Thời trang, F&B, Quà tặng/Thủ công, Dịch vụ, Hoa tươi)
 * mà không phải sửa đổi cấu trúc CSDL hay viết lại logic nghiệp vụ cốt lõi.
 *
 * Luật thuần — Không import Prisma, không phụ thuộc client.
 */

export type IndustryKey =
  | "FLORAL"          // Hoa & Cây cảnh (Ngành mặc định/kế thừa)
  | "FASHION"         // Thời trang, may mặc, phụ kiện
  | "FNB"             // Ẩm thực, nhà hàng, quán cafe, tiệm bánh
  | "CRAFT_GIFT"      // Quà tặng, đồ thủ công, đồ trang trí
  | "RETAIL_GENERAL"  // Bán lẻ tổng hợp, siêu thị mini, tạp hóa
  | "SERVICES"        // Dịch vụ, salon, spa, sửa chữa

export const DEFAULT_INDUSTRY: IndustryKey = "FLORAL"

export interface IndustryTerminology {
  readonly makerTitle: string              // Tên vai trò người sản xuất (Thợ hoa, Đầu bếp, Thợ may...)
  readonly makerAction: string             // Hành động chế tác (Cắm hoa, Chế biến, May đo, Đóng gói...)
  readonly productRecipe: string           // Công thức cấu thành (Công thức cành, Định lượng món, Bảng định mức...)
  readonly sampleProduct: string           // Mẫu sản phẩm chuẩn (Mẫu hoa, Mẫu món, Lookbook...)
  readonly rawMaterialItem: string         // Đơn vị nguyên liệu (Cành hoa, Nguyên liệu, Vải/Phụ liệu...)
  readonly completedProductPhoto: string   // Ảnh thành phẩm (Ảnh mẫu cắm xong, Ảnh món ra đĩa, Ảnh trang phục...)
  readonly printablesTitle: string         // Thẻ đính kèm (Thiệp chúc mừng, Thẻ cảm ơn, Menu, Phiếu bảo hành...)
  readonly defaultMeasurementUnits: readonly string[] // Các đơn vị tính thông dụng
  readonly defaultComponentRoles: readonly { readonly key: string; readonly label: string }[]
}

export interface IndustryDefinition {
  readonly key: IndustryKey
  readonly name: string
  readonly description: string
  readonly terms: IndustryTerminology
}

export const INDUSTRY_CATALOG: Record<IndustryKey, IndustryDefinition> = {
  FLORAL: {
    key: "FLORAL",
    name: "Hoa & Cây cảnh",
    description: "Cửa hàng hoa tươi, cây cảnh, hoa sự kiện và điện hoa",
    terms: {
      makerTitle: "Thợ cắm hoa",
      makerAction: "Cắm hoa",
      productRecipe: "Công thức cành hoa",
      sampleProduct: "Mẫu hoa chuẩn",
      rawMaterialItem: "Cành/Loại hoa",
      completedProductPhoto: "Ảnh hoa hoàn thành",
      printablesTitle: "Thiệp chúc mừng",
      defaultMeasurementUnits: ["cành", "bó", "chậu", "giỏ", "kệ", "nhánh", "hộp"],
      defaultComponentRoles: [
        { key: "PRIMARY", label: "Hoa chính" },
        { key: "SECONDARY", label: "Hoa phụ" },
        { key: "FOLIAGE", label: "Lá đệm" },
        { key: "ACCESSORY", label: "Phụ kiện / Giấy gói" },
      ],
    },
  },

  FASHION: {
    key: "FASHION",
    name: "Thời trang & May mặc",
    description: "Tiệm may đo, shop thời trang thiết kế, phụ kiện và giày dép",
    terms: {
      makerTitle: "Thợ may / Kỹ thuật cắt",
      makerAction: "May đo & Lên mẫu",
      productRecipe: "Bảng định mức vải & phụ liệu",
      sampleProduct: "Mẫu thiết kế Lookbook",
      rawMaterialItem: "Vải / Phụ liệu",
      completedProductPhoto: "Ảnh sản phẩm hoàn thiện",
      printablesTitle: "Thẻ bài & Hướng dẫn giặt",
      defaultMeasurementUnits: ["cái", "bộ", "mét", "cuộn", "chiếc", "set"],
      defaultComponentRoles: [
        { key: "PRIMARY", label: "Vải chính" },
        { key: "SECONDARY", label: "Vải lót" },
        { key: "HARDWARE", label: "Khóa / Cúc / Phụ kiện kim loại" },
        { key: "ACCESSORY", label: "Nhãn mác / Bao bì" },
      ],
    },
  },

  FNB: {
    key: "FNB",
    name: "Ẩm thực & Đồ uống (F&B)",
    description: "Tiệm bánh ngọt, quán cà phê, bếp phục vụ món theo yêu cầu",
    terms: {
      makerTitle: "Đầu bếp / Barista / Thợ bánh",
      makerAction: "Chế biến & Ra món",
      productRecipe: "Công thức định lượng món",
      sampleProduct: "Mẫu món chuẩn",
      rawMaterialItem: "Nguyên liệu chế biến",
      completedProductPhoto: "Ảnh món thành phẩm",
      printablesTitle: "Menu / Thẻ cảm ơn",
      defaultMeasurementUnits: ["phần", "ly", "cái", "hộp", "gram", "ml", "set"],
      defaultComponentRoles: [
        { key: "PRIMARY", label: "Nguyên liệu chính" },
        { key: "SECONDARY", label: "Gia vị & Nước sốt" },
        { key: "TOPPING", label: "Topping / Đồ ăn kèm" },
        { key: "PACKAGING", label: "Hộp / Ly / Bao bì mang đi" },
      ],
    },
  },

  CRAFT_GIFT: {
    key: "CRAFT_GIFT",
    name: "Quà tặng & Thủ công mỹ nghệ",
    description: "Đồ thủ công handmade, gốm sứ, trang sức, nến thơm, quà lưu niệm",
    terms: {
      makerTitle: "Nghệ nhân / Thợ chế tác",
      makerAction: "Chế tác & Đóng gói",
      productRecipe: "Thành phần chế tác",
      sampleProduct: "Mẫu quà tặng chuẩn",
      rawMaterialItem: "Vật liệu thủ công",
      completedProductPhoto: "Ảnh quà tặng thành phẩm",
      printablesTitle: "Thiệp cảm ơn & Hướng dẫn bảo quản",
      defaultMeasurementUnits: ["cái", "set", "hộp", "bộ", "gam", "chiếc"],
      defaultComponentRoles: [
        { key: "PRIMARY", label: "Vật liệu cốt lõi" },
        { key: "DECOR", label: "Chi tiết trang trí" },
        { key: "SCENT", label: "Hương liệu / Màu sắc" },
        { key: "PACKAGING", label: "Hộp quà & Nơ đính" },
      ],
    },
  },

  RETAIL_GENERAL: {
    key: "RETAIL_GENERAL",
    name: "Bán lẻ & Thương mại tổng hợp",
    description: "Cửa hàng bán lẻ tổng hợp, siêu thị mini, phân phối hàng hóa",
    terms: {
      makerTitle: "Nhân viên kho / Soạn hàng",
      makerAction: "Soạn hàng & Kiểm tra",
      productRecipe: "Danh sách sản phẩm cấu thành",
      sampleProduct: "Sản phẩm mẫu",
      rawMaterialItem: "Mặt hàng / Linh kiện",
      completedProductPhoto: "Ảnh kiện hàng đóng gói",
      printablesTitle: "Phiếu xuất kho & Hóa đơn",
      defaultMeasurementUnits: ["cái", "hộp", "thùng", "bịch", "chai", "gói"],
      defaultComponentRoles: [
        { key: "PRIMARY", label: "Sản phẩm chính" },
        { key: "BUNDLED", label: "Hàng tặng kèm" },
        { key: "PACKAGING", label: "Bao bì đóng gói" },
      ],
    },
  },

  SERVICES: {
    key: "SERVICES",
    name: "Dịch vụ & Kỹ thuật",
    description: "Dịch vụ làm đẹp, bảo dưỡng, kỹ thuật, sửa chữa",
    terms: {
      makerTitle: "Kỹ thuật viên / Chuyên viên",
      makerAction: "Thực hiện dịch vụ",
      productRecipe: "Quy trình & Vật tư thực hiện",
      sampleProduct: "Mẫu kết quả dịch vụ",
      rawMaterialItem: "Vật tư tiêu hao",
      completedProductPhoto: "Ảnh nghiệm thu hoàn thành",
      printablesTitle: "Phiếu bảo hành & Lịch hẹn",
      defaultMeasurementUnits: ["lượt", "giờ", "buổi", "gói", "lần"],
      defaultComponentRoles: [
        { key: "SERVICE", label: "Nội dung dịch vụ chính" },
        { key: "CONSUMABLE", label: "Vật tư tiêu hao" },
        { key: "EQUIPMENT", label: "Dụng cụ hỗ trợ" },
      ],
    },
  },
}

/**
 * Lấy định nghĩa ngành, tự động dự phòng về FLORAL nếu không tìm thấy
 */
export function getIndustryDefinition(industryKey?: string | null): IndustryDefinition {
  if (!industryKey || !(industryKey in INDUSTRY_CATALOG)) {
    return INDUSTRY_CATALOG[DEFAULT_INDUSTRY]
  }
  return INDUSTRY_CATALOG[industryKey as IndustryKey]
}

/**
 * Lấy bộ từ điển thuật ngữ tương ứng với ngành
 */
export function getIndustryTerminology(industryKey?: string | null): IndustryTerminology {
  return getIndustryDefinition(industryKey).terms
}

/**
 * Danh sách tất cả các ngành hỗ trợ trong hệ thống
 */
export function listAllIndustries(): readonly IndustryDefinition[] {
  return Object.values(INDUSTRY_CATALOG)
}
