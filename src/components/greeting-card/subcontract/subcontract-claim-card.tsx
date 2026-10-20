"use client"

import React from "react"
import { SubcontractSpotlightShell } from "./subcontract-spotlight-shell"
import type { SubcontractDispatchStatus } from "@/modules/greeting-card/domain/subcontract-order"

export interface SubcontractCardProduct {
  name: string
  imageUrl?: string | null
  bomItems?: Array<{ name: string; quantity: number; unit: string; role?: string }>
}

export interface SubcontractClaimCardProps {
  orderCode: string
  branchId: string
  branchName: string
  product: SubcontractCardProduct
  deliveryAddress: string
  deliveryTime: string
  recipientName?: string | null | undefined
  recipientPhone?: string | null | undefined
  isPhoneMasked?: boolean | undefined
  cardMessage?: string | null | undefined
  specialNotes?: string | null | undefined
  subcontractPriceVnd: number
  dispatchStatus: SubcontractDispatchStatus
  claimedByBranchId?: string | null | undefined
  claimedBranchName?: string | null | undefined
  graceExpiresAt?: string | null | undefined
  productionStatus?: string | null | undefined
  qcPhotos?: string[] | undefined
  onClaim: () => Promise<void>
  onCancelClaim: () => Promise<void>
  onCommitEarly?: (() => Promise<void>) | undefined
  onQcUploaded?: (() => void) | undefined
}

/**
 * Thẻ Tiếp nhận Gia công Chuỗi theo chuẩn Spotlight (Forwarder component cho SubcontractSpotlightShell).
 */
export function SubcontractClaimCard(props: SubcontractClaimCardProps) {
  return <SubcontractSpotlightShell {...props} />
}
