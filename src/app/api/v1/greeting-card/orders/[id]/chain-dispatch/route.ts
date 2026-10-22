import { z } from "zod"
import { validationFailed, notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { matchCandidateBranches } from "@/modules/greeting-card/domain/chain-dispatch-engine"
import { parseChainDispatchPolicy, renderDispatchMessage } from "@/modules/greeting-card/domain/chain-dispatch-policy"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { ChainBranchRepository } from "@/modules/greeting-card/infra/chain-branch-repository"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import type { SubcontractOrderState } from "@/modules/greeting-card/domain/subcontract-order"
import { formatDeliveryAddress } from "@/modules/greeting-card/domain/delivery-address"
import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { subcontractBranchUrl } from "@/modules/greeting-card/infra/subcontract-link-token"

type RouteCtx = { params: Promise<{ id: string }> }

const dispatchSchema = z.object({
  /**
   * Danh sách branchId đã được Điều hành DUYỆT để phát lệnh.
   * Bắt buộc từ 1–10 chi nhánh.
   */
  approvedBranchIds: z.array(z.string().min(1)).min(1).max(10),
  subcontractPriceVnd: z.number().int().min(0).optional(),
})

/**
 * GET /api/v1/greeting-card/orders/[id]/chain-dispatch
 * Trả về danh sách chi nhánh đã sàng lọc, xếp hạng tự động theo địa chỉ giao hàng của đơn.
 */
export const GET = handle<[RouteCtx]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.assignFlorist)

  const { id } = await context.params

  // Lấy thông tin đơn hàng từ bảng orders
  const order = await new SubcontractOrderRepository().findOrderForChainDispatch(ctx.organizationId, id)
  if (!order) throw notFound()

  const recipientAddress = formatDeliveryAddress(order.delivery_address)

  // Lấy cấu hình Policy điều phối chuỗi
  const shop = await new OrganizationRepository().current(ctx)
  const policy = parseChainDispatchPolicy(shop?.settings as Record<string, unknown> | null | undefined)

  const branches = await new ChainBranchRepository().listCandidates(ctx.organizationId)

  // Chạy Matching Engine — tính điểm, xếp hạng (orderLocation = null nếu chưa geocode)
  const matchResult = matchCandidateBranches(null, branches, policy, {
    excludedBranchIds: [],
    round: 1,
  })

  // Tải trạng thái điều phối của đơn hàng (nếu đã tiếp nhận hoặc đã chốt)
  const stateRepo = new SubcontractOrderRepository()
  const subcontractState = await stateRepo.loadSubcontractState(ctx, order.id)

  return jsonResponse({
    data: {
      orderCode: order.code,
      deliveryAddress: recipientAddress,
      dispatchState: subcontractState
        ? {
            status: subcontractState.dispatchStatus,
            claimedBranchId: subcontractState.claimedBranchId,
            claimedBranchName: subcontractState.claimedBranchName,
            claimedAt: subcontractState.claimedAt,
            graceExpiresAt: subcontractState.graceExpiresAt,
            remindersSent: subcontractState.remindersSent,
          }
        : null,
      topBranches: matchResult.topCandidates.map((sc) => ({
        branchId: sc.branch.branchId,
        branchName: sc.branch.branchName,
        distanceKm: sc.distanceKm ?? 0,
        qualityScore: sc.branch.qualityScore,
        activeJobsCount: sc.branch.activeJobsCount,
        totalScore: sc.totalScore,
        rank: sc.rank,
        channels: {
          hasTelegram: Boolean(sc.branch.channels?.telegramChatId),
          hasZalo: Boolean(sc.branch.channels?.zaloPhone),
          phone: sc.branch.channels?.phone,
        },
      })),
      policy: {
        topN: policy.topN,
        claimWindowMinutes: policy.claimTimeoutMinutes,
      },
    },
  })
})

/**
 * POST /api/v1/greeting-card/orders/[id]/chain-dispatch
 * Điều hành duyệt danh sách chi nhánh → hệ thống phát lệnh gửi tin nhắn riêng 1:1 cho từng chi nhánh.
 */
