import { Prisma } from "@/generated/prisma/client"

import { recipientFromDeliveryAddress, type OrderRecipientVat } from "../domain/order-recipient"

/** Client hoặc giao dịch — chỉ cần bảng `order_recipients`. */
type RecipientsDb = Pick<Prisma.TransactionClient, "order_recipients">

/**
 * ADR-014 D-P2, bước P-3a (ghi kép): mỗi lần ghi `orders.delivery_address` hoặc các cột `orders.vat_*` thì ghi cùng
 * nội dung vào `order_recipients` của đơn đó. `deliveryAddress` có mặt → thay phần người nhận/địa chỉ; `vat` có mặt →
 * thay phần hoá đơn; phần không truyền giữ nguyên. Gọi ngay sau lệnh ghi đơn, trong cùng giao dịch nếu có.
 */
export async function upsertOrderRecipient(
  db: RecipientsDb,
  organizationId: string,
  orderId: string,
  change: { deliveryAddress?: unknown; vat?: OrderRecipientVat },
): Promise<void> {
  const address = "deliveryAddress" in change ? recipientFromDeliveryAddress(change.deliveryAddress) : null
  const data = {
    ...(address
      ? { ...address, address_parts: address.address_parts ? (address.address_parts as Prisma.InputJsonValue) : Prisma.DbNull }
      : {}),
    ...(change.vat ?? {}),
  }
  await db.order_recipients.upsert({
    where: { order_id_organization_id: { order_id: orderId, organization_id: organizationId } },
    create: { order_id: orderId, organization_id: organizationId, ...data },
    update: data,
  })
}
