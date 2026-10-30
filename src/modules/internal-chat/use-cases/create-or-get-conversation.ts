import type { IInternalChatRepository } from "../domain/chat-repository.interface"
import type { InternalChatConversation, ConversationType } from "../domain/chat-entities"
import { ChatAccessDeniedError } from "../domain/errors"

export interface CreateOrGetConversationInput {
  organizationId: string
  userId: string
  userRole: string
  conversationType: ConversationType
  targetOrganizationId?: string | undefined
  targetUserId?: string | undefined
  orderId?: string | undefined
  title?: string | undefined
}


export class CreateOrGetConversationUseCase {
  constructor(private readonly chatRepo: IInternalChatRepository) {}

  async execute(input: CreateOrGetConversationInput): Promise<InternalChatConversation> {
    if (input.orderId) {
      const existing = await this.chatRepo.findConversationByOrderId(input.orderId)
      if (existing) {
        // Ensure user is participant
        const isPart = await this.chatRepo.isParticipant(existing.id, input.userId)
        // Chỉ tự tham gia luồng đơn của CHÍNH tổ chức mình; luồng của tổ chức khác thì phải được mời
        // trước (vd. đối tác nhận đơn qua dispatch-to-chat) — không thì như không tồn tại.
        if (!isPart && existing.organizationId !== input.organizationId) throw new ChatAccessDeniedError()
        if (!isPart) {
          await this.chatRepo.addParticipant(existing.id, {
            userId: input.userId,
            organizationId: input.organizationId,
            roleInChat: "MEMBER",
          })
        }
        return existing
      }
    }

    const participants = [
      {
        userId: input.userId,
        organizationId: input.organizationId,
        roleInChat: "OWNER",
      },
    ]

    if (input.targetUserId && input.targetUserId !== input.userId) {
      participants.push({
        userId: input.targetUserId,
        organizationId: input.targetOrganizationId ?? input.organizationId,
        roleInChat: "MEMBER",
      })
    }

    return this.chatRepo.createConversation({
      organizationId: input.organizationId,
      conversationType: input.conversationType,
      title: input.title,
      orderId: input.orderId,
      createdBy: input.userId,
      participantUserIds: participants,
      metadata: {
        targetOrganizationId: input.targetOrganizationId,
      },
    })
  }
}
