/**
 * TIER GOVERNANCE MATRIX CLIENT
 *
 * Client Component dùng chung cho cả 3 tầng dưới:
 * - SaaS Ngành (INDUSTRY)
 * - ChainOS (CHAIN)
 * - StoreOS (STORE)
 *
 * Tự động phân cấp:
 * - Khóa cứng nếu tầng trên (Mother / Chain) đã khóa
 * - Hiển thị badge nguồn gốc kế thừa
 * - Cho phép Admin Chuỗi / Ngành đặt khóa cứng xuống đơn vị trực thuộc
 * - Cho phép Điểm bán (Store) ghi đè Delta cục bộ hoặc bấm Reset về mặc định
 */
"use client"

import { PreviewNotice } from "@/components/ui/preview-notice"
import { useState } from "react"
import { GovernanceMatrixTable } from "@/components/governance/governance-matrix-table"
import type {
  GovernanceMatrixState,
  GovernanceMatrixGroup,
  GovernanceViewerTier,
} from "@/components/governance/governance-matrix-types"
import {
  buildSSOTGovernanceGroups,
  type GovernanceSystemKey,
} from "./governance-catalog-registry"
import { useSession } from "@/lib/session"

interface TierGovernanceMatrixClientProps {
  systemKey: GovernanceSystemKey
  title: string
  description: string
}

export function TierGovernanceMatrixClient({
  systemKey,
  title,
  description,
}: TierGovernanceMatrixClientProps) {
  const { organizationType, organization } = useSession()

  const viewerTier: GovernanceViewerTier =
    organizationType === "INDUSTRY"
      ? "INDUSTRY"
      : organizationType === "CHAIN" || organizationType === "HEADQUARTERS"
      ? "CHAIN"
      : "STORE"

  const canManageHardLocks = viewerTier === "CHAIN" || viewerTier === "INDUSTRY"

  // Đọc dữ liệu trực tiếp từ SSOT Governance Catalog Registry theo đúng ngành của tiệm
  const [groups, setGroups] = useState<GovernanceMatrixGroup[]>(() =>
    buildSSOTGovernanceGroups({
      systemKey,
      viewerTier,
      industryKey: organization?.industry ?? "FLORAL",
      storePoliciesRaw: null,
    })
  )

  const currentState: GovernanceMatrixState = {
    systemKey,
    systemTitle: title,
    viewerTier,
    scopeId: organization?.id ?? "CURRENT_ORG",
    groups,
    totalItems: groups.reduce((acc, g) => acc + g.items.length, 0),
    lockedCount: groups.reduce(
      (acc, g) => acc + g.items.filter((i) => i.isLocked).length,
      0
    ),
    overrideCount: groups.reduce(
      (acc, g) => acc + g.items.filter((i) => i.hasLocalOverride).length,
      0
    ),
    loading: false,
    error: null,
  }

  async function handleToggleItem(key: string, enabled: boolean) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === key ? { ...item, enabled, hasLocalOverride: true } : item
        ),
      }))
    )
  }

  async function handleResetItem(key: string) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === key
            ? { ...item, hasLocalOverride: false, decidedBy: "INDUSTRY" }
            : item
        ),
      }))
    )
  }

  async function handleToggleLock(key: string, locked: boolean) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === key
            ? {
                ...item,
                isLocked: locked,
                hardLockedBy: locked ? viewerTier : null,
                isOwnHardLock: locked,
                lockReason: locked ? `Khóa cứng bởi ${viewerTier}` : undefined,
              }
            : item
        ),
      }))
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-6">
      <div>
        <h1 className="text-display font-extrabold text-text">{title}</h1>
        <p className="text-body-sm text-text-muted mt-1">{description}</p>
      </div>

      <PreviewNotice>Thay đổi trên ma trận này chưa được lưu và chưa áp vào giá, thanh toán hay chính sách đơn hàng — tải lại trang sẽ trở về mặc định.</PreviewNotice>

      <GovernanceMatrixTable
        state={currentState}
        canManageHardLocks={canManageHardLocks}
        onToggleItem={handleToggleItem}
        onResetItem={handleResetItem}
        onToggleLock={handleToggleLock}
      />
    </div>
  )
}
