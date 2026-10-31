"use client"

import { useEffect, useState } from "react"
import { Disclosure } from "@/components/ui/disclosure"
import { InlineError } from "@/components/ui/inline-error"
import { useSession } from "@/lib/session"
import type { EntryActions, EntryActionsSettings } from "@/modules/orders/domain/entry-actions"
import type { OrderSourceCode } from "@/modules/orders/domain/order-source"

interface SourceRow {
  code: OrderSourceCode
  label: string
  effective: EntryActions
}

interface ViewBody {
  settings: EntryActionsSettings
  sources: SourceRow[]
}

const ENDPOINT = "/api/v1/orders/entry-actions"

/**
 * Điều hành bật/tắt nút "Đặt hàng" và "Liên hệ / Cần tư vấn" trên trang khách, theo từng nguồn
 * (Đơn hàng đa nguồn §3.2). Thu gọn mặc định — chỉ mở khi cần chỉnh (Progressive Disclosure).
 */
export function EntryActionsSettingsPanel() {
  const { can } = useSession()
  const canEdit = can("F2")
  const [data, setData] = useState<ViewBody | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!canEdit) return
    fetch(ENDPOINT)
      .then(async (r) => (r.ok ? ((await r.json()) as ViewBody) : Promise.reject(new Error("Không tải được cài đặt"))))
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [canEdit])

  if (!canEdit) return null

  async function toggle(code: OrderSourceCode, key: keyof EntryActions, value: boolean) {
    if (!data) return
    const bySource = { ...data.settings.bySource, [code]: { ...data.settings.bySource?.[code], [key]: value } }
    setSaving(true)
    try {
      const res = await fetch(ENDPOINT, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data.settings, bySource }) })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string; details?: Record<string, string> } } | null
        throw new Error(Object.values(body?.error?.details ?? {})[0] ?? body?.error?.message ?? "Không lưu được")
      }
      setData((await res.json()) as ViewBody)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Disclosure label="Nút trên trang khách" className="rounded-2xl border border-border bg-surface p-4">
      <p className="mt-2 text-body-sm text-text-muted">
        Chọn nút khách thấy trên từng loại trang. Mỗi trang cần ít nhất một nút. Nút Đặt hàng của catalog và landing page sẽ hoạt động khi chức năng đặt hàng trực tuyến cho các trang này ra mắt.
      </p>
      {error && <div className="mt-3"><InlineError message={error} /></div>}
      {data && (
        <ul className="mt-3 divide-y divide-border">
          {data.sources.map((s) => (
            <li key={s.code} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-body text-text">{s.label}</span>
              <div className="flex gap-4">
                {(["order", "contact"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-body-sm text-text">
                    <input
                      type="checkbox"
                      checked={s.effective[key]}
                      disabled={saving}
                      onChange={(e) => void toggle(s.code, key, e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    {key === "order" ? "Đặt hàng" : "Liên hệ / Cần tư vấn"}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Disclosure>
  )
}
