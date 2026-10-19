import type { StaffNotifyChannel } from "../../domain/staff-notification-types"

export interface StaffChannelAction {
  text: string
  url: string
}

export interface StaffChannelMessage {
  recipientId: string
  recipientName: string
  recipientPhone: string | null
  title: string
  message: string
  channelConfig?: Record<string, unknown>
  actions?: StaffChannelAction[]
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
