/**
 * industry-plugin-contract.ts — Hợp đồng Đặc tả Ngành SSOT (Industry Plugin Contract)
 *
 * Tiêu chuẩn kiến trúc cấp doanh nghiệp: Mọi ngành muốn vận hành trên smeOS
 * đều bắt buộc phải triển khai đầy đủ 6 khối thành phần chuẩn mực.
 *
 * Zero architectural leaks: Domain thuần, không import Prisma, không phụ thuộc client.
 */

export interface IndustryIdentity {
  readonly key: string
  readonly name: string
  readonly description: string
  readonly iconName: string
}

export interface IndustryTerminology {
  readonly makerTitle: string              // Tên vai trò người sản xuất (Thợ hoa, Thợ may, Đầu bếp...)
  readonly makerAction: string             // Hành động chế tác (Cắm hoa, May đo, Chế biến...)
  readonly productRecipe: string           // Tên công thức (Công thức cành, Bảng định mức vải, Định lượng món...)
  readonly sampleProduct: string           // Tên mẫu sản phẩm (Mẫu hoa, Mẫu thiết kế, Món ăn chuẩn...)
  readonly rawMaterialItem: string         // Tên đơn vị nguyên liệu (Cành hoa, Vải/Phụ liệu, Nguyên liệu...)
  readonly completedProductPhoto: string   // Tên ảnh thành phẩm (Ảnh hoa hoàn thành, Ảnh trang phục, Ảnh món ra đĩa...)
  readonly printablesTitle: string         // Tên thẻ đính kèm (Thiệp chúc mừng, Thẻ bài & HD giặt, Menu để bàn...)
  readonly catalogTitle: string            // Tên danh mục tổng (Kho mẫu hoa, Bộ sưu tập Lookbook, Thực đơn món...)
  readonly createButtonLabel: string       // Nút tạo mới (Thêm mẫu hoa, Thêm mẫu thiết kế, Thêm món mới...)
  readonly scanButtonLabel: string         // Nút quét ảnh (Quét ảnh hoa, Quét mẫu trang phục, Quét ảnh món...)
  readonly defaultMeasurementUnits: readonly string[]
  readonly defaultComponentRoles: readonly { readonly key: string; readonly label: string; readonly isRequired?: boolean }[]
}

export interface IndustryTaxonomyCategory {
  readonly key: string
  readonly label: string
  readonly defaultUnit: string
  readonly iconName?: string
}

export interface IndustryTaxonomyOccasion {
  readonly key: string
  readonly label: string
  readonly suggestedPromotion?: string
}

export interface IndustryTaxonomy {
  readonly defaultCategories: readonly IndustryTaxonomyCategory[]
  readonly occasions: readonly IndustryTaxonomyOccasion[]
  readonly priceRanges: readonly { readonly label: string; readonly min: number; readonly max?: number }[]
}

export interface IndustryBomSpec {
  readonly measurementUnits: readonly string[]
  readonly componentRoles: readonly { readonly key: string; readonly label: string; readonly isRequired: boolean }[]
}

export interface IndustryPrintableTemplate {
  readonly type: "TAG" | "CARD" | "MENU" | "WARRANTY" | "CARE_GUIDE" | "DISPATCH"
  readonly title: string
  readonly description: string
  readonly defaultFrontTitle: string
  readonly defaultBackInstructions: readonly string[]
}

export interface IndustryTemplatesSpec {
  readonly printables: readonly IndustryPrintableTemplate[]
}

export interface IndustryAiConfig {
  readonly visionFocus: string
  readonly studioBackgroundStyles: readonly string[]
  readonly marketingToneExamples: readonly string[]
  readonly sampleProductNames: readonly string[]
}

export interface IndustryPluginContract {
  readonly identity: IndustryIdentity
  readonly terminology: IndustryTerminology
  readonly taxonomy: IndustryTaxonomy
  readonly bomSpec: IndustryBomSpec
  readonly templates: IndustryTemplatesSpec
  readonly aiConfig: IndustryAiConfig
}
