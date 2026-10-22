import { z } from "zod"
import { unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { ChainBranchRepository } from "@/modules/greeting-card/infra/chain-branch-repository"
import { loadSubcontractOrderForBranch } from "@/modules/greeting-card/use-cases/authorize-subcontract-branch"
import { subcontractBranchUrl } from "@/modules/greeting-card/infra/subcontract-link-token"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import {
  cancelClaimSubcontractUseCase,
  claimSubcontractUseCase,
} from "@/modules/greeting-card/use-cases/handle-subcontract-claim"
import { commitSubcontractOrder } from "@/modules/greeting-card/domain/subcontract-order"
import { parseChainDispatchPolicy, renderDispatchMessage } from "@/modules/greeting-card/domain/chain-dispatch-policy"
import { signSubcontractPhoto } from "@/modules/greeting-card/use-cases/sign-subcontract-photo"
import { formatDeliveryAddress, extractRecipientInfo } from "@/modules/greeting-card/domain/delivery-address"
import { SubcontractStepStore } from "@/modules/greeting-card/infra/subcontract-step-store"
import type { TenantContext } from "@/core/tenancy"

const actionSchema = z.object({
  action: z.enum(["CLAIM", "CANCEL", "COMMIT", "DELETE_QC"]),
  branchId: z.string().min(1),
  photoUrl: z.string().optional(),
})

/**
 * GET /api/v1/public/subcontract/[orderCode]?branch=[branchId]
 * Công khai: Chi nhánh bấm vào link nhận đơn để xem Thẻ Gia Công.
 */
export const GET = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-view", limit: 120, windowMs: 60_000 })
  const { orderCode } = await context.params
  const url = new URL(request.url)
  const branchId = url.searchParams.get("branch")

  const repo = new SubcontractOrderRepository()
  const order = await loadSubcontractOrderForBranch(request, orderCode, branchId, repo)

  // Kiểm tra chi nhánh có thuộc cùng tổ chức với đơn hàng hay không
  let branchName = ""
  if (branchId) {
    const branch = await repo.findBranchInOrganization(branchId, order.organization_id)
    if (branch) branchName = branch.name
  }

  const coordMeta = (order.coordination?.metadata as Record<string, unknown> | null) ?? {}
  const subState = coordMeta.subcontract_dispatch as Record<string, unknown> | undefined

  const pricingRef = (order.pricing_rule_ref as Record<string, unknown> | null) ?? {}
  const total = Number(order.total_vnd)
  const defaultSubcontractPrice = Math.round(total * 0.5) // SSOT: Chuẩn hoá 50% thù lao gia công mặc định
  const subcontractPriceVnd =
    typeof subState?.subcontractPriceVnd === "number"
      ? (subState.subcontractPriceVnd as number)
      : typeof pricingRef.subcontract_price_vnd === "number"
      ? (pricingRef.subcontract_price_vnd as number)
      : defaultSubcontractPrice

  const firstItem = order.items[0]
  const session = order.greeting_sessions[0]
  const snapshot = (session?.product_snapshot as Record<string, unknown> | null) ?? {}
  const firstItemMeta = (firstItem?.metadata as Record<string, unknown> | null) ?? {}

  const productName = firstItem?.description || (snapshot.name as string | undefined) || "Sản phẩm đặt gia công"
  // URL công khai đã cấu hình, không tin header Host do client gửi (rà soát M7)
  const baseOrigin = process.env.NEXT_PUBLIC_APP_URL || url.origin

  const { resolveSubcontractSamplePhoto } = await import("@/modules/greeting-card/use-cases/resolve-subcontract-sample-photo")
  const productImageUrl = await resolveSubcontractSamplePhoto(order, { baseUrl: baseOrigin })

  const deliveryWindow = (order.delivery_window as Record<string, unknown> | null) ?? {}
  const deliveryAddress = formatDeliveryAddress(order.delivery_address)
  const recipientInfo = extractRecipientInfo(order.delivery_address)
  const isReadyForDelivery =
    order.production_status === "READY" ||
    order.delivery_status === "DELIVERING" ||
    order.delivery_status === "DELIVERED"
  const recipientPhone = isReadyForDelivery ? recipientInfo.phone : recipientInfo.maskedPhone
  const deliveryTime = typeof deliveryWindow.timeSlot === "string" && typeof deliveryWindow.date === "string"
    ? `${deliveryWindow.timeSlot} ngày ${deliveryWindow.date}`
    : "Giao trong ngày"

  const rawQcPhotos = Array.isArray(coordMeta.qc_photos) ? (coordMeta.qc_photos as string[]) : []
  const rawPodPhotos = Array.isArray(coordMeta.pod_photos) ? (coordMeta.pod_photos as string[]) : []
  const resolvedQcPhotos = await Promise.all(rawQcPhotos.map(signSubcontractPhoto))
  const resolvedPodPhotos = await Promise.all(rawPodPhotos.map(signSubcontractPhoto))

  const rawPodProof = coordMeta.delivery_proof as
    | { note?: string; deliveredAt?: string; deliveredByBranch?: string }
    | undefined

  const { workshopNoteOf } = await import("@/modules/greeting-card/domain/order-slip-extras")
  const specialNotes = workshopNoteOf(order.internal_note)
  const {
    parseDeliveryTimestampMs,
    calculateStepMilestoneDeadlines,
  } = await import("@/modules/greeting-card/domain/subcontract-countdown")

  const deliveryTimestampMs = parseDeliveryTimestampMs(
    typeof deliveryWindow.date === "string" ? deliveryWindow.date : null,
    typeof deliveryWindow.timeSlot === "string" ? deliveryWindow.timeSlot : null
  )

  const stepDeadlines = calculateStepMilestoneDeadlines({
    deliveryTimestampMs,
    graceExpiresAt: subState?.graceExpiresAt as string | undefined,
  })

  return jsonResponse({
    data: {
      orderId: order.id,
      orderCode: order.code,
      branchId: branchId ?? "",
      branchName,
      product: {
        name: productName,
        imageUrl: productImageUrl,
        bomItems: (pricingRef.bom_items as Array<{ name: string; quantity: number; unit: string }>) || [],
      },
      deliveryAddress,
      deliveryTime,
      deliveryTimestampMs,
      stepDeadlines,
      recipientName: recipientInfo.recipientName,
      recipientPhone,
      isPhoneMasked: !isReadyForDelivery,
      cardMessage: order.card_message ?? null,
      specialNotes,
      subcontractPriceVnd,
      dispatchStatus: subState?.dispatchStatus ?? "OPEN",
      claimedByBranchId: subState?.claimedBranchId ?? null,
      claimedBranchName: subState?.claimedBranchName ?? null,
      graceExpiresAt: subState?.graceExpiresAt ?? null,
      productionStatus: order.production_status,
      deliveryStatus: order.delivery_status,
      orderStatus: order.status,
      qcPhotos: resolvedQcPhotos,
      lastAiVerification: coordMeta.last_ai_verification ?? null,
      autoBypassedCoordinator: Boolean(coordMeta.auto_bypassed_coordinator),
      bypassRequests: (coordMeta.bypass_requests as Record<string, unknown> | undefined) ?? null,
      shipperInfo: (coordMeta.shipper_info as { shipperName: string; shipperPhone: string; submittedAt: string } | undefined) ?? null,
      deliveryProof: rawPodProof
        ? {
            photoUrls: resolvedPodPhotos,
            note: rawPodProof.note || null,
            deliveredAt: rawPodProof.deliveredAt || null,
            deliveredByBranch: rawPodProof.deliveredByBranch || null,
          }
        : null,
    },
  })
})