export const POST = handle<[RouteCtx]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.assignFlorist)

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const parsed = dispatchSchema.safeParse(body)
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const { approvedBranchIds, subcontractPriceVnd } = parsed.data

  // Lấy thông tin đơn hàng
  const stateRepo = new SubcontractOrderRepository()
  const order = await stateRepo.findOrderForChainDispatch(ctx.organizationId, id)
  if (!order) throw notFound()

  const recipientAddress = formatDeliveryAddress(order.delivery_address)

  const deliveryWindow = (order.delivery_window as Record<string, unknown> | null) ?? {}
  const deliveryTime = typeof deliveryWindow.timeSlot === "string" && typeof deliveryWindow.date === "string"
    ? `${deliveryWindow.timeSlot} ngày ${deliveryWindow.date}`
    : "Giao trong ngày"

  // Lấy danh sách chi nhánh đã được duyệt
  const shop = await new OrganizationRepository().current(ctx)
  const policy = parseChainDispatchPolicy(shop?.settings as Record<string, unknown> | null | undefined)
  const allBranches = await new ChainBranchRepository().listCandidates(ctx.organizationId)

  // Lọc ra các chi nhánh được duyệt
  const approvedBranches = allBranches.filter((b) => approvedBranchIds.includes(b.branchId))
  if (approvedBranches.length === 0) throw validationFailed({ approvedBranchIds: "Không tìm thấy chi nhánh hợp lệ trong danh sách" })

  const total = Number(order.total_vnd)
  const craftFee = subcontractPriceVnd ?? Math.round(total * 0.5)

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
  const claimBaseUrl = host
    ? `${proto}://${host}`
    : process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3200"

  // Khởi tạo Subcontract state
  const notifier = new MultiChannelDispatchNotifier()

  const roundExpiry = new Date(Date.now() + policy.claimTimeoutMinutes * 60 * 1000).toISOString()
  const subcontractState: SubcontractOrderState = {
    orderId: order.id,
    orderCode: order.code,
    dispatchStatus: "OPEN",
    currentRound: 1,
    claimedBranchId: null,
    claimedBranchName: null,
    claimedAt: null,
    graceExpiresAt: null,
    declinedBranchIds: [],
    invitedBranchIds: approvedBranches.map((b) => b.branchId),
    roundExpiresAt: roundExpiry,
    subcontractPriceVnd: craftFee,
  }
  await stateRepo.saveSubcontractState(ctx, subcontractState)

  // Đồng bộ giá gia công vào pricing_rule_ref của đơn hàng để làm SSOT xuyên suốt
  const existingPricingRef = (order.pricing_rule_ref as Record<string, unknown> | null) ?? {}
  await stateRepo.updatePricingRef(ctx.organizationId, order.id, { ...existingPricingRef, subcontract_price_vnd: craftFee })

  // Phát lệnh gửi tin nhắn riêng 1:1 cho từng chi nhánh được duyệt
  const results: Array<{ branchId: string; branchName: string; sent: boolean; channel: string; error?: string }> = []

  for (const branch of approvedBranches) {
    const claimUrl = subcontractBranchUrl({
      baseUrl: claimBaseUrl,
      organizationId: ctx.organizationId,
      orderCode: order.code,
      branchId: branch.branchId,
    })
    const messageText = renderDispatchMessage(policy.messageTemplates.inviteSubcontract, {
      orderCode: order.code,
      deliveryAddress: recipientAddress,
      deliveryTime,
      subcontractPriceVnd: craftFee.toLocaleString("vi-VN") + " đ",
      claimUrl,
      timeoutMinutes: policy.claimTimeoutMinutes,
      branchName: branch.branchName,
    })

    const { resolveSubcontractSamplePhoto } = await import("@/modules/greeting-card/use-cases/resolve-subcontract-sample-photo")
    const sampleImageUrl = await resolveSubcontractSamplePhoto(order, { baseUrl: claimBaseUrl })

    const sendResult = await notifier.sendSubcontractInvite(ctx, {
      branch,
      orderCode: order.code,
      messageText,
      claimUrl,
      title: `🌸 [ĐƠN GIA CÔNG #${order.code}]`,
      actions: [{ text: "👉 Nhận đơn ngay", url: claimUrl }],
      imageUrl: sampleImageUrl,
    })

    if (sendResult.sent && sendResult.telegramMsgId) {
      subcontractState.telegramMsgId = sendResult.telegramMsgId
      subcontractState.telegramChatId = sendResult.telegramChatId ?? null
      subcontractState.isCaption = sendResult.isCaption ?? false
      await stateRepo.saveSubcontractState(ctx, subcontractState)
    }

    const channel = branch.channels?.telegramChatId ? "TELEGRAM"
      : branch.channels?.zaloPhone ? "ZALO"
      : "SMS"

    results.push({
      branchId: branch.branchId,
      branchName: branch.branchName,
      sent: sendResult.sent,
      channel,
      ...(sendResult.error ? { error: sendResult.error } : {}),
    })
  }

  const sentCount = results.filter((r) => r.sent).length

  return jsonResponse({
    data: {
      dispatched: sentCount > 0,
      orderCode: order.code,
      sentCount,
      totalTargeted: approvedBranches.length,
      results,
      claimUrl: `${claimBaseUrl}/subcontract/${order.code}`,
    },
  })
})

export const dynamic = "force-dynamic"
