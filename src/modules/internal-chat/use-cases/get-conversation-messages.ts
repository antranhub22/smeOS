import type { IInternalChatRepository } from "../domain/chat-repository.interface"
import type { InternalChatMessage } from "../domain/chat-entities"
import { ChatAccessDeniedError, ConversationNotFoundError } from "../domain/errors"

export interface GetConversationMessagesInput {
  conversationId: string
  userId: string
  limit?: number
  before?: Date
}

export class GetConversationMessagesUseCase {
  constructor(private readonly chatRepo: IInternalChatRepository) {}

  async execute(input: GetConversationMessagesInput): Promise<InternalChatMessage[]> {
    const conv = await this.chatRepo.findConversationById(input.conversationId)
    if (!conv) {
      throw new ConversationNotFoundError(input.conversationId)
    }

    const isMember = await this.chatRepo.isParticipant(input.conversationId, input.userId)
    if (!isMember) {
      throw new ChatAccessDeniedError("Bạn chưa được cấp quyền xem tin nhắn của cuộc hội thoại này")
    }

    // Mark as read when fetching messages
    await this.chatRepo.markRead(input.conversationId, input.userId)

    return this.chatRepo.listMessages(input.conversationId, input.limit ?? 50, input.before)
  }
}
