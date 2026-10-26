"use client"

import React, { useEffect, useState, useRef } from "react"
import { MessageSquare, X, Send, ChevronLeft, Building, Store, ShieldCheck } from "lucide-react"
import type { InternalChatConversation, InternalChatMessage, ActionCardOrderPayload } from "@/modules/internal-chat/domain/chat-entities"
import { ActionCardOrder } from "./action-card-order"

export function InternalChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<InternalChatConversation[]>([])
  const [activeConv, setActiveConv] = useState<InternalChatConversation | null>(null)
  const [messages, setMessages] = useState<InternalChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [unreadTotal, setUnreadTotal] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/v1/internal-chat/conversations")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setConversations(json.data)
        const unread = json.data.reduce((acc: number, cur: InternalChatConversation) => acc + (cur.unreadCount || 0), 0)
        setUnreadTotal(unread)
      }
    } catch {
      // Ignored
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/internal-chat/conversations/${convId}/messages`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data)
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
    const timer = setInterval(fetchConversations, 15000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id)
      const msgTimer = setInterval(() => fetchMessages(activeConv.id), 5000)
      return () => clearInterval(msgTimer)
    }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConv || !inputText.trim()) return

    const text = inputText.trim()
    setInputText("")

    try {
      const res = await fetch(`/api/v1/internal-chat/conversations/${activeConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, messageType: "TEXT" }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data])
      }
    } catch {
      // Ignored
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition-all duration-200 hover:scale-105"
          title="Mở Chat nội bộ"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-white animate-pulse">
              {unreadTotal}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              {activeConv && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveConv(null)
                    fetchConversations()
                  }}
                  className="p-1 hover:bg-rose-800/40 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {activeConv ? activeConv.title || "Cuộc trò chuyện" : "Chat nội bộ smeOS"}
                </h3>
                <span className="text-[11px] text-rose-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Bảo mật & Cách ly đa tenant
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-rose-800/40 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-3">
            {!activeConv ? (
              /* Conversation list */
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-neutral-400 px-1 uppercase tracking-wider">
                  Kênh trao đổi
                </div>
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className="p-3 bg-white rounded-xl border border-neutral-100 hover:border-rose-200 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        {conv.conversationType === "PLATFORM_TENANT" ? (
                          <Building className="w-4 h-4" />
                        ) : (
                          <Store className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-neutral-800 truncate">
                            {conv.title || (conv.conversationType === "PLATFORM_TENANT" ? "Hỗ trợ SaaS" : "Trao đổi đối tác")}
                          </h4>
                          {Boolean(conv.unreadCount) && (
                            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {conv.lastMessageSnippet || "Chưa có tin nhắn mới"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Chat message thread */
              <div className="space-y-3">
                {loading && messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-neutral-400">Đang tải tin nhắn...</div>
                ) : (
                  messages.map((msg) => {
                    const isCard = msg.messageType === "ACTION_CARD_ORDER"
                    const isNotice = msg.messageType === "SYSTEM_NOTICE"

                    if (isNotice) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block bg-neutral-200/70 text-neutral-600 text-[10px] px-2.5 py-0.5 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <div key={msg.id} className="space-y-1">
                        <div className="text-[10px] text-neutral-400 px-1">
                          {msg.senderName || msg.senderRole}
                        </div>
                        {isCard ? (
                          <ActionCardOrder
                            messageId={msg.id}
                            payload={msg.actionPayload as ActionCardOrderPayload}
                            isSender={false}
                            onActionComplete={() => fetchMessages(activeConv.id)}
                          />
                        ) : (
                          <div className="p-2.5 bg-white border border-neutral-100 rounded-xl shadow-xs text-xs text-neutral-800 max-w-[85%] leading-relaxed">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer input if activeConv */}
          {activeConv && (
            <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-neutral-100 flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
