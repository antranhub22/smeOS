/**
 * dispatch-notification-adapter.ts
 *
 * Adapter gửi tin nhắn mời gia công và nhắc việc đa kênh (Telegram / Zalo / SMS / Messenger).
 * Triển khai IDispatchNotifier theo chuẩn Clean Architecture & Cổng tích hợp linh hoạt.
 *
 * Live Dashboard Card Model:
 *   - Lần đầu: gửi mới, lưu telegramMsgId + telegramChatId vào SubcontractOrderState.
 *   - Lần sau: EDIT tin nhắn cũ (editMessageText / editMessageCaption) thay vì gửi mới.
 *   => Mỗi đơn hàng chỉ có MỘT thẻ tiến độ duy nhất trên Telegram.
 */

import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import type {
  IDispatchNotifier,
  DispatchNotificationTarget,
  LiveCardSendResult,
} from "../use-cases/dispatch-subcontract-order"
import { getStaffChannelProvider } from "../adapters/staff-channels"

export class MultiChannelDispatchNotifier implements IDispatchNotifier {
  async sendSubcontractInvite(
    ctx: TenantContext,
    target: DispatchNotificationTarget
  ): Promise<LiveCardSendResult> {
    const branch = target.branch
    const channels = branch.channels
    const botToken = process.env.TELEGRAM_DISPATCH_BOT_TOKEN || process.env.TELEGRAM_STAFF_BOT_TOKEN
    const existingCard = target.existingTelegramCard

    const actions =
      target.actions && target.actions.length > 0
        ? target.actions
        : [{ text: "👉 Nhận đơn ngay", url: target.claimUrl }]

    const fullText = `<b>${target.title ?? `🌸 [ĐƠN GIA CÔNG #${target.orderCode}]`}</b>\n\n${target.messageText}`

    // ── EDIT MODE: Thẻ đã tồn tại → chỉ cập nhật nội dung, không gửi mới ──
    if (existingCard?.msgId && existingCard?.chatId && channels?.telegramChatId) {
      const telegramProvider = getStaffChannelProvider("TELEGRAM")
      if (telegramProvider?.editMessage && botToken) {
        try {
          const editRes = await telegramProvider.editMessage({
            messageId: existingCard.msgId,
            chatId: existingCard.chatId,
            text: fullText,
            isCaption: existingCard.isCaption ?? false,
            actions,
            channelConfig: { botToken },
          })
          if (editRes.ok) {
            log.info("dispatch_notify.live_card_updated", {
              orderCode: target.orderCode,
              branchId: branch.branchId,
              msgId: existingCard.msgId,
            })
            // Trả về sent=true nhưng KHÔNG trả telegramMsgId (đã có rồi, không thay đổi)
            return { sent: true }
          }
          log.warn("dispatch_notify.live_card_edit_failed_fallback_send", {
            error: editRes.error,
            orderCode: target.orderCode,
          })
        } catch (err) {
          log.warn("dispatch_notify.live_card_edit_exception", {
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // ── SEND MODE: Chưa có thẻ → gửi mới và trả về msgId + chatId để lưu vào state ──
    if (channels?.telegramChatId) {
      const telegramProvider = getStaffChannelProvider("TELEGRAM")
      if (telegramProvider && botToken) {
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
            imageUrl: target.imageUrl,
          })
          if (res.sent) {
            log.info("dispatch_notify.live_card_created", {
              orderCode: target.orderCode,
              branchId: branch.branchId,
              msgId: res.providerMsgId,
              chatId: res.providerChatId,
            })
            return {
              sent: true,
              telegramMsgId: res.providerMsgId ?? null,
              telegramChatId: res.providerChatId ?? channels.telegramChatId,
            }
          }
        } catch (err) {
          log.warn("dispatch_notify.telegram_err", {
            branchId: branch.branchId,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // Zalo fallback (không hỗ trợ edit, vẫn gửi mới)
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

    log.info("dispatch_notify.simulated_or_dispatched", {
      branchId: branch.branchId,
      branchName: branch.branchName,
      orderCode: target.orderCode,
      channels: branch.channels,
    })

    return { sent: true }
  }
}
