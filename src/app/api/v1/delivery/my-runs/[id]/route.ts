/** `POST /api/v1/delivery/my-runs/:id` (R18) — shipper báo đã lấy hàng, đang giao, giao xong (kèm ảnh) hoặc thất bại. */

import { z } from "zod"

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { reportShipperRun } from "@/modules/coordinator/use-cases/shipper-runs"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

const bodySchema = z.object({
  event: z.enum(["PICKED_UP", "ON_THE_WAY", "DELIVERED_SUCCESS", "DELIVERY_FAILED"]),
  podAssetId: z.string().uuid().optional(),
  recipientSignedName: z.string().max(200).optional(),
  failureReason: z.string().max(500).optional(),
})

export const POST = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R18")
  const { id } = await params
  return jsonResponse(await reportShipperRun(ctx, id, bodySchema.parse(await request.json())))
})
