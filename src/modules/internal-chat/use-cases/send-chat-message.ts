import type { IInternalChatRepository } from "../domain/chat-repository.interface"
import type { InternalChatMessage } from "../domain/chat-entities"
import { ChatAccessDeniedError, ConversationNotFoundError, InvalidMessageContentError } from "../domain/errors"

export interface SendChatMessageInput {
  conversationId: string
  userId: string
  userRole: string
  content: string
  messageType?: "TEXT" | "IMAGE" | "ACTION_CARD_ORDER" | "ACTION_CARD_QC" | "SYSTEM_NOTICE" | undefined
  attachments?: string[] | undefined
  actionPayload?: Record<string, unknown> | undefined
}


export class SendChatMessageUseCase {
  constructor(private readonly chatRepo: IInternalChatRepository) {}

  async execute(input: SendChatMessageInput): Promise<InternalChatMessage> {
    const conv = await this.chatRepo.findConversationById(input.conversationId)
    if (!conv) {
      throw new ConversationNotFoundError(input.conversationId)
    }

    const isMember = await this.chatRepo.isParticipant(input.conversationId, input.userId)
    if (!isMember) {
      throw new ChatAccessDeniedError("Bạn chưa được cấp quyền tham gia cuộc hội thoại này")
    }

    const trimmed = input.content.trim()
    if (!trimmed && (!input.attachments || input.attachments.length === 0) && !input.actionPayload) {
      throw new InvalidMessageContentError("Tin nhắn không được để trống")
    }

    return this.chatRepo.sendMessage({
      conversationId: input.conversationId,
      senderUserId: input.userId,
      senderRole: input.userRole,
      messageType: input.messageType ?? "TEXT",
      content: trimmed,
      attachments: input.attachments,
      actionPayload: input.actionPayload,
    })
  }
}
