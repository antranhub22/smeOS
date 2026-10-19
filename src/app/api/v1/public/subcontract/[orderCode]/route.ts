import { z } from "zod"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import {
  cancelClaimSubcontractUseCase,
  claimSubcontractUseCase,
} from "@/modules/greeting-card/use-cases/handle-subcontract-claim"
import { commitSubcontractOrder } from "@/modules/greeting-card/domain/subcontract-order"
import type { TenantContext } from "@/core/tenancy"

const actionSchema = z.object({
  action: z.enum(["CLAIM", "CANCEL", "COMMIT"]),
  branchId: z.string().min(1),
})

/**
 * GET /api/v1/public/subcontract/[orderCode]?branch=[branchId]
 * Công khai: Chi nhánh bấm vào link nhận đơn để xem Thẻ Gia Công.
 */
export const GET = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-view", limit: 120, windowMs: 60_000 })
  const { orderCode } = await context.params
  const url = new URL(request.url)
  const branchId = url.searchParams.get("branch")

  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

  // Kiểm tra chi nhánh có thuộc cùng tổ chức với đơn hàng hay không
  let branchName = ""
  if (branchId) {
    const branch = await repo.findBranchInOrganization(branchId, order.organization_id)
    if (branch) branchName = branch.name
  }

  const coordMeta = (order.coordination?.metadata as Record<string, unknown> | null) ?? {}
  const subState = coordMeta.subcontract_dispatch as Record<string, unknown> | undefined

  const pricingRef = (order.pricing_rule_ref as Record<string, unknown> | null) ?? {}
  const total = Number(order.total_vnd)
  const defaultSubcontractPrice = Math.round(total * 0.7) // 70% mặc định cho gia công nếu chưa cấu hình thù lao riêng
  const subcontractPriceVnd = typeof pricingRef.subcontract_price_vnd === "number"
    ? pricingRef.subcontract_price_vnd
    : defaultSubcontractPrice

  const firstItem = order.items[0]
  const session = order.greeting_sessions[0]
  const snapshot = (session?.product_snapshot as Record<string, unknown> | null) ?? {}

  const productName = firstItem?.description || (snapshot.name as string | undefined) || "Sản phẩm đặt gia công"
  const productImageUrl = (snapshot.image_url as string | undefined) || (snapshot.imageUrl as string | undefined) || null

  const deliveryWindow = (order.delivery_window as Record<string, unknown> | null) ?? {}
  const deliveryAddressObj = (order.delivery_address as Record<string, unknown> | null) ?? {}
  const deliveryAddress = typeof deliveryAddressObj.address === "string"
    ? deliveryAddressObj.address
    : (typeof deliveryAddressObj.full_address === "string" ? deliveryAddressObj.full_address : "Theo thỏa thuận")
  const deliveryTime = typeof deliveryWindow.timeSlot === "string" && typeof deliveryWindow.date === "string"
    ? `${deliveryWindow.timeSlot} ngày ${deliveryWindow.date}`
    : "Giao trong ngày"

  return jsonResponse({
    data: {
      orderId: order.id,
      orderCode: order.code,
      branchId: branchId ?? "",
      branchName,
      product: {
        name: productName,
        imageUrl: productImageUrl,
        bomItems: (pricingRef.bom_items as Array<{ name: string; quantity: number; unit: string }>) || [],
      },
      deliveryAddress,
      deliveryTime,
      cardMessage: order.card_message ?? null,
      specialNotes: order.internal_note ?? null,
      subcontractPriceVnd,
      dispatchStatus: subState?.dispatchStatus ?? "OPEN",
      claimedByBranchId: subState?.claimedBranchId ?? null,
      claimedBranchName: subState?.claimedBranchName ?? null,
      graceExpiresAt: subState?.graceExpiresAt ?? null,
    },
  })
})

/**
 * POST /api/v1/public/subcontract/[orderCode]
 * Thao tác trên Thẻ Gia Công: TIẾP NHẬN, HỦY TRONG HẠN, hoặc XÁC NHẬN LÀM NGAY.
 */
export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-action", limit: 30, windowMs: 60_000 })
  const { orderCode } = await context.params

  const body = await request.json().catch(() => ({}))
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { action, branchId } = parsed.data
  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

  // Xác thực chi nhánh hợp lệ thuộc tổ chức
  const branch = await repo.findBranchInOrganization(branchId, order.organization_id)
  if (!branch) {
    throw unprocessable("Chi nhánh không hợp lệ hoặc không thuộc hệ thống.")
  }

  const org = await repo.findOrganizationSettings(order.organization_id)

  const ctx: TenantContext = {
    organizationId: order.organization_id,
    workspaceId: "default",
    userId: `branch_${branch.id}`,
    branchId: branch.id,
    capabilities: new Set(),
  }

  const notifier = new MultiChannelDispatchNotifier()

  if (action === "CLAIM") {
    const result = await claimSubcontractUseCase(
      ctx,
      {
        orderId: order.id,
        branchId: branch.id,
        branchName: branch.name,
        shopSettings: org?.settings,
      },
      repo,
      notifier,
      [{
        branchId: branch.id,
        branchName: branch.name,
        qualityScore: 100,
        activeJobsCount: 0,
        maxConcurrentJobs: 10,
        isActive: true,
      }]
    )
    return jsonResponse({ data: result })
  }

  if (action === "CANCEL") {
    const result = await cancelClaimSubcontractUseCase(
      ctx,
      { orderId: order.id, branchId: branch.id },
      repo
    )
    return jsonResponse({ data: result })
  }

  if (action === "COMMIT") {
    const currentState = await repo.loadSubcontractState(ctx, order.id)
    if (!currentState || currentState.claimedBranchId !== branch.id) {
      throw unprocessable("Không thể chốt đơn khi bạn chưa tiếp nhận.")
    }
    const nextState = commitSubcontractOrder(currentState)
    await repo.saveSubcontractState(ctx, nextState)
    return jsonResponse({ data: { success: true, dispatchStatus: nextState.dispatchStatus } })
  }

  throw unprocessable("Hành động không hợp lệ.")
})

export const dynamic = "force-dynamic"
