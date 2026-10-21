"use client"

import { useState } from "react"
import { Database, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoadMockDataButtonProps {
  currentIndustry?: string
  onApplied?: () => void
}

export function LoadMockDataButton({ currentIndustry, onApplied }: LoadMockDataButtonProps) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleApply = async () => {
    if (!confirm("Bạn có chắc chắn muốn nạp dữ liệu mẫu theo ngành cho cửa hàng này? Dữ liệu mẫu sẽ bao gồm: tên cửa hàng, hotline, địa chỉ, logo AI, mô tả và các sản phẩm mẫu.")) {
      return
    }

    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/v1/business-profile/mock-data", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ industry_key: currentIndustry }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Không thể nạp dữ liệu mẫu")
      }

      const json = await res.json()
      setMsg({
        type: "success",
        text: `Đã nạp thành công dữ liệu mẫu cho ngành ${json.data?.industryName || "mới"} (${json.data?.businessName})!`,
      })

      if (onApplied) {
        onApplied()
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi hệ thống"
      setMsg({ type: "error", text: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleApply}
        className="text-xs font-bold gap-1.5 border-dashed border-primary/40 hover:bg-primary/5 text-primary"
        title="Nạp dữ liệu mẫu theo ngành (Logo, Hồ sơ, Sản phẩm)"
      >
        <Database size={13} className={loading ? "animate-spin" : ""} />
        <span>{loading ? "Đang nạp dữ liệu mẫu..." : "Nạp dữ liệu mẫu ngành"}</span>
      </Button>

      {msg && (
        <div
          className={`text-caption p-2 rounded-lg flex items-center gap-1.5 ${
            msg.type === "success"
              ? "bg-success-bg text-primary border border-success-border"
              : "bg-warning-bg text-warning border border-warning/30"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  )
}
