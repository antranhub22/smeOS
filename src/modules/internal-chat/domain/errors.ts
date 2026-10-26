export class ChatDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = "ChatDomainError"
  }
}

export class ConversationNotFoundError extends ChatDomainError {
  constructor(conversationId: string) {
    super(`Không tìm thấy cuộc hội thoại ID: ${conversationId}`, "CONVERSATION_NOT_FOUND")
  }
}

export class ChatAccessDeniedError extends ChatDomainError {
  constructor(reason = "Bạn không có quyền tham gia hoặc xem cuộc hội thoại này") {
    super(reason, "CHAT_ACCESS_DENIED")
  }
}

export class InvalidMessageContentError extends ChatDomainError {
  constructor(reason = "Nội dung tin nhắn không hợp lệ") {
    super(reason, "INVALID_MESSAGE_CONTENT")
  }
}
