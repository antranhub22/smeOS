import { z } from "zod"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import {
  cancelClaimSubcontractUseCase,
  claimSubcontractUseCase,
} from "@/modules/greeting-card/use-cases/handle-subcontract-claim"
import { commitSubcontractOrder } from "@/modules/greeting-card/domain/subcontract-order"
import { parseChainDispatchPolicy, renderDispatchMessage } from "@/modules/greeting-card/domain/chain-dispatch-policy"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
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
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

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
  const defaultSubcontractPrice = Math.round(total * 0.7) // 70% mặc định cho gia công nếu chưa cấu hình thù lao riêng
  const subcontractPriceVnd = typeof pricingRef.subcontract_price_vnd === "number"
    ? pricingRef.subcontract_price_vnd
    : defaultSubcontractPrice

  const firstItem = order.items[0]
  const session = order.greeting_sessions[0]
  const snapshot = (session?.product_snapshot as Record<string, unknown> | null) ?? {}

  const productName = firstItem?.description || (snapshot.name as string | undefined) || "Sản phẩm đặt gia công"
  const productImageUrl = (snapshot.image_url as string | undefined) || (snapshot.imageUrl as string | undefined) || null

  const deliveryWindow = (order.delivery_window as Record<string, unknown> | null) ?? {}
  const deliveryAddressObj = (order.delivery_address as Record<string, unknown> | null) ?? {}
  const deliveryAddress = typeof deliveryAddressObj.address === "string"
    ? deliveryAddressObj.address
    : (typeof deliveryAddressObj.full_address === "string" ? deliveryAddressObj.full_address : "Theo thỏa thuận")
  const deliveryTime = typeof deliveryWindow.timeSlot === "string" && typeof deliveryWindow.date === "string"
    ? `${deliveryWindow.timeSlot} ngày ${deliveryWindow.date}`
    : "Giao trong ngày"

  const storage = getStorageProvider()
  const resolveKey = async (photo: string) => {
    if (!photo) return photo
    if (photo.startsWith("org/")) {
      try { return await storage.signedUrl(photo, 604800, "GET") } catch { return photo }
    }
    const keyMatch = photo.match(/floraos-core\/(org\/[^?]+)/)
    if (keyMatch?.[1]) {
      try { return await storage.signedUrl(keyMatch[1], 604800, "GET") } catch { return photo }
    }
    return photo
  }

  const rawQcPhotos = Array.isArray(coordMeta.qc_photos) ? (coordMeta.qc_photos as string[]) : []
  const rawPodPhotos = Array.isArray(coordMeta.pod_photos) ? (coordMeta.pod_photos as string[]) : []
  const resolvedQcPhotos = await Promise.all(rawQcPhotos.map(resolveKey))
  const resolvedPodPhotos = await Promise.all(rawPodPhotos.map(resolveKey))

  const rawPodProof = coordMeta.delivery_proof as
    | { note?: string; deliveredAt?: string; deliveredByBranch?: string }
    | undefined

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
      cardMessage: order.card_message ?? null,
      specialNotes: order.internal_note ?? null,
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
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

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
    const firstItemMeta = (order.items?.[0]?.metadata as Record<string, unknown> | null) ?? {}
    const sampleImageUrl = (firstItemMeta.imageUrl as string | undefined) || (firstItemMeta.image as string | undefined) || null

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
      }]
    )
    return jsonResponse({ data: result })
  }

  if (action === "CANCEL") {
    const result = await cancelClaimSubcontractUseCase(
      ctx,
      { orderId: order.id, branchId: branch.id },
      repo
    )

    // Đánh giá chất lượng dịch vụ: Trừ điểm KPI chi nhánh vì đã hủy nhận đơn
    const penalty = await repo.recordBranchCancellationPenalty(
      order.organization_id,
      branch.id,
      `Hủy nhận đơn #${order.code} trong hạn kiểm tra kho (Kho thiếu hoa/nguyên liệu)`
    )

    return jsonResponse({
      data: {
        ...result,
        penalty: {
          penalized: true,
          scoreDeducted: 2,
          currentQualityScore: penalty.newQualityScore,
          totalCancellations: penalty.cancellationCount,
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
      claimUrl: `${request.headers.get("origin") || ""}/subcontract/${order.code}?branch=${encodeURIComponent(branch.id)}`,
    })

    const branchCandidate = {
      branchId: branch.id,
      branchName: branch.name,
      qualityScore: 100,
      activeJobsCount: 0,
      maxConcurrentJobs: 10,
      isActive: true,
      channels: {
        telegramChatId: (org?.settings as Record<string, unknown> | null)?.["chain_branches"]
          ? (
              ((org?.settings as Record<string, unknown> | null)?.["chain_branches"] as Array<{
                branchId: string
                channels?: { telegramChatId?: string; phone?: string; zaloPhone?: string }
              }>).find((b) => b.branchId === branch.id)?.channels?.telegramChatId
            )
          : undefined,
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

    const coord = await prisma.order_coordinations.findUnique({
      where: { order_id: order.id },
    })
    const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
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

    await prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          qc_photos: filteredQcPhotos,
        } as unknown as Prisma.InputJsonValue,
      },
    })

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
