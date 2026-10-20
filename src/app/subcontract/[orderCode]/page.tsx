"use client"

import React, { use, useState } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Shield, AlertCircle } from "lucide-react"
import { SubcontractSpotlightShell } from "@/components/greeting-card/subcontract/subcontract-spotlight-shell"
import type { SubcontractClaimCardProps } from "@/components/greeting-card/subcontract/subcontract-claim-card"
import type { DeliveryProofInfo } from "@/components/greeting-card/subcontract/delivery-proof-card"
import type { SubcontractStepId } from "@/components/greeting-card/subcontract/subcontract-spotlight-stepper"

interface PageProps {
  params: Promise<{ orderCode: string }>
}

import type { StepMilestoneDeadlines } from "@/modules/greeting-card/domain/subcontract-countdown"
import type { StepBypassRequestInfo } from "@/components/greeting-card/subcontract/subcontract-bypass-control"

interface SubcontractPageData extends SubcontractClaimCardProps {
  orderStatus?: string | null
  deliveryStatus?: string | null
  deliveryTimestampMs?: number | null
  stepDeadlines?: StepMilestoneDeadlines | null
  shipperInfo?: {
    shipperName: string
    shipperPhone: string
    submittedAt: string
  } | null
  deliveryProof?: DeliveryProofInfo | null
  bypassRequests?: Record<string, StepBypassRequestInfo> | null
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Không thể tải thông tin đơn gia công")
    return res.json()
  })

export default function SubcontractClaimPage({ params }: PageProps) {
  const { orderCode } = use(params)
  const searchParams = useSearchParams()
  const branchId = searchParams.get("branch") ?? ""

  const action = searchParams.get("action")
  const initialStep: SubcontractStepId | undefined =
    action === "upload_qc" ? 2 : action === "submit_shipper" ? 3 : undefined

  const apiUrl = `/api/v1/public/subcontract/${encodeURIComponent(orderCode)}?branch=${encodeURIComponent(branchId)}`
  const { data, error, mutate, isLoading } = useSWR<{ data: SubcontractPageData }>(apiUrl, fetcher, {
    refreshInterval: 10_000,
  })

  const [actionError, setActionError] = useState<string | null>(null)

  async function handleAction(actionType: "CLAIM" | "CANCEL" | "COMMIT") {
    setActionError(null)
    const res = await fetch(`/api/v1/public/subcontract/${encodeURIComponent(orderCode)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionType, branchId }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = body?.error?.message || body?.message || "Thao tác không thành công"
      throw new Error(msg)
    }
    await mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg h-96 rounded-2xl bg-surface-muted animate-pulse border border-border" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface p-6 rounded-2xl border border-border shadow-md text-center flex flex-col items-center gap-3">
          <AlertCircle size={40} className="text-danger" />
          <h2 className="text-title font-bold text-foreground">Không tìm thấy đơn gia công</h2>
          <p className="text-caption text-text-muted">
            Đơn hàng #{orderCode} không tồn tại hoặc đã hết hạn điều phối trên hệ thống.
          </p>
        </div>
      </div>
    )
  }

  const orderData = data.data

  return (
    <div className="min-h-screen bg-background py-8 px-4 flex flex-col items-center justify-center">
      <header className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-caption font-bold mb-2">
          <Shield size={14} /> Hệ Thống Điều Phối Chuỗi smeOS
        </div>
        <h1 className="text-title-lg font-black text-foreground">
          Tiếp Nhận Đơn Hàng Gia Công
        </h1>
        <p className="text-caption text-text-muted mt-1">
          {orderData.branchName ? `Chi nhánh: ${orderData.branchName}` : "Vui lòng kiểm tra và tiếp nhận đơn hàng"}
        </p>
      </header>

      {actionError && (
        <div className="w-full max-w-lg mb-4 p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm font-semibold text-center">
          {actionError}
        </div>
      )}

      {/* Thẻ tiếp nhận gia công chuẩn hóa theo kiến trúc Spotlight 4 công đoạn */}
      <SubcontractSpotlightShell
        orderCode={orderData.orderCode}
        branchId={branchId}
        branchName={orderData.branchName || "Chi nhánh"}
        product={orderData.product}
        deliveryAddress={orderData.deliveryAddress}
        deliveryTime={orderData.deliveryTime}
        deliveryTimestampMs={orderData.deliveryTimestampMs}
        stepDeadlines={orderData.stepDeadlines}
        recipientName={orderData.recipientName}
        recipientPhone={orderData.recipientPhone}
        isPhoneMasked={orderData.isPhoneMasked}
        cardMessage={orderData.cardMessage}
        specialNotes={orderData.specialNotes}
        subcontractPriceVnd={orderData.subcontractPriceVnd}
        dispatchStatus={orderData.dispatchStatus}
        claimedByBranchId={orderData.claimedByBranchId}
        claimedBranchName={orderData.claimedBranchName}
        graceExpiresAt={orderData.graceExpiresAt}
        productionStatus={orderData.productionStatus}
        qcPhotos={orderData.qcPhotos}
        deliveryStatus={orderData.deliveryStatus}
        orderStatus={orderData.orderStatus}
        shipperInfo={orderData.shipperInfo}
        deliveryProof={orderData.deliveryProof}
        bypassRequests={orderData.bypassRequests}
        initialStep={initialStep}
        onClaim={() => handleAction("CLAIM")}
        onCancelClaim={() => handleAction("CANCEL")}
        onCommitEarly={() => handleAction("COMMIT")}
        onQcUploaded={() => mutate()}
        onShipperSubmitted={() => mutate()}
        onDelivered={() => mutate()}
        onBypassRequested={() => mutate()}
      />
    </div>
  )
}
