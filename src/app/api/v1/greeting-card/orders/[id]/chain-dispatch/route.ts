import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { listLinkedTelegramChatIds } from "@/modules/greeting-card/infra/telegram-linked-chats"
import { rankBranchesForOrder, startChainDispatch } from "@/modules/greeting-card/use-cases/start-chain-dispatch"

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

  const { order, recipientAddress, policy, orderLocation, matchResult } = await rankBranchesForOrder(ctx, id)
  const stateRepo = new SubcontractOrderRepository()

  const linkedChatIds = new Set(await listLinkedTelegramChatIds(ctx.organizationId))

  // Tải trạng thái điều phối của đơn hàng (nếu đã tiếp nhận hoặc đã chốt)
  const subcontractState = await stateRepo.loadSubcontractState(ctx, order.id)

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

  const result = await startChainDispatch(ctx, id, { approvedBranchIds, subcontractPriceVnd })
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic"
