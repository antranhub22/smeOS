import { z } from "zod"
import { conflict, validationFailed, notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { matchCandidateBranches } from "@/modules/greeting-card/domain/chain-dispatch-engine"
import { parseChainDispatchPolicy, renderDispatchMessage } from "@/modules/greeting-card/domain/chain-dispatch-policy"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { ChainBranchRepository } from "@/modules/greeting-card/infra/chain-branch-repository"
import { publicAppUrl } from "@/lib/public-url"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import type { InviteCardRef, SubcontractOrderState } from "@/modules/greeting-card/domain/subcontract-order"
import { CLAIM_BUTTON_TEXT, closeCardsAfterClaim, inviteCardText, rememberInviteCard } from "@/modules/greeting-card/use-cases/invite-cards"
import { deliveryAreaOf, formatDeliveryAddress, hasDeliveryAddress } from "@/modules/greeting-card/domain/delivery-address"
import { GoongGeocoder } from "@/modules/greeting-card/adapters/goong-geocoder"
import { resolveDeliveryLocation } from "@/modules/greeting-card/use-cases/resolve-geo-location"
import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { subcontractBranchUrl } from "@/modules/greeting-card/infra/subcontract-link-token"
import { CraftFeeFactsRepository } from "@/modules/greeting-card/infra/craft-fee-facts-repository"
import { resolveDispatchCraftFee, suggestCraftFee } from "@/modules/greeting-card/use-cases/suggest-craft-fee"
import { listLinkedTelegramChatIds } from "@/modules/greeting-card/infra/telegram-linked-chats"

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

  // Toạ độ địa chỉ giao (Goong, có đệm theo địa chỉ) — không xác định được thì xếp hạng không theo khoảng cách
  const stateRepo = new SubcontractOrderRepository()
  const orderLocation = hasDeliveryAddress(recipientAddress)
    ? await resolveDeliveryLocation(ctx, { orderId: order.id, address: recipientAddress }, new GoongGeocoder(), stateRepo)
    : null

  // Chạy Matching Engine — tính điểm khoảng cách / chất lượng / tải đơn, lọc bán kính khi có toạ độ
  const matchResult = matchCandidateBranches(orderLocation, branches, policy, {
    excludedBranchIds: [],
    round: 1,
    // Không có toạ độ (chưa cấu hình Goong, chi nhánh chưa có GPS…) → sàng lọc theo phường / quận / tỉnh
    orderArea: deliveryAreaOf(order.delivery_address),
  })

  const linkedChatIds = new Set(await listLinkedTelegramChatIds(ctx.organizationId))

  // Tải trạng thái điều phối của đơn hàng (nếu đã tiếp nhận hoặc đã chốt)
  const subcontractState = await stateRepo.loadSubcontractState(ctx, order.id)
  const suggestion = await suggestCraftFee(ctx.organizationId, order.id, new CraftFeeFactsRepository())

  return jsonResponse({
    data: {
      orderCode: order.code,
      deliveryAddress: recipientAddress,
      deliveryLocationResolved: Boolean(orderLocation),
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
        distanceKm: sc.distanceKm,
        areaMatch: sc.areaMatch,
        qualityScore: sc.branch.qualityScore,
        activeJobsCount: sc.branch.activeJobsCount,
        totalScore: sc.totalScore,
        rank: sc.rank,
        channels: {
          hasTelegram: Boolean(sc.branch.channels?.telegramChatId),
          // Bot chung chỉ gửi tới chat đã nhắn mã liên kết của tổ chức — báo trước khi phát lệnh
          telegramLinked: Boolean(sc.branch.channels?.telegramChatId && linkedChatIds.has(sc.branch.channels.telegramChatId)),
          hasZalo: Boolean(sc.branch.channels?.zaloUserId),
          phone: sc.branch.channels?.phone,
        },
      })),
      craftFee: {
        feeLabel: suggestion.feeLabel,
        suggestedVnd: suggestion.suggestedVnd,
        lines: suggestion.lines,
        adjustPercent: suggestion.adjustPercent,
        finalVnd: subcontractState?.craftFee?.finalVnd ?? subcontractState?.subcontractPriceVnd ?? null,
      },
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

  // Phí theo phương án tiệm đã cài (mặc định 50% giá hàng trước VAT, có sàn/trần) — PO 22/10/2026
  const suggestion = await suggestCraftFee(ctx.organizationId, order.id, new CraftFeeFactsRepository())
  const craftFeeRecord = resolveDispatchCraftFee(suggestion, subcontractPriceVnd, {
    canApproveOutsideBand: hasCapability(ctx, GREETING_CARD_CAPABILITY.paymentRecord),
    actorId: ctx.userId,
  })
  const craftFee = craftFeeRecord.finalVnd

  // Link có chữ ký gửi cho chi nhánh luôn dùng địa chỉ cấu hình — header Host do client gửi từng đưa
  // token sang tên miền tuỳ ý (rà soát cụm G, 22/10/2026)
  const claimBaseUrl = publicAppUrl()

  // Khởi tạo Subcontract state
  const notifier = new MultiChannelDispatchNotifier()

  if (order.status === "CANCELLED" || order.status === "COMPLETED") throw conflict("Đơn hàng đã huỷ hoặc đã hoàn tất.")
  const roundExpiry = new Date(Date.now() + policy.claimTimeoutMinutes * 60 * 1000).toISOString()
  // Mở vòng mời mới dưới khoá dòng. Đơn đã có chi nhánh nhận/chốt thì không mở lại — "Gửi lại" trước
  // 22/10/2026 xoá mất chi nhánh đang làm đơn (rà soát cụm G). Chi nhánh đã từ chối không được mời lại.
  const subcontractState = await stateRepo.updateSubcontractState(ctx, order.id, (current) => {
    if (current && (current.dispatchStatus === "CLAIMED_GRACE" || current.dispatchStatus === "COMMITTED")) {
      throw conflict("Đơn đã có chi nhánh nhận. Huỷ nhận của chi nhánh đó trước khi mời lại.")
    }
    const declined = current?.declinedBranchIds ?? []
    const invited = approvedBranches.map((b) => b.branchId).filter((id) => !declined.includes(id))
    if (invited.length === 0) throw validationFailed({ approvedBranchIds: "Các chi nhánh đã chọn đều đã từ chối đơn này" })
    const next: SubcontractOrderState = {
      ...(current ?? {}),
      orderId: order.id,
      orderCode: order.code,
      dispatchStatus: "OPEN",
      currentRound: (current?.currentRound ?? 0) + 1,
      claimedBranchId: null,
      claimedBranchName: null,
      claimedAt: null,
      graceExpiresAt: null,
      declinedBranchIds: declined,
      invitedBranchIds: invited,
      roundExpiresAt: roundExpiry,
      subcontractPriceVnd: craftFee,
      craftFee: craftFeeRecord,
    }
    return { next, result: next }
  })
  const invitedBranches = approvedBranches.filter((b) => subcontractState.invitedBranchIds.includes(b.branchId))

  // Đồng bộ giá gia công vào pricing_rule_ref của đơn hàng để làm SSOT xuyên suốt
  const existingPricingRef = (order.pricing_rule_ref as Record<string, unknown> | null) ?? {}
  await stateRepo.updatePricingRef(ctx.organizationId, order.id, { ...existingPricingRef, subcontract_price_vnd: craftFee })

  // Phát lệnh gửi tin nhắn riêng 1:1 cho từng chi nhánh được duyệt
  const inviteCards: Record<string, InviteCardRef> = {}
  const results: Array<{ branchId: string; branchName: string; sent: boolean; channel: string; error?: string }> = []

  for (const branch of invitedBranches) {
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

    const title = `🌸 [ĐƠN GIA CÔNG #${order.code}]`
    const sendResult = await notifier.sendSubcontractInvite(ctx, {
      branch,
      orderCode: order.code,
      messageText,
      claimUrl,
      title,
      actions: [{ text: CLAIM_BUTTON_TEXT, url: claimUrl }],
      imageUrl: sampleImageUrl,
    })

    rememberInviteCard(inviteCards, branch.branchId, sendResult, inviteCardText(title, messageText), claimUrl)

    // Không có Telegram / Zalo: lời mời vẫn hiện trên trang cửa hàng (/cua-hang) của chi nhánh
    const channel = branch.channels?.telegramChatId ? "TELEGRAM"
      : branch.channels?.zaloUserId ? "ZALO"
      : "APP"

    results.push({
      branchId: branch.branchId,
      branchName: branch.branchName,
      sent: sendResult.sent,
      channel,
      ...(sendResult.error ? { error: sendResult.error } : {}),
    })
  }

  // Lưu thẻ mời riêng từng chi nhánh — để sửa thẻ khi có chi nhánh nhận / huỷ (không còn ghi đè bằng thẻ cuối)
  // Chi nhánh có thể đã bấm nhận trong lúc đang gửi: gộp vào state mới nhất, không đè trạng thái đã nhận
  if (Object.keys(inviteCards).length > 0) {
    const merged = await stateRepo.updateSubcontractState(ctx, order.id, (latest) => {
      const next = { ...(latest ?? subcontractState), inviteCards: { ...latest?.inviteCards, ...inviteCards } }
      return { next, result: next }
    })
    if (merged.claimedBranchId) await closeCardsAfterClaim(ctx, merged, merged.claimedBranchId, notifier)
  }

  const sentCount = results.filter((r) => r.sent).length

  return jsonResponse({
    data: {
      dispatched: sentCount > 0,
      orderCode: order.code,
      sentCount,
      totalTargeted: invitedBranches.length,
      results,
      claimUrl: `${claimBaseUrl}/subcontract/${order.code}`,
    },
  })
})

export const dynamic = "force-dynamic"
