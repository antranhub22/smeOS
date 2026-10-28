import { NextRequest, NextResponse } from "next/server"
import { ChatChannelRepository } from "@/modules/chat-assistant/infra/chat-channel-repository"
import { handleIncomingChannelMessage } from "@/modules/chat-assistant/use-cases/handle-incoming-channel-message"
import { isFreshEvent, verifyZaloSignature } from "@/modules/greeting-card/use-cases/zalo-oa-link"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const eventName = body.event_name
    const oaId = body.oa_id
    const senderId = body.sender?.id || body.user_id_by_app
    const messageText = body.message?.text

    if (eventName === "user_send_text" && oaId && senderId && messageText) {
      const channelRepo = new ChatChannelRepository()
      const channelIntegration = await channelRepo.findActiveByZaloOaId(oaId)

      // AUD-028: chữ ký X-ZEvent-Signature theo App ID + Secret Key của chính OA tiệm đã cấu hình,
      // kèm chống phát lại theo timestamp. Sai/thiếu → 401, không gọi AI, không gửi tin.
      if (channelIntegration) {
        const { zaloAppId, zaloSecretKey } = channelIntegration.config
        const signed = verifyZaloSignature({
          rawBody,
          header: req.headers.get("x-zevent-signature"),
          appId: zaloAppId,
          oaSecretKey: zaloSecretKey,
          timestamp: body.timestamp,
        })
        if (!signed || String(body.app_id) !== String(zaloAppId) || !isFreshEvent(body.timestamp)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await handleIncomingChannelMessage({
          organizationId: channelIntegration.organizationId,
          channel: "ZALO_OA",
          externalSenderId: senderId,
          messageText,
        })

        const accessToken = channelIntegration.config.zaloAccessToken
        if (accessToken) {
          await sendZaloOaReply(accessToken, senderId, result.replyText)
        }
      }
    }

    return NextResponse.json({ error: 0, message: "Success" }, { status: 200 })
  } catch (error) {
    console.error("Zalo OA Webhook error:", error)
    return NextResponse.json({ error: 0, message: "OK" }, { status: 200 })
  }
}

async function sendZaloOaReply(accessToken: string, userId: string, text: string) {
  try {
    await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: userId },
        message: { text },
      }),
    })
  } catch (err) {
    console.error("Failed to send Zalo OA reply:", err)
  }
}
