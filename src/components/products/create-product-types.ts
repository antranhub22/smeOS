export type BomItem = {
  id: string
  name: string
  quantity: number
  unit: string
  color: string
  role: string
}

export type TerminologyGetter = (
  key:
    | "makerTitle"
    | "makerAction"
    | "productRecipe"
    | "sampleProduct"
    | "rawMaterialItem"
    | "completedProductPhoto"
    | "printablesTitle"
    | "catalogTitle"
    | "createButtonLabel"
    | "scanButtonLabel"
) => string

export function getDesignFieldsConfig(industryKey?: string) {
  switch (industryKey) {
    case "FASHION":
      return {
        cardTitle: "Kiểu dáng phom mẫu & Chất liệu",
        shapeLabel: "Kiểu dáng / Phom dáng",
        shapeOptions: [
          "Dáng suông (H-line)",
          "Dáng chữ A (A-line)",
          "Dáng ôm (Bodycon)",
          "Oversize / Rộng rãi",
          "Dáng đuôi cá (Mermaid)",
          "Tiêu chuẩn",
        ],
        facingLabel: "Mặt nhìn / Góc chụp",
        facingOptions: [
          "Chính diện (Front)",
          "Mặt sau (Back)",
          "Góc nghiêng 3/4",
          "Toàn cảnh 360°",
        ],
        containerLabel: "Chất liệu vải / Gói kèm",
        containerPlaceholder: "Ví dụ: Lụa tơ tằm, dạ tweed, kèm hộp quà thương hiệu",
      }
    case "FNB":
      return {
        cardTitle: "Quy cách phục vụ & Đóng gói",
        shapeLabel: "Quy cách phục vụ",
        shapeOptions: [
          "Tại chỗ",
          "Mang đi (Takeaway)",
          "Đóng hộp giao hàng",
          "Theo combo / Set",
        ],
        facingLabel: "Kiểu trình bày",
        facingOptions: ["Đĩa đơn", "Tô / Bát", "Set mẹt / Khay", "Ly / Cốc"],
        containerLabel: "Đóng gói / Phụ kiện",
        containerPlaceholder: "Ví dụ: Hộp giấy kraft, kèm thìa đũa sinh học",
      }
    case "FLORAL":
    default:
      return {
        cardTitle: "Kiểu dáng và hướng nhìn",
        shapeLabel: "Kiểu dáng cắm",
        shapeOptions: [
          "Tròn",
          "Tam giác",
          "Tự nhiên (phong cách Hàn Quốc)",
          "Dài, thẳng",
          "Thác nước",
          "Hình quạt",
        ],
        facingLabel: "Mặt nhìn",
        facingOptions: ["Một mặt", "Nhiều mặt (360°)", "Hai mặt"],
        containerLabel: "Vật chứa / bao bì",
        containerPlaceholder: "Ví dụ: giấy gói Hàn Quốc, giỏ mây tròn",
      }
  }
}
