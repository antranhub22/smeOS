import type { IInternalChatRepository } from "../domain/chat-repository.interface"
import type { InternalChatMessage, ActionCardOrderPayload } from "../domain/chat-entities"
import { ChatAccessDeniedError, ChatDomainError } from "../domain/errors"

export interface HandleCardActionInput {
  messageId: string
  userId: string
  userOrgId: string
  action: "ACCEPT_ORDER" | "REJECT_ORDER"
  rejectedReason?: string | undefined
}


export class HandleCardActionUseCase {
  constructor(private readonly chatRepo: IInternalChatRepository) {}

  async execute(input: HandleCardActionInput): Promise<InternalChatMessage> {
    // 1. Fetch conversation messages or specific message
    // Update action payload in living card
    // We update the message's action payload directly
    const currentPayload = {} as ActionCardOrderPayload

    // Prepare updated state
    let newStatus: "ACCEPTED" | "REJECTED" = "ACCEPTED"
    if (input.action === "REJECT_ORDER") {
      newStatus = "REJECTED"
    }

    const updatedPayload: Partial<ActionCardOrderPayload> = {
      status: newStatus,
      assignedPartnerOrgId: input.userOrgId,
      rejectedReason: input.rejectedReason,
    }

    const updatedMessage = await this.chatRepo.updateActionPayload(input.messageId, {
      ...updatedPayload,
      updatedAt: new Date().toISOString(),
      actionByUserId: input.userId,
    })

    // Post an announcement message into the thread
    const statusText = newStatus === "ACCEPTED" ? "ĐÃ CHẤP NHẬN ĐƠN HÀNG" : `ĐÃ TỪ CHỐI ĐƠN HÀNG (Lý do: ${input.rejectedReason ?? "Bận việc"})`
    await this.chatRepo.sendMessage({
      conversationId: updatedMessage.conversationId,
      senderUserId: input.userId,
      senderRole: "partner_member",
      messageType: "SYSTEM_NOTICE",
      content: `Đối tác ${statusText}`,
    })

    return updatedMessage
  }
}
