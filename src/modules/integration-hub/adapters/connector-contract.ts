/**
 * Hợp đồng một đầu nối (connector) cài đặt. Mọi lời gọi ra ngoài phải có timeout và
 * đi qua `withCircuitBreaker`; không phương thức nào được ghi log bí mật.
 */

export interface ConnectorCredential {
  /** Bí mật dạng rõ — chỉ tồn tại trong bộ nhớ của use-case, không bao giờ trả về client. */
  readonly secret: string
}

export interface ConnectResult {
  readonly externalAccountId: string
  readonly displayName: string
  readonly config: Record<string, unknown>
  readonly expiresAt?: Date | null
}

export interface HealthResult {
  readonly ok: boolean
  readonly expired?: boolean
  readonly transient?: boolean
  readonly errorCode?: string
}

export interface InboundRequest {
  readonly rawBody: string
  readonly headers: Headers
}

export interface ParsedInboundEvent {
  readonly externalEventId: string | null
  readonly eventType: string
  readonly payload: unknown
}

export interface Connector {
  readonly key: string
  /** Xác thực khoá/token người dùng nhập; trả thông tin tài khoản ngoài. */
  connectWithSecret?(secret: string, input: Record<string, unknown>): Promise<ConnectResult>
  testConnection(credential: ConnectorCredential, config: Record<string, unknown>): Promise<HealthResult>
  /** Thu hồi quyền phía nhà cung cấp khi ngắt kết nối (nếu nhà cung cấp hỗ trợ). */
  revoke?(credential: ConnectorCredential): Promise<void>
  verifyWebhook?(request: InboundRequest, credential: ConnectorCredential, now: Date): boolean
  parseWebhook?(request: InboundRequest): ParsedInboundEvent[]
  /** Xử lý một sự kiện đã ghi nhận; ném lỗi để kích hoạt thử lại. */
  processEvent?(event: { eventType: string; payload: unknown }): Promise<void>
}
