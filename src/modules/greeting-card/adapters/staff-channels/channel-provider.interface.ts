import type { StaffNotifyChannel } from "../../domain/staff-notification-types"

export interface StaffChannelMessage {
  recipientId: string
  recipientName: string
  recipientPhone: string | null
  title: string
  message: string
  channelConfig?: Record<string, unknown>
}

export interface ChannelSendResult {
  sent: boolean
  providerMsgId?: string | null
  error?: string | null
}

export interface IStaffNotificationProvider {
  readonly channel: StaffNotifyChannel
  sendMessage(msg: StaffChannelMessage): Promise<ChannelSendResult>
}
