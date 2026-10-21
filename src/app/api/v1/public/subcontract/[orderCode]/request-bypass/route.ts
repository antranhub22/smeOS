/**
 * request-bypass/route.ts
 *
 * POST /api/v1/public/subcontract/[orderCode]/request-bypass
 *
 * Cửa hàng xin bỏ qua bằng chứng (QC, Shipper, POD) vì lý do bất khả kháng.
 * Gửi thông báo đến Điều phối viên qua Telegram/Zalo và tạo pending request trên Thẻ Điều phối.
 */

import { z } from "zod"
import { unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { loadSubcontractOrderForBranch } from "@/modules/greeting-card/use-cases/authorize-subcontract-branch"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import type { TenantContext } from "@/core/tenancy"

const requestBypassSchema = z.object({
  branchId: z.string().min(1),
  step: z.enum(["QC", "SHIPPER", "POD"]),
  reason: z.string().trim().min(5, "Lý do xin bỏ qua tối thiểu 5 ký tự").max(300),
})

export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-bypass-request", limit: 20, windowMs: 60_000 })
  const { orderCode } = await context.params

  const body = await request.json().catch(() => ({}))
  const parsed = requestBypassSchema.safeParse(body)
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const { branchId, step, reason } = parsed.data
  const repo = new SubcontractOrderRepository()
  const order = await loadSubcontractOrderForBranch(request, orderCode, branchId, repo)

  const branch = await repo.findBranchInOrganization(branchId, order.organization_id)
  if (!branch) throw unprocessable("Chi nhánh không hợp lệ hoặc không thuộc hệ thống.")

  const coord = await prisma.order_coordinations.findUnique({
    where: { order_id: order.id },
  })
  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
  const bypassRequests = (existingMeta.bypass_requests as Record<string, unknown> | undefined) ?? {}

  const nowIso = new Date().toISOString()
  const updatedBypassRequests = {
    ...bypassRequests,
    [step]: {
      requestedAt: nowIso,
      requestedByBranchId: branch.id,
      requestedByBranchName: branch.name,
      reason,
      status: "PENDING",
      decisionAt: null,
      decidedBy: null,
    },
  }

  await prisma.order_coordinations.update({
    where: { order_id: order.id },
    data: {
      metadata: {
        ...existingMeta,
        bypass_requests: updatedBypassRequests,
      } as unknown as Prisma.InputJsonValue,
    },
  })

  // Bắn thông báo khẩn cấp cho Điều phối qua Telegram
  const org = await repo.findOrganizationSettings(order.organization_id)
  const settings = (org?.settings as Record<string, unknown> | null) ?? {}
  const coordChannel = settings.coordinator_channel as { telegramChatId?: string; phone?: string } | undefined
  const chainBranches = (settings.chain_branches as Array<{ channels?: { telegramChatId?: string; phone?: string } }>) || []
  const branchWithTelegram = chainBranches.find((b) => b.channels?.telegramChatId)

  const targetChatId =
    coordChannel?.telegramChatId ||
    process.env.TELEGRAM_COORDINATOR_CHAT_ID ||
    branchWithTelegram?.channels?.telegramChatId ||
    process.env.TELEGRAM_DEFAULT_CHAT_ID

  if (targetChatId) {
    const notifier = new MultiChannelDispatchNotifier()
    const ctx: TenantContext = {
      organizationId: order.organization_id,
      workspaceId: "default",
      userId: `branch_${branch.id}`,
      branchId: branch.id,
      capabilities: new Set(),
    }

    const stepLabel = step === "QC" ? "Ảnh thành phẩm (QC)" : step === "SHIPPER" ? "Thông tin Shipper" : "Bằng chứng giao hàng (POD)"
    const alertMsg = `⚠️ [XIN BỎ QUA BẰNG CHỨNG - CẦN DUYỆT]\nĐơn hàng: #${order.code}\nChi nhánh: ${branch.name}\nCông đoạn: ${stepLabel}\nLý do: "${reason}"\n\n👉 Điều phối vui lòng kiểm tra và duyệt trong Tab Quản lý / Điều phối để đơn hàng tiếp tục được thực hiện.`

    await notifier.sendSubcontractInvite(ctx, {
      branch: {
        branchId: "coordinator",
        branchName: "Điều Phối Chuỗi",
        qualityScore: 100,
        activeJobsCount: 0,
        maxConcurrentJobs: 1,
        isActive: true,
        channels: {
          telegramChatId: targetChatId,
          phone: coordChannel?.phone || branchWithTelegram?.channels?.phone,
        },
      },
      orderCode: order.code,
      title: `⚠️ [XIN BỎ QUA BẰNG CHỨNG #${order.code}]`,
      messageText: alertMsg,
      claimUrl: `${request.headers.get("origin") || ""}/the-chao`,
    }).catch(() => {})
  }

  return jsonResponse({
    data: {
      success: true,
      message: "Yêu cầu bỏ qua bằng chứng đã được gửi đến Điều phối viên. Vui lòng chờ phê duyệt để tiếp tục bước tiếp theo.",
      step,
      status: "PENDING",
      requestedAt: nowIso,
    },
  })
})

export const dynamic = "force-dynamic"
