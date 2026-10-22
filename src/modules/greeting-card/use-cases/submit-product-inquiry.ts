import { AppError, notFound, validationFailed } from "@/core/http/errors"
import {
  inquiryContent,
  inquiryTitle,
  normalizeInquiryPhone,
  validateProductInquiry,
  type ProductInquiryInput,
} from "@/modules/crm/domain/product-inquiry"
import { ProductInquiryRepository } from "@/modules/crm/infra/product-inquiry-repository"
import { GreetingCardRepository } from "../infra/greeting-card-repository"
import { BrochureCheckoutRepository } from "../infra/brochure-checkout-repository"

export const INQUIRY_PHONE_LIMIT = 5
const INQUIRY_WINDOW_MS = 60 * 60_000

export interface PublicProductInquiryInput extends ProductInquiryInput {
  productId: string
}

/**
 * Khách gửi yêu cầu tư vấn từ link bộ sưu tập công khai. Tổ chức suy từ bộ sưu tập (không nhận
 * từ client); mẫu phải thuộc bộ sưu tập đó, sai → 404. Mỗi SĐT tối đa 5 yêu cầu/giờ mỗi tiệm.
 */
export async function submitProductInquiry(
  catalogId: string,
  input: PublicProductInquiryInput,
  repo = new GreetingCardRepository(),
  checkout = new BrochureCheckoutRepository(),
  inquiries = new ProductInquiryRepository(),
): Promise<{ conversationId: string }> {
  const errors = validateProductInquiry(input)
  if (Object.keys(errors).length > 0) throw validationFailed(errors)

  const catalog = await repo.getPublicCatalogById(catalogId)
  if (!catalog) throw notFound()
  const item = catalog.items.find((i) => i.product.id === input.productId)
  if (!item) throw notFound()
  const organizationId = catalog.organization_id
  const phone = normalizeInquiryPhone(input.customerPhone)

  const recent = await inquiries.countRecentByPhone(organizationId, phone, new Date(Date.now() - INQUIRY_WINDOW_MS))
  if (recent >= INQUIRY_PHONE_LIMIT) {
    throw new AppError("RATE_LIMITED", "Bạn đã gửi nhiều yêu cầu, cửa hàng sẽ liên hệ sớm. Vui lòng thử lại sau ít phút.")
  }

  const customerId = await checkout.findOrCreateCustomer({
    organizationId,
    customerPhone: phone,
    customerName: input.customerName.trim(),
    deliveryAddress: "",
  })
  const product = { id: item.product.id, code: item.product.code, name: item.product.name }
  return inquiries.create({
    organizationId,
    customerId,
    title: inquiryTitle(product),
    content: inquiryContent(product, input),
    metadata: {
      kind: "PRODUCT_INQUIRY",
      catalogId,
      productId: product.id,
      productCode: product.code,
      variantName: input.variantName?.trim().slice(0, 120) || null,
    },
  })
}
