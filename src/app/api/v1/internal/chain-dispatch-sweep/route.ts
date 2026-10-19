/**
 * POST /api/v1/internal/chain-dispatch-sweep
 *
 * Cron endpoint — Bộ Quét Mốc Tiến Độ Tự Động cho Đơn Gia Công Chuỗi.
 *
 * Gọi định kỳ mỗi 5-10 phút để:
 *  - M1: Nhắc bắt đầu chế tác khi hết Grace Period
 *  - M2: Nhắc chụp ảnh thành phẩm QC trước giờ giao (mặc định 45 phút)
 *  - M3: Nhắc bàn giao Shipper (mặc định 20 phút trước giờ giao)
 *  - M4: Cảnh báo trễ hạn SLA (mặc định sau 5 phút quá hạn)
 *
 * Bảo mật: Chỉ được gọi khi có header CRON_SECRET hoặc từ Vercel Cron.
 * Chống gửi trùng: Dùng state.remindersSent ghi timestamp lần đã gửi.
 *
 * Gọi thủ công (dev):
 *   curl -X POST http://localhost:3200/api/v1/internal/chain-dispatch-sweep \
 *     -H "x-cron-secret: dev"
 */

import { jsonResponse } from "@/core/http/response"
import { handle } from "@/core/http/response"
import { prisma } from "@/core/tenancy/infra/prisma"
import { parseChainDispatchPolicy } from "@/modules/greeting-card/domain/chain-dispatch-policy"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import { processOrderDispatchReminders } from "@/modules/greeting-card/use-cases/process-dispatch-reminders"
import { evaluateCustomerApproval } from "@/modules/greeting-card/use-cases/evaluate-customer-approval"
import type { SubcontractOrderState } from "@/modules/greeting-card/domain/subcontract-order"
import type { BranchCandidate } from "@/modules/greeting-card/domain/chain-dispatch-engine"
import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"

const CRON_SECRET = process.env.CRON_SECRET ?? "dev"
const MAX_ORDERS_PER_SWEEP = 50

