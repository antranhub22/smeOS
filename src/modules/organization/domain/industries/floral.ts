import type { IndustryPluginContract } from "../industry-plugin-contract"

export const FLORAL_INDUSTRY: IndustryPluginContract = {
  identity: {
    key: "FLORAL",
    name: "Hoa & Cây cảnh",
    description: "Cửa hàng hoa tươi, cây cảnh, hoa sự kiện và điện hoa",
    iconName: "Flower2",
  },
  terminology: {
    makerTitle: "Thợ cắm hoa",
    makerAction: "Cắm hoa",
    productRecipe: "Công thức cành hoa",
    sampleProduct: "Mẫu hoa chuẩn",
    rawMaterialItem: "Cành/Loại hoa",
    completedProductPhoto: "Ảnh hoa hoàn thành",
    printablesTitle: "Thiệp chúc mừng",
    catalogTitle: "Kho mẫu hoa",
    createButtonLabel: "Thêm mẫu hoa",
    scanButtonLabel: "Quét ảnh hoa",
    defaultMeasurementUnits: ["cành", "bó", "chậu", "giỏ", "kệ", "nhánh", "hộp"],
    defaultComponentRoles: [
      { key: "PRIMARY", label: "Hoa chính", isRequired: true },
      { key: "SECONDARY", label: "Hoa phụ", isRequired: false },
      { key: "FOLIAGE", label: "Lá đệm", isRequired: false },
      { key: "ACCESSORY", label: "Phụ kiện / Giấy gói", isRequired: false },
    ],
  },
  taxonomy: {
    defaultCategories: [
      { key: "BOUQUET", label: "Bó hoa", defaultUnit: "bó" },
      { key: "BASKET", label: "Giỏ hoa", defaultUnit: "giỏ" },
      { key: "STAND", label: "Kệ hoa khai trương", defaultUnit: "kệ" },
      { key: "VASE", label: "Bình hoa", defaultUnit: "bình" },
      { key: "BOX", label: "Hộp hoa", defaultUnit: "hộp" },
      { key: "CONDOLENCE", label: "Hoa chia buồn", defaultUnit: "kệ" },
    ],
    occasions: [
      { key: "OPENING", label: "Khai trương hồng phát", suggestedPromotion: "Tặng kèm băng rôn thiết kế riêng" },
      { key: "BIRTHDAY", label: "Sinh nhật ý nghĩa", suggestedPromotion: "Tặng thiệp chúc mừng cao cấp" },
      { key: "LOVE", label: "Tình yêu & Kỷ niệm", suggestedPromotion: "Tặng túi xách chống va đập" },
      { key: "CONDOLENCE", label: "Kính viếng chia buồn", suggestedPromotion: "Giao hỏa tốc 60 phút" },
      { key: "WOMEN_DAY", label: "Ngày 8/3 & 20/10", suggestedPromotion: "Ưu đãi đặt sớm trước 3 ngày" },
      { key: "TEACHER_DAY", label: "Tri ân Thầy Cô 20/11", suggestedPromotion: "Chiết khấu 10% đơn số lượng lớn" },
    ],
    priceRanges: [
      { label: "Dưới 500.000 ₫", min: 0, max: 500000 },
      { label: "500.000 – 1.000.000 ₫", min: 500000, max: 1000000 },
      { label: "1.000.000 – 2.000.000 ₫", min: 1000000, max: 2000000 },
      { label: "Trên 2.000.000 ₫", min: 2000000 },
    ],
  },
  bomSpec: {
    measurementUnits: ["cành", "bó", "chậu", "giỏ", "kệ", "nhánh", "hộp"],
    componentRoles: [
      { key: "PRIMARY", label: "Hoa chính", isRequired: true },
      { key: "SECONDARY", label: "Hoa phụ", isRequired: false },
      { key: "FOLIAGE", label: "Lá đệm", isRequired: false },
      { key: "ACCESSORY", label: "Phụ kiện / Giấy gói", isRequired: false },
    ],
  },
  templates: {
    printables: [
      {
        type: "CARD",
        title: "Thiệp chúc mừng A6",
        description: "Thiệp in ấn đính kèm hoa với lời chúc mừng sinh nhật, khai trương, kỷ niệm",
        defaultFrontTitle: "Chúc Mừng Ngày Đặc Biệt",
        defaultBackInstructions: [
          "Cắt xéo gốc cành hoa 45 độ trước khi cắm",
          "Thay nước sạch mỗi ngày một lần",
          "Tránh ánh nắng trực tiếp và luồng gió quạt mạnh",
        ],
      },
      {
        type: "CARE_GUIDE",
        title: "Thẻ hướng dẫn dưỡng hoa",
        description: "Thẻ hướng dẫn khách hàng giữ hoa tươi lâu tại nhà",
        defaultFrontTitle: "Bí Quyết Giữ Hoa Tươi Lâu",
        defaultBackInstructions: [
          "Dùng gói dưỡng hoa kèm theo pha với 500ml nước sạch",
          "Phun sương nhẹ lên cánh hoa vào sáng sớm",
        ],
      },
    ],
  },
  aiConfig: {
    visionFocus: "Nhận diện độ nở cánh hoa, màu sắc chủ đạo, tỷ lệ phối hoa chính/hoa phụ và ước tính cành hoa",
    studioBackgroundStyles: ["Không gian phòng khách hiện đại", "Bàn tiệc trà chiều kiểu Pháp", "Ánh sáng tự nhiên buổi sớm"],
    marketingToneExamples: [
      "Trao gửi yêu thương tinh tế qua từng đóa hoa tươi rạng rỡ",
      "Thiết kế hoa độc bản mang dấu ấn riêng cho sự kiện đặc biệt của bạn",
    ],
    sampleProductNames: [
      "Bó hoa hồng Ohara đỏ nhung cao cấp",
      "Giỏ hoa cúc mẫu đơn kết hợp hoa tulip pastel",
      "Kệ hoa khai trương Đại Cát Đại Lợi 2 tầng",
    ],
  },
  navigation: {
    hiddenNavKeys: [],
  },
  craftFee: {
    feeLabel: "Phí cắm hoa",
    defaultPercent: 50,
    minVnd: 150_000,
    maxVnd: 2_000_000,
    partnerPercent: 75,
    complexityLabels: { EASY: "Bó nhỏ, hoa cầm tay", MEDIUM: "Giỏ, hộp, bình", HARD: "Kệ, lẵng sự kiện" },
    laborByComplexityVnd: { EASY: 80_000, MEDIUM: 150_000, HARD: 300_000 },
    peakDays: [
      { monthDay: "02-14", label: "Lễ Tình nhân" },
      { monthDay: "03-08", label: "Quốc tế Phụ nữ" },
      { monthDay: "10-20", label: "Phụ nữ Việt Nam" },
      { monthDay: "11-20", label: "Nhà giáo Việt Nam" },
    ],
  },
}
