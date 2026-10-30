"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plug } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InlineError } from "@/components/ui/inline-error"
import { EmptyState } from "@/components/ui/empty-state"
import { FeatureGuidanceCard } from "@/components/ui/feature-guidance-card"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { CATEGORY_ORDER, type ConnectorCategory } from "@/modules/integration-hub/domain/connector-manifest"
import type { CatalogItem, IntegrationHubView } from "@/modules/integration-hub/use-cases/get-integration-hub"
import type { ConnectionView } from "@/modules/integration-hub/infra/connection-repository"
import { ConnectorCard } from "./connector-card"
import { ConnectDialog } from "./connect-dialog"
import { ConnectionDetailDialog } from "./connection-detail-dialog"
import { integrationApi } from "./integration-api"
import { CATEGORY_LABEL, STATUS_LABEL } from "./integration-labels"

/**
 * Trung tâm Tích hợp (archetype B — danh sách + chi tiết). L0: tổng quan và kết nối đang có;
 * L1: danh mục theo nhóm; L2: hộp kết nối; L3: chi tiết kết nối. Lỗi và "cần xử lý" luôn hiện.
 */
export function IntegrationsHubClient() {
  const [hub, setHub] = useState<IntegrationHubView | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [category, setCategory] = useState<ConnectorCategory | "ALL">("ALL")
  const [connecting, setConnecting] = useState<CatalogItem | null>(null)
  const [selected, setSelected] = useState<ConnectionView | null>(null)
  const [confirm, confirmDialog] = useConfirmDialog()

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      setHub(await integrationApi.hub())
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Không tải được danh sách tích hợp")
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu từ API khi mount; setState nằm trong hàm tải (nợ #149)
    void load()
  }, [load])

  const labelOf = useMemo(() => new Map((hub?.catalog ?? []).map((c) => [c.key, c.label])), [hub])
  const categories = CATEGORY_ORDER.filter((c) => hub?.catalog.some((item) => item.category === c))
  const visible = (hub?.catalog ?? []).filter((item) => category === "ALL" || item.category === category)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <PageHeader
        title="Tích hợp"
        description="Kết nối cửa hàng với kênh bán hàng, mạng xã hội, thanh toán và các dịch vụ bên ngoài tại một nơi."
      />
      <FeatureGuidanceCard
        badgeLabel="HƯỚNG DẪN"
        title="Chọn dịch vụ, kết nối, rồi theo dõi tại đây"
        description="Mỗi kết nối hiện trạng thái hoạt động và dữ liệu nhận về. Khi kết nối hết hạn hoặc lỗi, bạn sẽ nhận thông báo."
        tips={["Dịch vụ ghi 'Đang dùng ở màn hình cũ' vẫn chạy bình thường — sẽ được chuyển dần về đây."]}
        guidanceId="integrations-hub"
      />

      {loadError && <InlineError message={loadError} onRetry={() => void load()} />}

      {hub && (
        <section aria-label="Tổng quan" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OverviewTile label="Đang hoạt động" value={hub.overview.active} />
          <OverviewTile label="Cần xử lý" value={hub.overview.needsAttention} alert={hub.overview.needsAttention > 0} />
          <OverviewTile label="Dữ liệu lỗi 24 giờ qua" value={hub.overview.failedEvents24h} alert={hub.overview.failedEvents24h > 0} />
        </section>
      )}

      {hub && hub.connections.length > 0 && (
        <section aria-label="Kết nối của bạn" className="space-y-3">
          <h2 className="text-title font-bold text-text">Kết nối của bạn</h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {hub.connections.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-text">{c.displayName}</p>
                  <p className="text-sm text-text-muted">{labelOf.get(c.connectorKey) ?? "Dịch vụ ngoài"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_LABEL[c.status].tone}>{STATUS_LABEL[c.status].text}</Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                    Xem chi tiết
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hub && (
        <section aria-label="Danh mục tích hợp" className="space-y-3">
          <h2 className="text-title font-bold text-text">Danh mục tích hợp</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo nhóm">
            {(["ALL", ...categories] as const).map((c) => (
              <Button
                key={c}
                size="xs"
                variant={category === c ? "primary" : "outline"}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === "ALL" ? "Tất cả" : CATEGORY_LABEL[c]}
              </Button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={Plug} title="Chưa có dịch vụ nào trong nhóm này" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <ConnectorCard key={item.key} item={item} onConnect={setConnecting} />
              ))}
            </div>
          )}
        </section>
      )}

      <ConnectDialog
        item={connecting}
        onClose={() => setConnecting(null)}
        onConnected={() => {
          setConnecting(null)
          void load()
        }}
        askConfirm={confirm}
      />
      <ConnectionDetailDialog
        key={selected?.id ?? "none"}
        connection={selected}
        connectorLabel={selected ? (labelOf.get(selected.connectorKey) ?? "Dịch vụ ngoài") : ""}
        onClose={() => setSelected(null)}
        onChanged={() => void load()}
        askConfirm={confirm}
      />
      {confirmDialog}
    </div>
  )
}

function OverviewTile({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={alert ? "text-2xl font-bold text-danger-text" : "text-2xl font-bold text-text"}>{value}</p>
    </div>
  )
}
