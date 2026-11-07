/**
 * ADR-014 D-P2, bước P-3a: cột của `order_recipients` suy từ JSON `orders.delivery_address`. Đơn có nhiều dạng
 * (Thẻ chào: `{ recipientName, phone, street, parts, zone, notes, mapUrl }`; đơn nhập tay: `{ recipientName, phone,
 * street, ward, district, province }`; dữ liệu cũ: chuỗi, `{ name }`, `{ full_address }`…) — thứ tự ưu tiên theo
 * `extractRecipientInfo` và `formatDeliveryAddress`. Khối backfill của migration `*_order_recipients` làm đúng như hàm
 * này (`tests/tenant/order-recipients.test.ts` so hai bên trên cùng bộ dữ liệu). Pure TypeScript.
 */

export interface OrderRecipientAddress {
  recipient_name: string | null
  recipient_phone: string | null
  address_line: string | null
  address_parts: Record<string, unknown> | null
}

export interface OrderRecipientVat {
  vat_company_name: string | null
  vat_tax_code: string | null
  vat_company_address: string | null
  vat_email: string | null
}

const WS = /^[ \t\r\n]+|[ \t\r\n]+$/g

function str(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key]
  if (typeof v !== "string") return null
  const t = v.replace(WS, "")
  return t || null
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

/** "45 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh" — như `composeAddress`, chỉ lấy ô là chuỗi. */
function composeParts(parts: Record<string, unknown>): string | null {
  const head = [str(parts, "houseNumber"), str(parts, "street")].filter(Boolean).join(" ")
  return [head, str(parts, "ward"), str(parts, "district"), str(parts, "province")].filter(Boolean).join(", ") || null
}

export function recipientFromDeliveryAddress(raw: unknown): OrderRecipientAddress {
  if (typeof raw === "string") {
    const line = raw.replace(WS, "")
    return { recipient_name: null, recipient_phone: null, address_line: line || null, address_parts: null }
  }
  if (!isObject(raw)) return { recipient_name: null, recipient_phone: null, address_line: null, address_parts: null }

  const parts = isObject(raw.parts) ? raw.parts : null
  const flat = Object.fromEntries(
    (["ward", "district", "province"] as const).map((k) => [k, str(raw, k)]).filter(([, v]) => v !== null),
  )
  return {
    recipient_name: str(raw, "recipientName") ?? str(raw, "name"),
    recipient_phone: str(raw, "phone") ?? str(raw, "recipientPhone"),
    address_line: str(raw, "street") ?? str(raw, "full_address") ?? str(raw, "fullAddress") ?? str(raw, "address")
      ?? (parts ? composeParts(parts) : null),
    address_parts: parts ?? (Object.keys(flat).length > 0 ? flat : null),
  }
}