export const POST = handle(async (request) => {
  // Bảo mật: xác thực cron secret header
  const secret = request.headers.get("x-cron-secret")
  if (secret !== CRON_SECRET) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const forceStep = url.searchParams.get("forceStep") as
    | "M1_PREP"
    | "M2_QC"
    | "M2_QC_RETRY"
    | "M2_QC_ESCALATED"
    | "M3_DISPATCH"
    | "M4_OVERDUE"
    | null

  const now = new Date()
  const stateRepo = new SubcontractOrderRepository()
  const notifier = new MultiChannelDispatchNotifier()

  let totalProcessed = 0
  let totalRemindersSent = 0
  const sentDetails: Array<{ orderCode: string; step: string; message?: string | undefined }> = []
  const errors: string[] = []

  // 1. Lấy danh sách order_coordinations có subcontract đang COMMITTED/CLAIMED_GRACE
  const coordinations = await prisma.order_coordinations.findMany({
    where: {
      // JSON filter: tìm các record có subcontract_dispatch không null
      metadata: { not: {} },
    },
    select: {
      id: true,
      organization_id: true,
      order_id: true,
      metadata: true,
    },
    take: MAX_ORDERS_PER_SWEEP,
  })

  // Lọc chỉ những đơn đang ở trạng thái cần nhắc việc
  const activeCoords = coordinations.filter((c) => {
    const meta = c.metadata as Record<string, unknown> | null
    if (!meta || typeof meta !== "object") return false
    const sub = meta.subcontract_dispatch as Record<string, unknown> | undefined
    if (!sub) return false
    const status = sub.dispatchStatus as string | undefined
    return status === "COMMITTED" || status === "CLAIMED_GRACE"
  })

  if (activeCoords.length === 0) {
    return jsonResponse({
      ok: true,
      processed: 0,
      remindersSent: 0,
      message: "Không có đơn gia công nào cần nhắc việc.",
    })
  }

  // 2. Nhóm theo organization để lấy settings một lần
  const orgIds = [...new Set(activeCoords.map((c) => c.organization_id))]
  const orgs = await prisma.organizations.findMany({
    where: { id: { in: orgIds } },
    select: { id: true, settings: true },
  })
  const orgMap = new Map(orgs.map((o) => [o.id, o]))

  // 3. Lấy thông tin đơn hàng (delivery_window, items) theo batch
  const orderIds = activeCoords.map((c) => c.order_id)
  const orders = await prisma.orders.findMany({
    where: { id: { in: orderIds } },
    select: {
      id: true,
      code: true,
      delivery_window: true,
      delivery_status: true,
      production_status: true,
      items: {
        select: {
          description: true,
          metadata: true,
        },
      },
    },
  })
  const orderMap = new Map(orders.map((o) => [o.id, o]))

  // 4. Xử lý từng coordination
  for (const coord of activeCoords) {
    try {
      const order = orderMap.get(coord.order_id)
      if (!order) continue

      const org = orgMap.get(coord.organization_id)
      if (!org) continue

      const meta = coord.metadata as Record<string, unknown>
      const state = meta.subcontract_dispatch as SubcontractOrderState
      if (!state?.claimedBranchId) continue

      // Trích xuất giờ giao hàng
      const deliveryWindow = order.delivery_window as Record<string, unknown> | null
      const deliveryTimeStr = (deliveryWindow?.timeSlot as string | undefined) || "Theo thỏa thuận"
      const deliveryDateStr = (deliveryWindow?.date as string | undefined) || null

      // Tính deliveryTimestampMs
      let deliveryTimestampMs = 0
      if (deliveryDateStr && deliveryTimeStr && deliveryTimeStr !== "Theo thỏa thuận") {
        // Cố gắng parse "HH:mm" + "YYYY-MM-DD"
        const timeMatch = deliveryTimeStr.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
          const hh = timeMatch[1] ?? "00"
          const mm = timeMatch[2] ?? "00"
          const dt = new Date(`${deliveryDateStr}T${hh.padStart(2, "0")}:${mm}:00+07:00`)
          if (!isNaN(dt.getTime())) {
            deliveryTimestampMs = dt.getTime()
          }
        }
      }

      // Nếu không có thông tin thời gian và không ép step → bỏ qua đơn này
      if (deliveryTimestampMs === 0 && !forceStep) continue
      if (deliveryTimestampMs === 0) {
        deliveryTimestampMs = Date.now() + 30 * 60 * 1000 // Giả lập 30 phút nữa giao nếu không có giờ
      }

      // Tìm chi nhánh trong settings để có thông tin kênh liên lạc
      const settings = (org.settings as Record<string, unknown> | null) ?? {}
      const chainBranches = (settings.chain_branches as Array<Record<string, unknown>>) || []
      const branchData = chainBranches.find((b) => b.branchId === state.claimedBranchId)
      if (!branchData) continue

      const branchChannels = (branchData.channels as Record<string, unknown> | undefined) ?? {}
      const branch: BranchCandidate = {
        branchId: state.claimedBranchId,
        branchName: (state.claimedBranchName ?? branchData.branchName ?? "Chi nhánh") as string,
        qualityScore: typeof branchData.qualityScore === "number" ? branchData.qualityScore : 90,
        activeJobsCount: 0,
        maxConcurrentJobs: 10,
        isActive: true,
        channels: {
          phone: (branchChannels.phone ?? branchData.phone) as string | undefined,
          telegramChatId: (branchChannels.telegramChatId ?? branchData.telegramChatId) as string | undefined,
          zaloPhone: (branchChannels.zaloPhone ?? branchData.zaloPhone) as string | undefined,
        },
      }

      const ctx: TenantContext = {
        organizationId: coord.organization_id,
        workspaceId: coord.organization_id,
        userId: "cron:chain-dispatch-sweep",
        branchId: null,
        capabilities: new Set<string>(),
      }

      // Đơn hàng có ảnh thành phẩm khi production_status là QUALITY_CHECK / READY hoặc metadata có qc_photos
      const hasQcPhoto = order.production_status === "QUALITY_CHECK" || order.production_status === "READY"
      const subDispatchMeta = (coord.metadata as Record<string, unknown> | null)?.subcontract_dispatch as Record<string, unknown> | undefined
      const hasShipperInfo = Boolean(subDispatchMeta?.shipper_info) || order.delivery_status === "DELIVERING" || order.delivery_status === "DELIVERED"
      const hasDeliveryProof = Boolean((coord.metadata as Record<string, unknown> | null)?.delivery_proof) || order.delivery_status === "DELIVERED"

      const coordinatorChannel = settings.coordinator_channel as
        | { phone?: string; telegramChatId?: string }
        | undefined

      // M2b: Đánh giá Customer Approval Timer (auto-approve nếu khách không phản hồi)
      if (order.production_status === "READY") {
        const policy = parseChainDispatchPolicy(org.settings)
        const autoApproveMinutes = policy.milestoneReminders.qcRetryIntervalMinutes ?? 30
        await evaluateCustomerApproval(
          {
            organizationId: coord.organization_id,
            orderId: coord.order_id,
            orderCode: order.code,
            productionStatus: order.production_status,
            autoApproveAfterMinutes: autoApproveMinutes,
          },
          now
        ).catch((err) => {
          log.warn("chain_dispatch_sweep.m2b_eval_failed", { orderId: coord.order_id, error: err instanceof Error ? err.message : String(err) })
        })
      }

      // Xác định ảnh sản phẩm (Ưu tiên ảnh QC nếu có, fallback ảnh mẫu trong items)
      const coordMeta = (coord.metadata as Record<string, unknown> | null) ?? {}
      const qcPhotos = Array.isArray(coordMeta.qc_photos) ? (coordMeta.qc_photos as string[]) : []
      const firstItemMeta = (order.items?.[0]?.metadata as Record<string, unknown> | null) ?? {}
      const sampleImageUrl = (firstItemMeta.imageUrl as string | undefined) || (firstItemMeta.image as string | undefined) || null
      const productImageUrl = qcPhotos.length > 0 ? qcPhotos[0] : sampleImageUrl

      const results = await processOrderDispatchReminders(
        ctx,
        {
          orderId: coord.order_id,
          orderCode: order.code,
          deliveryTimeStr,
          deliveryDateStr,
          deliveryTimestampMs,
          state,
          branch,
          shopSettings: org.settings,
          hasQcPhoto,
          hasShipperInfo,
          hasDeliveryProof,
          deliveryStatus: order.delivery_status ?? undefined,
          coordinatorChannel,
          baseUrl: url.origin,
          forceStep: forceStep ?? undefined,
          productImageUrl,
        },
        stateRepo,
        notifier,
        now
      )

      const successfullySent = results.filter((r) => r.sent)
      if (successfullySent.length > 0) {
        log.info("chain_dispatch_sweep.reminders_sent", {
          orderId: coord.order_id,
          orderCode: order.code,
          orgId: coord.organization_id,
          steps: successfullySent.map((r) => r.step),
        })
        for (const item of successfullySent) {
          sentDetails.push({
            orderCode: order.code,
            step: item.step,
            message: item.message,
          })
        }
      }

      totalRemindersSent += successfullySent.length
      totalProcessed++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`order:${coord.order_id} — ${msg}`)
      log.warn("chain_dispatch_sweep.error", { orderId: coord.order_id, error: msg })
    }
  }

  return jsonResponse({
    ok: true,
    processed: totalProcessed,
    remindersSent: totalRemindersSent,
    sentDetails: sentDetails.length > 0 ? sentDetails : undefined,
    errors: errors.length > 0 ? errors : undefined,
    sweepAt: now.toISOString(),
  })
})
