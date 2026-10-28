/**
 * CLIENT QUẢN TRỊ MA TRẬN 4 TẦNG — SAAS MOTHER (CONSOLE VẬN HÀNH)
 * Kết nối trực tiếp với Governance Catalog Registry SSOT
 */
"use client"

import { PreviewNotice } from "@/components/ui/preview-notice"
import { useState } from "react"
import { GovernanceMatrixTable } from "@/components/governance/governance-matrix-table"
import { useI18n } from "@/lib/i18n"
import type { GovernanceMatrixState, GovernanceMatrixGroup } from "@/components/governance/governance-matrix-types"
import {
  buildSSOTGovernanceGroups,
  type GovernanceSystemKey,
} from "./governance-catalog-registry"

type MatrixTab = "PROMOTIONS" | "COMMITMENTS" | "POLICIES" | "PAYMENTS" | "CRAFT_FEES"

interface MotherGovernanceMatrixClientProps {
  defaultTab?: MatrixTab | undefined
}

export function MotherGovernanceMatrixClient({
  defaultTab = "PROMOTIONS",
}: MotherGovernanceMatrixClientProps) {
  const { t, dict } = useI18n()
  const [activeTab] = useState<MatrixTab>(defaultTab)

  // Kết nối trực tiếp với SSOT Governance Catalog Registry (Zero hardcode)
  const [matrixData, setMatrixData] = useState<Record<MatrixTab, GovernanceMatrixGroup[]>>({
    PROMOTIONS: buildSSOTGovernanceGroups({ systemKey: "PROMOTIONS", viewerTier: "MOTHER", industryKey: "FLORAL" }),
    COMMITMENTS: buildSSOTGovernanceGroups({ systemKey: "COMMITMENTS", viewerTier: "MOTHER", industryKey: "FLORAL" }),
    POLICIES: buildSSOTGovernanceGroups({ systemKey: "POLICIES", viewerTier: "MOTHER", industryKey: "FLORAL" }),
    PAYMENTS: buildSSOTGovernanceGroups({ systemKey: "PAYMENTS", viewerTier: "MOTHER", industryKey: "FLORAL" }),
    CRAFT_FEES: buildSSOTGovernanceGroups({ systemKey: "CRAFT_FEES", viewerTier: "MOTHER", industryKey: "FLORAL" }),
  })

  const currentGroups = matrixData[activeTab]

  const currentState: GovernanceMatrixState = {
    systemKey: activeTab,
    systemTitle: activeTab,
    viewerTier: "MOTHER",
    scopeId: "GLOBAL",
    groups: currentGroups,
    totalItems: currentGroups.reduce((acc, g) => acc + g.items.length, 0),
    lockedCount: currentGroups.reduce(
      (acc, g) => acc + g.items.filter((i) => i.isLocked).length,
      0
    ),
    overrideCount: currentGroups.reduce(
      (acc, g) => acc + g.items.filter((i) => i.hasLocalOverride).length,
      0
    ),
    loading: false,
    error: null,
  }

  async function handleToggleItem(key: string, enabled: boolean) {
    setMatrixData((prev) => {
      const groups = prev[activeTab].map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === key ? { ...item, enabled } : item
        ),
      }))
      return { ...prev, [activeTab]: groups }
    })
  }

  async function handleToggleLock(key: string, locked: boolean) {
    setMatrixData((prev) => {
      const groups = prev[activeTab].map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === key
            ? {
                ...item,
                isLocked: locked,
                hardLockedBy: locked ? "MOTHER" : null,
                isOwnHardLock: locked,
                lockReason: locked ? "Khóa cứng bởi Quản trị viên Nền tảng" : undefined,
              }
            : item
        ),
      }))
      return { ...prev, [activeTab]: groups }
    })
  }

  const pageTitleMap: Record<MatrixTab, { title: string; desc: string }> = {
    PROMOTIONS: {
      title: "Ma Trận Ưu Đãi & Khuyến Mãi (SaaS Mother)",
      desc: "Thiết lập trần chiết khấu tối đa toàn sàn, quy định voucher và chính sách ưu đãi phân tầng 4 cấp.",
    },
    COMMITMENTS: {
      title: "Ma Trận Cam Kết Chất Lượng (SaaS Mother)",
      desc: "Thiết lập tiêu chuẩn SOP kiểm duyệt chất lượng, bắt buộc chụp ảnh nghiệm thu thành phẩm trước khi xuất xưởng.",
    },
    POLICIES: {
      title: "Ma Trận Chính Sách & Thỏa Thuận (SaaS Mother)",
      desc: "Quy định điều khoản dịch vụ nền tảng, chính sách đổi trả hàng hóa và SLA xử lý khiếu nại trong 24h.",
    },
    PAYMENTS: {
      title: "Ma Trận Thanh Toán & Đặt Cọc (SaaS Mother)",
      desc: "Quản trị danh mục kênh thanh toán VietQR động, trần sàn đặt cọc tối thiểu cho đơn làm theo yêu cầu.",
    },
    CRAFT_FEES: {
      title: "Ma Trận Phí Gia Công & Thợ (SaaS Mother)",
      desc: "Sàn tiền công tối thiểu và trần khấu trừ phạt lỗi gia công tối đa 30% nhằm bảo vệ quyền lợi người thợ.",
    },
  }

  const currentInfo = pageTitleMap[activeTab]

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-6">
      {/* Page Header chuyên biệt cho từng ma trận */}
      <div>
        <h1 className="text-display font-extrabold text-text">
          {currentInfo.title}
        </h1>
        <p className="text-body-sm text-text-muted mt-1">
          {currentInfo.desc}
        </p>
      </div>

      <PreviewNotice>Thay đổi trên ma trận này chưa được lưu và chưa áp vào giá, thanh toán hay chính sách đơn hàng — tải lại trang sẽ trở về mặc định.</PreviewNotice>

      {/* Bảng Ma Trận Quản Trị Tương Ứng — Hoàn toàn đọc từ SSOT Registry */}
      <GovernanceMatrixTable
        state={currentState}
        canManageHardLocks={true}
        onToggleItem={handleToggleItem}
        onToggleLock={handleToggleLock}
      />
    </div>
  )
}
