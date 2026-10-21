import { notFound } from "@/core/http/errors"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import {
  SUBCONTRACT_TOKEN_HEADER,
  verifySubcontractBranchToken,
} from "@/modules/greeting-card/infra/subcontract-link-token"

/** Token link: header (POST từ trang) hoặc `?t=` (GET từ trang / mở link trực tiếp). */
export function readSubcontractToken(request: Request): string | null {
  return request.headers.get(SUBCONTRACT_TOKEN_HEADER) || new URL(request.url).searchParams.get("t")
}

/**
 * Cổng duy nhất của các endpoint Thẻ Gia Công công khai: token link phải được ký cho đúng
 * `(mã đơn, chi nhánh)`, đơn phải thuộc tổ chức ghi trong token và đang có phiên điều phối
 * gia công. Mọi trường hợp sai đều trả cùng một 404 — không xác nhận đơn có tồn tại.
 */
export async function loadSubcontractOrderForBranch(
  request: Request,
  orderCode: string,
  branchId: string | null | undefined,
  repo = new SubcontractOrderRepository()
) {
  const organizationId = verifySubcontractBranchToken(orderCode, branchId, readSubcontractToken(request))
  if (!organizationId) throw notFound()

  const order = await repo.findSubcontractByCode(orderCode, organizationId)
  const metadata = (order?.coordination?.metadata as Record<string, unknown> | null | undefined) ?? null
  if (!order || !metadata?.subcontract_dispatch) throw notFound()

  return order
}
