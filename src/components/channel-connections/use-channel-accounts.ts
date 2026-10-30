"use client"

import { useCallback, useEffect, useState } from "react"
import type { ConnectedAccountData } from "@/components/templates/platform-connections"

const BASE = "/api/v1/proxy/api/accounts"
const Q = "?client=SOCIALFLOW"

export interface SaveAccountPayload {
  platform: string
  username: string
  password: string
  page_id?: string | undefined
  page_access_token?: string | undefined
}

type Notice = { type: "success" | "error"; message: string } | null

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } }
  if (res.status === 403) return "Bạn chưa có quyền kết nối tài khoản mạng xã hội. Nhờ quản lý cửa hàng cấp quyền đăng bài."
  return data.error?.message || fallback
}

/**
 * Tài khoản mạng xã hội của cửa hàng qua dịch vụ đăng bài (proxy `client=SOCIALFLOW`, công cụ 54).
 * Lỗi tải danh sách hiện rõ để người dùng thử lại — không coi như "chưa kết nối".
 */
export function useChannelAccounts(nameOf: (platformId: string) => string) {
  const [accounts, setAccounts] = useState<ConnectedAccountData[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading")
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const show = (type: "success" | "error", message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 6000)
  }

  const fetchAccounts = useCallback(async (): Promise<ConnectedAccountData[] | null> => {
    try {
      const res = await fetch(`${BASE}${Q}`)
      if (!res.ok) return null
      const data = (await res.json()) as { accounts?: ConnectedAccountData[] }
      return data.accounts ?? []
    } catch {
      return null
    }
  }, [])

  const apply = (list: ConnectedAccountData[] | null) => {
    if (list) setAccounts(list)
    setLoadState(list ? "ready" : "error")
  }

  useEffect(() => {
    let ignore = false
    void fetchAccounts().then((list) => {
      if (!ignore) apply(list)
    })
    return () => {
      ignore = true
    }
  }, [fetchAccounts])

  const reload = useCallback(async () => {
    setRefreshing(true)
    apply(await fetchAccounts())
    setRefreshing(false)
  }, [fetchAccounts])

  const run = async (platformId: string, fn: () => Promise<void>) => {
    setActionLoading(platformId)
    try {
      await fn()
    } finally {
      setActionLoading(null)
      await reload()
    }
  }

  const login = (platformId: string) =>
    run(platformId, async () => {
      show("success", `Đang mở phiên đăng nhập ${nameOf(platformId)}…`)
      try {
        const res = await fetch(`${BASE}/${platformId}/login${Q}`, { method: "POST" })
        const data = (await res.clone().json().catch(() => ({}))) as { success?: boolean; message?: string }
        if (res.ok && data.success) show("success", `Đã đăng nhập ${nameOf(platformId)}. Phiên đã được lưu.`)
        else show("error", res.ok ? data.message || `Đăng nhập ${nameOf(platformId)} chưa thành công. Kiểm tra lại tài khoản hoặc mã xác minh hai bước.` : await errorMessage(res, `Đăng nhập ${nameOf(platformId)} chưa thành công.`))
      } catch {
        show("error", `Không kết nối được dịch vụ đăng bài để đăng nhập ${nameOf(platformId)}.`)
      }
    })

  const save = (payload: SaveAccountPayload) =>
    run(payload.platform, async () => {
      const res = await fetch(`${BASE}${Q}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) {
        show("error", await errorMessage(res, "Không lưu được thông tin tài khoản."))
        return
      }
      setActionLoading(null)
      await login(payload.platform)
    })

  const check = (platformId: string) =>
    run(platformId, async () => {
      try {
        const res = await fetch(`${BASE}/${platformId}/check${Q}`, { method: "POST" })
        const data = (await res.clone().json().catch(() => ({}))) as { logged_in?: boolean }
        if (res.ok && data.logged_in) show("success", `Phiên ${nameOf(platformId)} đang hoạt động bình thường.`)
        else show("error", res.ok ? `Phiên ${nameOf(platformId)} đã hết hạn. Bấm "Đăng nhập ngay" để kết nối lại.` : await errorMessage(res, `Không kiểm tra được phiên ${nameOf(platformId)}.`))
      } catch {
        show("error", `Không kết nối được dịch vụ đăng bài để kiểm tra ${nameOf(platformId)}.`)
      }
    })

  const disconnect = (platformId: string) =>
    run(platformId, async () => {
      const res = await fetch(`${BASE}/${platformId}${Q}`, { method: "DELETE" }).catch(() => null)
      if (res?.ok) show("success", `Đã ngắt kết nối ${nameOf(platformId)}.`)
      else show("error", res ? await errorMessage(res, `Không ngắt kết nối được ${nameOf(platformId)}.`) : `Không kết nối được dịch vụ đăng bài.`)
    })

  return { accounts, loadState, refreshing, actionLoading, notice, reload, login, save, check, disconnect }
}
