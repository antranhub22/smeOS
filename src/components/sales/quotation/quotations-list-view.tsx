"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Copy, ExternalLink, RefreshCw, Send, ShoppingBag } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { InlineError } from "@/components/ui/inline-error"
import { formatCurrency, formatDate } from "@/lib/i18n/formatters"
import { QUOTATION_STATUS_LABELS } from "@/modules/sales/domain/quotation"
import { quotationApi } from "./quotation-api"
import type { QuotationRecord } from "./quotation-types"

interface QuotationsListViewProps {
  onSelectQuotation?: (quote: QuotationRecord) => void
}

export function QuotationsListView({ onSelectQuotation }: QuotationsListViewProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [quotations, setQuotations] = useState<QuotationRecord[]>([])
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadQuotations = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await quotationApi.list(statusFilter)
      setQuotations(res.data || [])
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Chưa tải được danh sách báo giá")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuotations()
  }, [statusFilter])

  const handleCopyLink = (code: string, id: string) => {
    const url = `${window.location.origin}/bg/${code.toLowerCase()}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleConvertToOrder = async (quote: QuotationRecord) => {
    setConvertingId(quote.id)
    try {
      const res = await quotationApi.convertToOrder(quote.id)
      await loadQuotations()
      router.push(`/don-hang`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Chưa thể chuyển báo giá thành đơn hàng")
    } finally {
      setConvertingId(null)
    }
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Filter Tabs */}
      <Card className="p-3 bg-surface border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "DRAFT", label: "Bản nháp" },
            { id: "SENT", label: "Đã gửi" },
            { id: "ACCEPTED", label: "Khách đồng ý" },
            { id: "CONVERTED", label: "Đã tạo đơn" },
            { id: "EXPIRED", label: "Hết hạn" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface border border-border text-text hover:bg-surface-alt"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadQuotations}
          className="flex items-center gap-1.5 text-caption text-text-muted"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </Button>
      </Card>

      {errorMsg && <InlineError message={errorMsg} onRetry={loadQuotations} />}

      {loading ? (
        <SkeletonBlock lines={4} label="Đang tải danh sách báo giá..." />
      ) : quotations.length === 0 ? (
        <EmptyState
          title="Chưa có báo giá nào"
          reason="Tạo báo giá gửi khách hoặc đối tác để theo dõi và chuyển đổi thành đơn hàng."
        />
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => {
            const isConverted = q.status === "CONVERTED"
            return (
              <Card
                key={q.id}
                className="p-4 bg-surface border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-text-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-bold text-primary">{q.code}</span>
                    <Badge
                      tone={
                        q.status === "CONVERTED" || q.status === "ACCEPTED"
                          ? "success"
                          : q.status === "EXPIRED" || q.status === "REJECTED"
                          ? "danger"
                          : "neutral"
                      }
                      className="text-caption"
                    >
                      {QUOTATION_STATUS_LABELS[q.status] ?? q.status}
                    </Badge>
                  </div>
                  <div className="text-caption text-text-muted">
                    Ngày tạo: {formatDate(q.createdAt)}
                    {q.validUntil && ` • Hạn: ${formatDate(q.validUntil)}`}
                  </div>
                  <div className="text-caption text-text">
                    {q.items.length} sản phẩm:{" "}
                    <span className="text-text-muted">
                      {q.items.map((it) => `${it.name} (x${it.qty})`).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-body-sm font-extrabold text-primary">
                    {formatCurrency(q.totalAmount)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(q.code, q.id)}
                      className="flex items-center gap-1 text-caption"
                    >
                      {copiedId === q.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-text-muted" />
                          <span>Link gửi</span>
                        </>
                      )}
                    </Button>

                    <Link
                      href={`/bg/${q.code.toLowerCase()}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-alt flex items-center gap-1 text-caption text-text font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                      <span>Xem</span>
                    </Link>

                    {!isConverted && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={convertingId === q.id}
                        onClick={() => handleConvertToOrder(q)}
                        className="flex items-center gap-1 text-caption"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{convertingId === q.id ? "Đang tạo..." : "Tạo đơn"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
