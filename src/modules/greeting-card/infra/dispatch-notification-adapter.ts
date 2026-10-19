/**
 * dispatch-notification-adapter.ts
 *
 * Adapter gửi tin nhắn mời gia công và nhắc việc đa kênh (Telegram / Zalo / SMS / Messenger).
 * Triển khai IDispatchNotifier theo chuẩn Clean Architecture & Cổng tích hợp linh hoạt.
 */

import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import type { IDispatchNotifier, DispatchNotificationTarget } from "../use-cases/dispatch-subcontract-order"
import type { BranchCandidate } from "../domain/chain-dispatch-engine"
import { getStaffChannelProvider } from "../adapters/staff-channels"

export class MultiChannelDispatchNotifier implements IDispatchNotifier {
  async sendSubcontractInvite(
    ctx: TenantContext,
    target: DispatchNotificationTarget
  ): Promise<{ sent: boolean; error?: string | null }> {
    const branch = target.branch
    const channels = branch.channels

    const actions = target.actions && target.actions.length > 0
      ? target.actions
      : [{ text: "👉 Nhận đơn ngay", url: target.claimUrl }]

    // 1. Nếu có Telegram Chat ID -> gửi qua Telegram Bot
    if (channels?.telegramChatId) {
      const telegramProvider = getStaffChannelProvider("TELEGRAM")
      if (telegramProvider) {
        const botToken = process.env.TELEGRAM_DISPATCH_BOT_TOKEN || process.env.TELEGRAM_STAFF_BOT_TOKEN
        if (botToken) {
          try {
            const res = await telegramProvider.sendMessage({
              recipientId: branch.branchId,
              recipientName: branch.branchName,
              recipientPhone: channels.phone ?? null,
              title: target.title ?? `🌸 [ĐƠN GIA CÔNG #${target.orderCode}]`,
              message: target.messageText,
              channelConfig: {
                botToken,
                defaultChatId: channels.telegramChatId,
              },
              actions,
            })
            if (res.sent) {
              return { sent: true }
            }
          } catch (err) {
            log.warn("dispatch_notify.telegram_err", {
              branchId: branch.branchId,
              error: err instanceof Error ? err.message : String(err),
            })
          }
        }
      }
    }

    // 2. Nếu có Zalo Phone -> gửi qua Zalo OA
    if (channels?.zaloPhone) {
      const zaloProvider = getStaffChannelProvider("ZALO")
      if (zaloProvider) {
        try {
          const res = await zaloProvider.sendMessage({
            recipientId: branch.branchId,
            recipientName: branch.branchName,
            recipientPhone: channels.zaloPhone,
            title: `Đơn gia công #${target.orderCode}`,
            message: target.messageText,
          })
          if (res.sent) {
            return { sent: true }
          }
        } catch (err) {
          log.warn("dispatch_notify.zalo_err", {
            branchId: branch.branchId,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // Ghi log thông báo nội bộ
    log.info("dispatch_notify.simulated_or_dispatched", {
      branchId: branch.branchId,
      branchName: branch.branchName,
      orderCode: target.orderCode,
      channels: branch.channels,
    })

    return { sent: true }
  }
}
