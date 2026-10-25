"use client"

import React, { useEffect, useState, useRef } from "react"
import {
  MessageSquare,
  Send,
  Building,
  Store,
  ShieldCheck,
  Search,
  PlusCircle,
  Package,
} from "lucide-react"
import type {
  InternalChatConversation,
  InternalChatMessage,
  ActionCardOrderPayload,
} from "@/modules/internal-chat/domain/chat-entities"
import { ActionCardOrder } from "@/components/internal-chat/action-card-order"

export default function InternalChatPage() {
  const [conversations, setConversations] = useState<InternalChatConversation[]>([])
  const [activeConv, setActiveConv] = useState<InternalChatConversation | null>(null)
  const [messages, setMessages] = useState<InternalChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/v1/internal-chat/conversations")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setConversations(json.data)
        if (!activeConv && json.data.length > 0) {
          setActiveConv(json.data[0])
        }
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

  const filteredConversations = conversations.filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-neutral-100/60 p-4 gap-4">
      {/* Cột trái: Danh sách hội thoại */}
      <div className="w-80 md:w-96 bg-white rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col overflow-hidden">
        {/* Header danh sách */}
        <div className="p-4 border-b border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-600" />
              Tin nhắn nội bộ
            </h1>
            <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
              Đa ngành SaaS
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trao đổi, đối tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Danh sách các kênh chat */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16 text-xs text-neutral-400">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                    isSelected
                      ? "bg-rose-50/70 border-rose-200 shadow-xs"
                      : "bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200/60"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      conv.conversationType === "PLATFORM_TENANT"
                        ? "bg-indigo-50 text-indigo-600"
                        : conv.conversationType === "ORDER_THREAD"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {conv.conversationType === "PLATFORM_TENANT" ? (
                      <Building className="w-5 h-5" />
                    ) : conv.conversationType === "ORDER_THREAD" ? (
                      <Package className="w-5 h-5" />
                    ) : (
                      <Store className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-neutral-800 truncate">
                        {conv.title ||
                          (conv.conversationType === "PLATFORM_TENANT"
                            ? "Hỗ trợ SaaS Platform"
                            : "Trao đổi đối tác")}
                      </h3>
                      {Boolean(conv.unreadCount) && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {conv.lastMessageSnippet || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Cột phải: Khung chat chi tiết */}
      <div className="flex-1 bg-white rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col overflow-hidden">
        {activeConv ? (
          <>
            {/* Header khung chat */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                  {activeConv.title ? activeConv.title.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-800 leading-tight">
                    {activeConv.title || "Cuộc trò chuyện"}
                  </h2>
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Kênh nội bộ bảo mật
                  </span>
                </div>
              </div>
            </div>

            {/* Vùng tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/40">
              {loading && messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400">Đang tải tin nhắn...</div>
              ) : (
                messages.map((msg) => {
                  const isCard = msg.messageType === "ACTION_CARD_ORDER"
                  const isNotice = msg.messageType === "SYSTEM_NOTICE"

                  if (isNotice) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="inline-block bg-neutral-200/80 text-neutral-600 text-[11px] px-3 py-1 rounded-full font-medium">
                          {msg.content}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div key={msg.id} className="space-y-1.5">
                      <div className="text-[11px] text-neutral-400 px-1 font-medium">
                        {msg.senderName || msg.senderRole} ·{" "}
                        <span className="text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {isCard ? (
                        <ActionCardOrder
                          messageId={msg.id}
                          payload={msg.actionPayload as ActionCardOrderPayload}
                          isSender={false}
                          onActionComplete={() => fetchMessages(activeConv.id)}
                        />
                      ) : (
                        <div className="p-3 bg-white border border-neutral-200/70 rounded-2xl shadow-xs text-xs text-neutral-800 max-w-lg leading-relaxed">
                          {msg.content}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập tin nhắn */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-100 flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn trao đổi nghiệp vụ..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
            <MessageSquare className="w-12 h-12 stroke-[1.5] text-neutral-300 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-600">Chọn một cuộc trò chuyện để bắt đầu</h3>
            <p className="text-xs text-neutral-400 max-w-xs mt-1">
              Trao đổi trực tiếp với Quản trị nền tảng SaaS hoặc Đối tác gia công thuộc chuỗi.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
