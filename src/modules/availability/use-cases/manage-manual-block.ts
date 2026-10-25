import type { IAvailabilityRepository } from "../domain/repositories/availability-repository.interface"
import { getAvailabilityRepository } from "../infra/availability-repository"
import { validationFailed } from "@/core/http/errors"

export interface ManualBlockInput {
  organizationId: string
  productId: string
  checkInDate: string
  checkOutDate: string
  note?: string | null | undefined
}

export async function createManualBlock(
  input: ManualBlockInput,
  repo: IAvailabilityRepository = getAvailabilityRepository(),
): Promise<string> {
  if (!input.checkInDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.checkInDate)) {
    throw validationFailed({ checkInDate: "Ngày bắt đầu không hợp lệ" })
  }
  if (!input.checkOutDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.checkOutDate)) {
    throw validationFailed({ checkOutDate: "Ngày kết thúc không hợp lệ" })
  }
  if (input.checkInDate >= input.checkOutDate) {
    throw validationFailed({ checkOutDate: "Ngày kết thúc phải sau ngày bắt đầu" })
  }

  return repo.createBooking({
    organizationId: input.organizationId,
    productId: input.productId,
    orderId: null, // null biểu thị admin block thủ công
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    note: input.note?.trim() || "Chặn thủ công (Bảo trì / Giữ chỗ)",
  })
}

export async function removeManualBlock(
  organizationId: string,
  blockId: string,
  repo: IAvailabilityRepository = getAvailabilityRepository(),
): Promise<boolean> {
  return repo.deleteManualBlock(organizationId, blockId)
}
