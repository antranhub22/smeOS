/**
 * notify-shipper-request.ts
 *
 * Gửi thông báo yêu cầu cửa hàng/chi nhánh cung cấp thông tin shipper
 * ngay sau khi ảnh thành phẩm pass (production_status = "READY").
 *
 * - Tin nhắn kèm link public submit-shipper để điền tên + SĐT ngay từ Telegram/Zalo.
 * - Cơ chế nhắc 1 lần sau `reminderMinutes` (default 30 phút) nếu chưa cung cấp.
 */

import { getSubcontractOrderRepository } from "../infra/subcontract-order-repository"
import { log } from "@/core/observability/log"
import { runInBackground } from "@/core/runtime/background"
import { MultiChannelDispatchNotifier } from "../infra/dispatch-notification-adapter"
import type { TenantContext } from "@/core/tenancy"

const DEFAULT_SHIPPER_REMINDER_MINUTES = 30

export interface ShipperRequestInput {
  organizationId: string
  orderId: string
  orderCode: string
  branchId: string
  branchPhone?: string | null | undefined
  branchTelegramChatId?: string | null | undefined
  branchName?: string | null | undefined
  /** Phút chờ trước khi gửi nhắc lần 2. Default: 30 phút. */
  reminderMinutes?: number | undefined
}

function buildSubmitShipperUrl(orderCode: string, branchId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3200"
  return `${base}/subcontract/${encodeURIComponent(orderCode)}?branch=${encodeURIComponent(branchId)}&action=submit_shipper`
}

/**
 * Gửi yêu cầu thông tin shipper cho chi nhánh ngay sau khi AI pass ảnh TP.
 * Kèm link public để chi nhánh điền tên + SĐT shipper mà không cần đăng nhập.
 * Lập lịch nhắc 1 lần sau reminderMinutes nếu chưa có thông tin.
 */
export async function notifyShipperRequest(input: ShipperRequestInput): Promise<void> {
  const {
    organizationId,
    orderId,
    orderCode,
    branchId,
    branchPhone,
    branchTelegramChatId,
    branchName = "Chi nhánh",
    reminderMinutes = DEFAULT_SHIPPER_REMINDER_MINUTES,
  } = input

  const submitUrl = buildSubmitShipperUrl(orderCode, branchId)
  const messageText =
    `🚀 [smeOS] Đơn hàng #${orderCode} đã được xác nhận hình ảnh thành phẩm!\n\n` +
    `📦 Vui lòng cung cấp thông tin SHIPPER để hệ thống bàn giao đơn hàng:\n` +
    `👉 ${submitUrl}\n\n` +
    `Điền đầy đủ Tên shipper + Số điện thoại để điều phối viên chuẩn bị bàn giao hàng cho tài xế.\n` +
    `⏱️ Hệ thống sẽ nhắc lại sau ${reminderMinutes} phút nếu chưa nhận được thông tin.`

  const ctx: TenantContext = {
    organizationId,
    workspaceId: "default",
    userId: "system",
    branchId,
    capabilities: new Set(),
  }

  const notifier = new MultiChannelDispatchNotifier()
  try {
    await notifier.sendSubcontractInvite(ctx, {
      branch: {
        branchId,
        branchName: branchName ?? "Chi nhánh",
        qualityScore: 100,
        activeJobsCount: 0,
        maxConcurrentJobs: 1,
        isActive: true,
        channels: {
          phone: branchPhone ?? undefined,
          zaloPhone: branchPhone ?? undefined,
          telegramChatId: branchTelegramChatId ?? undefined,
        },
      },
      orderCode,
      messageText,
      claimUrl: submitUrl,
      title: `📦 [SHIPPER] Đơn hàng #${orderCode} cần thông tin giao hàng`,
      actions: [{ text: "🚗 Nhập thông tin Shipper ngay", url: submitUrl }],
    })
    log.info("shipper_request.sent", { orderId, orderCode, branchId })
  } catch (err) {
    log.warn("shipper_request.send_failed", {
      orderId,
      orderCode,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  // Ghi flag đã gửi yêu cầu shipper vào metadata
  const repo = getSubcontractOrderRepository() as import("../infra/subcontract-order-repository").SubcontractOrderRepository
  await repo.upsertCoordinationMeta(orderId, organizationId, {
    shipper_request_sent_at: new Date().toISOString(),
    shipper_reminder_scheduled_at: new Date(Date.now() + reminderMinutes * 60_000).toISOString(),
    shipper_reminder_sent: false,
  })

  // Lập lịch nhắc 1 lần sau reminderMinutes (chạy background, không block response)
  runInBackground(`shipper_reminder:${orderCode}`, async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, reminderMinutes * 60_000))

    // Kiểm tra xem chi nhánh đã cung cấp shipper chưa
    const coordNow = await repo.findCoordination(orderId)
    const metaNow = (coordNow?.metadata as Record<string, unknown>) ?? {}
    const shipperInfo = metaNow.shipper_info as Record<string, unknown> | undefined

    if (shipperInfo?.shipperPhone || metaNow.shipper_reminder_sent === true) {
      log.info("shipper_reminder.skip_already_done", { orderCode })
      return
    }

    // Gửi nhắc lần cuối
    const reminderMsg =
      `⏰ [smeOS] Nhắc lại: Đơn hàng #${orderCode} đang chờ thông tin shipper!\n\n` +
      `Cửa hàng chưa cung cấp thông tin tài xế giao hàng.\n` +
      `👉 Vui lòng điền ngay tại: ${submitUrl}\n\n` +
      `Đây là lần nhắc cuối cùng. Vui lòng liên hệ điều phối viên nếu cần hỗ trợ.`

    await notifier.sendSubcontractInvite(ctx, {
      branch: {
        branchId,
        branchName: branchName ?? "Chi nhánh",
        qualityScore: 100,
        activeJobsCount: 0,
        maxConcurrentJobs: 1,
        isActive: true,
        channels: {
          phone: branchPhone ?? undefined,
          zaloPhone: branchPhone ?? undefined,
          telegramChatId: branchTelegramChatId ?? undefined,
        },
      },
      orderCode,
      messageText: reminderMsg,
      claimUrl: submitUrl,
      title: `⏰ [NHẮC] Đơn #${orderCode} cần thông tin shipper`,
      actions: [{ text: "🚗 Nhập thông tin Shipper", url: submitUrl }],
    }).catch((err) => {
      log.warn("shipper_reminder.send_failed", {
        orderCode,
        error: err instanceof Error ? err.message : String(err),
      })
    })

    // Đánh dấu đã gửi nhắc — không nhắc lại
    await repo.upsertCoordinationMeta(orderId, organizationId, {
      shipper_reminder_sent: true,
      shipper_reminder_sent_at: new Date().toISOString(),
    })

    log.info("shipper_reminder.sent", { orderCode, branchId })
  })
}
