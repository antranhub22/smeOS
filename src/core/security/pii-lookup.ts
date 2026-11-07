import { phoneHash, piiMasterKey } from "./pii-cipher"

/**
 * ADR-014 D-P3, bước P-5b: điều kiện Prisma tra cứu theo số điện thoại qua `*_hash` / `*_last4` thay cho so chuỗi rõ.
 * `field` là cột rõ (`phone`, `customer_phone`); cột băm/4 số cuối là `<field>_hash` / `<field>_last4`. Dòng chưa băm
 * (chưa mã hoá, production chưa đặt khoá) vẫn khớp theo cột rõ — nhánh này bỏ ở P-5c. Đặt điều kiện trong `AND: [...]`
 * hoặc làm bộ lọc quan hệ (`customer: phoneEquals(...)`) để không đè `OR` sẵn có.
 */

type Where = Record<string, unknown>

/** Đúng số (mọi cách viết: +84, dấu chấm, khoảng trắng) trong tổ chức. */
export function phoneEquals(organizationId: string, phone: string, field = "phone"): Where {
  const master = piiMasterKey()
  const hash = master ? phoneHash(master, organizationId, phone) : null
  if (!hash) return { [field]: phone }
  return { OR: [{ [`${field}_hash`]: hash }, { [`${field}_hash`]: null, [field]: phone }] }
}

/** Một trong các số. */
export function phoneIn(organizationId: string, phones: string[], field = "phone"): Where {
  const master = piiMasterKey()
  const hashes = master ? phones.map((p) => phoneHash(master, organizationId, p)).filter((h): h is string => !!h) : []
  if (hashes.length === 0) return { [field]: { in: phones } }
  return { OR: [{ [`${field}_hash`]: { in: hashes } }, { [`${field}_hash`]: null, [field]: { in: phones } }] }
}

/**
 * Ô tìm kiếm (PO D-49): đúng 4 chữ số → khớp 4 số cuối; từ 9 chữ số → đúng số; còn lại → `null` (không tìm theo số —
 * tìm theo phần giữa số điện thoại không còn).
 */
export function phoneSearch(organizationId: string, query: string, field = "phone"): Where | null {
  const digits = query.replace(/\D/g, "")
  if (digits.length === 4) {
    return { OR: [{ [`${field}_last4`]: digits }, { [`${field}_last4`]: null, [field]: { endsWith: digits } }] }
  }
  if (digits.length >= 9) return phoneEquals(organizationId, query, field)
  return null
}