/**
 * POST /api/v1/public/subcontract/[orderCode]
 * Thao tác trên Thẻ Gia Công: TIẾP NHẬN, HỦY TRONG HẠN, hoặc XÁC NHẬN LÀM NGAY.
 */
export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-action", limit: 30, windowMs: 60_000 })
  const { orderCode } = await context.params

  const body = await request.json().catch(() => ({}))
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const { action, branchId } = parsed.data
  const repo = new SubcontractOrderRepository()
  const order = await loadSubcontractOrderForBranch(request, orderCode, branchId, repo)

  // Xác thực chi nhánh hợp lệ thuộc tổ chức
  const branch = await repo.findBranchInOrganization(branchId, order.organization_id)
  if (!branch) throw unprocessable("Chi nhánh không hợp lệ hoặc không thuộc hệ thống.")

  const org = await repo.findOrganizationSettings(order.organization_id)

  const ctx: TenantContext = {
    organizationId: order.organization_id,
    workspaceId: "default",
    userId: `branch_${branch.id}`,
    branchId: branch.id,
    capabilities: new Set(),
  }

  const notifier = new MultiChannelDispatchNotifier()

  if (action === "CLAIM") {
    const { resolveSubcontractSamplePhoto } = await import("@/modules/greeting-card/use-cases/resolve-subcontract-sample-photo")
    const sampleImageUrl = await resolveSubcontractSamplePhoto(order)

    const reqUrl = new URL(request.url)
    const result = await claimSubcontractUseCase(
      ctx,
      {
        orderId: order.id,
        branchId: branch.id,
        branchName: branch.name,
        shopSettings: org?.settings,
        baseUrl: reqUrl.origin,
        productImageUrl: sampleImageUrl,
      },
      repo,
      notifier,
      [{
        branchId: branch.id,
        branchName: branch.name,
        qualityScore: 100,
        activeJobsCount: 0,
        maxConcurrentJobs: 10,
        isActive: true,
        // Kênh liên lạc của chi nhánh chuỗi — thiếu thì tin xác nhận nhận đơn không gửi được
        channels: (await new ChainBranchRepository().findByCode(order.organization_id, branch.id))?.channels,
      }]
    )
    return jsonResponse({ data: result })
  }

  if (action === "CANCEL") {
    const result = await cancelClaimSubcontractUseCase(
      ctx,
      { orderId: order.id, branchId: branch.id },
      repo,
      new Date(),
      notifier
    )

    // Đánh giá chất lượng dịch vụ: Trừ điểm KPI chi nhánh vì đã hủy nhận đơn
    const penalty = await new ChainBranchRepository().applyPenalty(order.organization_id, branch.id, "CANCELLATION",
      `Hủy nhận đơn #${order.code} trong hạn kiểm tra kho (Kho thiếu hoa/nguyên liệu)`)

    return jsonResponse({
      data: {
        ...result,
        penalty: {
          penalized: true,
          scoreDeducted: 2,
          currentQualityScore: penalty.newQualityScore,
          totalCancellations: penalty.count,
        },
      },
    })
  }

  if (action === "COMMIT") {
    const currentState = await repo.loadSubcontractState(ctx, order.id)
    if (!currentState || currentState.claimedBranchId !== branch.id) {
      throw unprocessable("Không thể chốt đơn khi bạn chưa tiếp nhận.")
    }
    const nextState = commitSubcontractOrder(currentState)

    // Bắn tin nhắn M1: Bắt đầu chế tác cho chi nhánh vừa chốt
    const policy = parseChainDispatchPolicy(org?.settings as Record<string, unknown> | null | undefined)
    const deliveryWindow = (order.delivery_window as Record<string, unknown> | null) ?? {}
    const deliveryTime = typeof deliveryWindow.timeSlot === "string" && typeof deliveryWindow.date === "string"
      ? `${deliveryWindow.timeSlot} ngày ${deliveryWindow.date}`
      : "Giao trong ngày"

    const prepMsg = renderDispatchMessage(policy.messageTemplates.prepReminder, {
      orderCode: order.code,
      branchName: branch.name,
      deliveryTime,
      claimUrl: subcontractBranchUrl({
        baseUrl: request.headers.get("origin") || "",
        organizationId: order.organization_id,
        orderCode: order.code,
        branchId: branch.id,
      }),
    })

    const branchCandidate = {
      branchId: branch.id,
      branchName: branch.name,
      qualityScore: 100,
      activeJobsCount: 0,
      maxConcurrentJobs: 10,
      isActive: true,
      channels: {
        telegramChatId: (await new ChainBranchRepository().findByCode(order.organization_id, branch.id))?.channels?.telegramChatId,
      },
    }

    await notifier.sendSubcontractInvite(ctx, {
      branch: branchCandidate,
      orderCode: order.code,
      messageText: prepMsg,
      claimUrl: "",
    })

    // Tự động gửi tin nhắn thông báo xác nhận đơn cho Khách hàng
    const customerPhone = order.customer?.phone || (order.greeting_sessions?.[0] as Record<string, unknown> | undefined)?.customer_phone as string | undefined
    const customerName = order.customer?.name || (order.greeting_sessions?.[0] as Record<string, unknown> | undefined)?.customer_name as string | undefined || "Quý khách"

    const customerNoticeText = `🌸 [SMEOS] Xin chào ${customerName}!\nĐơn hàng #${order.code} của bạn đã được ${branch.name} chính thức tiếp nhận và đang tiến hành chế tác.\n⏰ Hẹn giao: ${deliveryTime}.\nCảm ơn bạn đã tin tưởng dịch vụ!`

    if (customerPhone) {
      // Gửi thông báo cho khách hàng qua kênh notifier đa kênh
      await notifier.sendSubcontractInvite(ctx, {
        branch: {
          branchId: `cust_${customerPhone}`,
          branchName: customerName,
          qualityScore: 100,
          activeJobsCount: 0,
          maxConcurrentJobs: 1,
          isActive: true,
          channels: {
            phone: customerPhone,
            zaloPhone: customerPhone,
          },
        },
        orderCode: order.code,
        messageText: customerNoticeText,
        claimUrl: "",
      }).catch(() => { /* Không chặn luồng nếu khách không có Zalo */ })
    }

    const finalState = {
      ...nextState,
      remindersSent: {
        ...(nextState.remindersSent ?? {}),
        M1_PREP: new Date().toISOString(),
        CUSTOMER_CONFIRMATION: new Date().toISOString(),
      },
    }

    await repo.saveSubcontractState(ctx, finalState)
    return jsonResponse({ data: { success: true, dispatchStatus: finalState.dispatchStatus } })
  }

  if (action === "DELETE_QC") {
    const photoToDelete = parsed.data.photoUrl
    if (!photoToDelete) {
      throw validationFailed({ photoUrl: "Thiếu thông tin ảnh cần xóa" })
    }
    const qcState = await repo.loadSubcontractState(ctx, order.id)
    if (!qcState || qcState.claimedBranchId !== branch.id) {
      throw unprocessable("Chỉ chi nhánh đã nhận đơn mới được xoá ảnh thành phẩm.")
    }

    const store = new SubcontractStepStore()
    const existingMeta = await store.readMetadata(order.organization_id, order.id)
    const existingQcPhotos = Array.isArray(existingMeta.qc_photos) ? (existingMeta.qc_photos as string[]) : []

    // Loại bỏ ảnh khớp theo URL hoặc theo storage key
    const filteredQcPhotos = existingQcPhotos.filter((p) => {
      if (p === photoToDelete) return false
      // Nếu p là key và photoToDelete chứa key đó
      if (photoToDelete.includes(p)) return false
      // Nếu p chứa key trong photoToDelete
      const keyMatch = photoToDelete.match(/floraos-core\/(org\/[^?]+)/)
      if (keyMatch?.[1] && p.includes(keyMatch[1])) return false
      return true
    })

    await store.writeMetadata(order.organization_id, order.id, { ...existingMeta, qc_photos: filteredQcPhotos })

    return jsonResponse({
      data: {
        success: true,
        remainingCount: filteredQcPhotos.length,
      },
    })
  }

  throw unprocessable("Hành động không hợp lệ.")
})

export const dynamic = "force-dynamic"
