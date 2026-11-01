export interface ProductItem {
  id: string
  title: string
  price: number
  category?: string
  image_url?: string
  description?: string
  composition?: string[]
}

export interface QuotationDraftItem {
  productId?: string | null
  name: string
  qty: number
  unitPrice: number
  note?: string | null
}

export interface QuotationRecordItem {
  id?: string
  productId?: string | null
  name: string
  qty: number
  unitPrice: number
  totalPrice: number
  note?: string | null
}

export interface QuotationRecord {
  id: string
  organizationId: string
  code: string
  leadId?: string | null
  customerId?: string | null
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED"
  validUntil?: string | null
  subtotal: number
  discountAmount: number
  totalAmount: number
  terms?: string | null
  notes?: string | null
  convertedOrderId?: string | null
  createdAt: string
  updatedAt: string
  items: QuotationRecordItem[]
  lead?: { id: string; name: string; phone: string } | null
  customer?: { id: string; name: string; phone: string } | null
}

