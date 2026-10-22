import type { TenantContext } from "@/core/tenancy"
import { conflict, notFound, validationFailed } from "@/core/http/errors"
import { mediaSelectionError } from "../domain/media-limits"
import { BrochureOrderRepository } from "../infra/brochure-order-repository"
import { coordinatorAcceptanceBlocker, coordinatorActionBlocker, coordinatorRejectionBlocker, type CoordinatorAction } from "../domain/brochure-commerce-rules"
import { paymentGateBlocker, parsePaymentPolicy } from "../domain/brochure-payment-policy"
import { GreetingCardRepository } from "../infra/greeting-card-repository"
import { queueOrderNotification } from "./notify-customer"
import { queueStaffNotification } from "./notify-staff"
import {
  DELIVERY_FAILURE_LABEL, deliveryFailureError, parseRedeliveryFee, redeliveryFeeFor, type DeliveryFailureReason,
} from "../domain/delivery-failure"
import { DeliveryFailureRepository } from "../infra/delivery-failure-repository"
import { orderPhotoApproval, photoApprovalDispatchBlocker } from "../domain/photo-approval"
import { BrochurePaymentRepository } from "../infra/brochure-payment-repository"
import { CancellationRepository } from "../infra/cancellation-repository"
import { coordinatorConfirmDepositPayment } from "./confirm-brochure-payment"
import { canBypassDeliveryPhoto, canBypassFinishedPhoto, canRoleApproveDeposit, depositApproverRole, isUrgentOrder, parseBrochureWorkflowPolicy } from "../domain/brochure-workflow-policy"
import { hasCapability } from "@/core/rbac/capabilities"
import { GREETING_CARD_CAPABILITY } from "../domain/greeting-card-capabilities"
import { verifyQcPhotoWithAi } from "./verify-qc-photo-ai"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { OrderPhotoRepository } from "@/modules/greeting-card/infra/order-photo-repository"
import { log } from "@/core/observability/log"

/** Đơn của tổ chức + kiểm đúng thứ tự tác vụ xưởng (409 nếu sai bước). */
async function loadForAction(
  ctx: TenantContext,
  orderId: string,
  action: CoordinatorAction,
  repo: BrochureOrderRepository
) {
  const order = await repo.findBrochureOrder(ctx, orderId)
  if (!order) throw notFound()
  // Chính sách thu tiền và kiểm định ảnh của tiệm
  const shop = await new GreetingCardRepository().getShopProfile(ctx.organizationId)
  const policy = parsePaymentPolicy(shop.settings)
  const blocker = coordinatorActionBlocker(
    action,
    {
      status: order.status,
      productionStatus: order.production_status,
      deliveryStatus: order.delivery_status,
    },
    { skipPhoto: policy.requireProductPhotoQC === false }
  )
  if (blocker) throw conflict(blocker)
  const moneyBlocker = paymentGateBlocker(action, policy, {
    totalVnd: Number(order.total_vnd),
    paidVnd: Number(order.paid_vnd),
  })
  if (moneyBlocker) throw conflict(moneyBlocker)
  if (action === "dispatch-shipping") {
    const approval = orderPhotoApproval(order, shop.settings, policy.productPhotoReviewMinutes, new Date())
    const waiting = photoApprovalDispatchBlocker(approval)
    if (waiting) throw conflict(waiting)
  }
  return order
}


/** Gói Nghiêm ngặt bắt buộc ảnh — gọi thẳng API bỏ qua ảnh cũng bị chặn (PO 15/10/2026). */
async function assertSkipAllowed(ctx: TenantContext, kind: "product" | "recipient") {
  const workflow = parseBrochureWorkflowPolicy((await new GreetingCardRepository().getShopProfile(ctx.organizationId)).settings)
  const allowed = kind === "product" ? canBypassFinishedPhoto(workflow) : canBypassDeliveryPhoto(workflow)
  if (!allowed) throw conflict(kind === "product" ? "Tiệm bắt buộc ảnh thành phẩm — không bỏ qua được" : "Tiệm bắt buộc ảnh bàn giao — không bỏ qua được")
}

/** Đầu vào ảnh: `assetIds` (1–5 ảnh + 0–2 video) hoặc `assetId` (client cũ, một ảnh), hoặc bỏ qua nếu giao gấp. */
export type PhotoInput = {
  assetId?: string | undefined
  assetIds?: string[] | undefined
  skipPhoto?: boolean | undefined
  skipReason?: string | undefined
}

/**
 * Mọi asset phải thuộc đúng tổ chức (khác → 404) và bộ tệp đúng giới hạn ảnh/video.
 * Thời lượng video do trình duyệt kiểm; máy chủ kiểm loại, số lượng, dung lượng.
 */
async function ownedMediaIds(ctx: TenantContext, input: PhotoInput, repo: BrochureOrderRepository): Promise<string[]> {
  const ids = [...new Set(input.assetIds ?? (input.assetId ? [input.assetId] : []))]
  if (ids.length === 0) throw validationFailed({ assetIds: "Cần ít nhất 1 ảnh" })
  const meta = await repo.ownedAssetsMeta(ctx, ids)
  if (meta.length !== ids.length) throw notFound()
  const error = mediaSelectionError(meta.map((m) => ({ mimeType: m.mime_type, sizeBytes: m.file_size })))
  if (error) throw validationFailed({ assetIds: error })
  return ids
}

export async function assignBrochureFlorist(
  ctx: TenantContext,
  orderId: string,
  input: { floristNote: string },
  repo = new BrochureOrderRepository()
) {
  const order = await loadForAction(ctx, orderId, "assign-florist", repo)
  return repo.applyProgress(ctx, order, {
    eventType: "FLORIST_ASSIGNED",
    productionStatus: "ARRANGING",
    noteAppend: `[Florist] ${input.floristNote.trim()}`,
  })
}

export async function uploadBrochureProductPhoto(
  ctx: TenantContext,
  orderId: string,
  input: PhotoInput,
  repo = new BrochureOrderRepository()
) {
  const order = await loadForAction(ctx, orderId, "product-photo", repo)
  if (input.skipPhoto) {
    await assertSkipAllowed(ctx, "product")
    const result = await repo.applyProgress(ctx, order, {
      eventType: "PRODUCT_PHOTO_SKIPPED",
      productionStatus: "READY",
      noteAppend: `[Bỏ qua ảnh thành phẩm] ${input.skipReason?.trim() || "Giao gấp theo yêu cầu"}`,
    })
    queueOrderNotification(ctx.organizationId, order.id, "READY")
    queueStaffNotification(ctx.organizationId, "READY", {
      orderId: order.id,
      orderCode: order.code,
      amountVnd: Number(order.total_vnd),
      assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
    })
    return result
  }

  const assetIds = await ownedMediaIds(ctx, input, repo)

  // AI Vision: Đối chiếu ảnh thành phẩm với mẫu sản phẩm của đơn hàng
  const aiVerify = await (async () => {
    try {
      // Lấy storage_key của ảnh đầu tiên để sign URL gửi AI
      const firstImageId = assetIds[0]
      const assetRow = firstImageId
        ? await new OrderPhotoRepository().findAsset(ctx.organizationId, firstImageId)
        : null

      // Lấy ảnh mẫu gốc: query riêng vì findBrochureOrder không include items/product_snapshot
      const orderDetail = await new OrderPhotoRepository().findOrderSampleSource(ctx.organizationId, orderId)
      const snapshot = (orderDetail?.greeting_sessions?.[0]?.product_snapshot as Record<string, unknown> | null) ?? {}
      const itemMeta = (orderDetail?.items?.[0]?.metadata as Record<string, unknown> | null) ?? {}
      const productName = orderDetail?.items?.[0]?.description || (snapshot.name as string | undefined) || "Sản phẩm"
      let sampleImageUrl = (snapshot.image_url || snapshot.imageUrl || itemMeta.imageUrl || itemMeta.image_url) as string | undefined

      // Sign URL ảnh mẫu nếu là key nội bộ
      const storage = getStorageProvider()
      if (sampleImageUrl?.startsWith("org/")) {
        sampleImageUrl = await storage.signedUrl(sampleImageUrl, 604800, "GET").catch(() => sampleImageUrl)
      }

      // Sign URL ảnh QC vừa upload
      let qcImageUrl: string | undefined
      if (assetRow?.storage_key) {
        qcImageUrl = await storage.signedUrl(assetRow.storage_key, 3600, "GET").catch(() => undefined)
      }

      if (!qcImageUrl) return null // Không có URL → bỏ qua AI, cho phép tiếp tục

      // Fetch bytes của ảnh QC (signed URL → raw bytes → AI)
      const qcRes = await fetch(qcImageUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null)
      if (!qcRes?.ok) return null

      const qcBytes = new Uint8Array(await qcRes.arrayBuffer())
      const qcMimeType = assetRow?.mime_type || "image/jpeg"

      return await verifyQcPhotoWithAi({
        organizationId: ctx.organizationId,
        orderId: orderId,
        productName,
        sampleImageUrl,
        qcPhotoBytes: qcBytes,
        qcPhotoMimeType: qcMimeType,
      })
    } catch (err) {
      log.warn("coordinator.product_photo.ai_verify_error", {
        orderId,
        error: err instanceof Error ? err.message : String(err),
      })
      return null // Lỗi AI → không chặn luồng điều phối viên
    }
  })()

  // Nếu AI xác nhận ảnh SAI sản phẩm → chặn ngay lập tức
  if (aiVerify && !aiVerify.isMatch) {
    log.warn("coordinator.product_photo.ai_rejected", {
      orderId,
      orderCode: order.code,
      confidenceScore: aiVerify.confidenceScore,
      reason: aiVerify.reason,
    })
    throw conflict(
      `❌ AI kiểm định phát hiện ảnh thành phẩm không khớp với mẫu sản phẩm: ${aiVerify.reason} (Độ tin cậy: ${aiVerify.confidenceScore}%). Vui lòng kiểm tra và chụp đúng sản phẩm của đơn hàng này!`
    )
  }

  const aiNote = aiVerify
    ? `[AI ✅ ${aiVerify.confidenceScore}%] ${aiVerify.reason}`
    : `[AI Bỏ qua — lỗi kết nối]`

  const result = await repo.applyProgress(ctx, order, {
    eventType: "PRODUCT_PHOTO_UPLOADED",
    productionStatus: "READY",
    qcAssetIds: assetIds,
    noteAppend: aiNote,
  })
  queueOrderNotification(ctx.organizationId, order.id, "READY")
  queueStaffNotification(ctx.organizationId, "READY", {
    orderId: order.id,
    orderCode: order.code,
    amountVnd: Number(order.total_vnd),
    assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
  })
  return result
}

export async function dispatchBrochureShipping(
  ctx: TenantContext,
  orderId: string,
  input: { trackingNote: string },
  repo = new BrochureOrderRepository()
) {
  const order = await loadForAction(ctx, orderId, "dispatch-shipping", repo)
  const result = await repo.applyProgress(ctx, order, {
    eventType: "SHIPPING_DISPATCHED",
    deliveryStatus: "DELIVERING",
    noteAppend: `[Ship] ${input.trackingNote.trim()}`,
  })
  queueOrderNotification(ctx.organizationId, order.id, "DISPATCHED")
  return result
}

export async function uploadBrochureRecipientPhoto(
  ctx: TenantContext,
  orderId: string,
  input: PhotoInput,
  repo = new BrochureOrderRepository()
) {
  const order = await loadForAction(ctx, orderId, "recipient-photo", repo)
  if (input.skipPhoto) {
    await assertSkipAllowed(ctx, "recipient")
    const result = await repo.applyProgress(ctx, order, {
      eventType: "RECIPIENT_PHOTO_SKIPPED",
      deliveryStatus: "DELIVERED",
      orderStatus: "COMPLETED",
      noteAppend: `[Bỏ qua ảnh bàn giao] ${input.skipReason?.trim() || "Khách nhận trực tiếp / Giao gấp"}`,
    })
    queueOrderNotification(ctx.organizationId, order.id, "DELIVERED")
    return result
  }
  const assetIds = await ownedMediaIds(ctx, input, repo)
  const result = await repo.applyProgress(ctx, order, {
    eventType: "RECIPIENT_PHOTO_UPLOADED",
    deliveryStatus: "DELIVERED",
    orderStatus: "COMPLETED",
    qcAssetIds: assetIds,
  })
  queueOrderNotification(ctx.organizationId, order.id, "DELIVERED")
  return result
}

/**
 * Shipper không giao được: ghi lý do, đơn sang "giao không thành công" (khách được đổi giờ/địa chỉ
 * trên trang theo dõi), tính phí giao lại nếu tiệm cài và Điều phối chọn tính. Giao ship lại như thường.
 */
export async function markBrochureDeliveryFailed(
  ctx: TenantContext,
  orderId: string,
  input: { reason: DeliveryFailureReason; note?: string | undefined; chargeFee?: boolean | undefined },
  repo = new BrochureOrderRepository(),
) {
  const error = deliveryFailureError(input)
  if (error) throw validationFailed({ note: error })
  const order = await loadForAction(ctx, orderId, "delivery-failed", repo)
  const shop = await new GreetingCardRepository().getShopProfile(ctx.organizationId)
  const feeVnd = redeliveryFeeFor({ chargeFee: input.chargeFee === true, configuredFeeVnd: parseRedeliveryFee(shop.settings), totalVnd: Number(order.total_vnd) })
  const result = await new DeliveryFailureRepository().recordFailure(ctx, order, {
    failure: {
      at: new Date().toISOString(), reason: input.reason, reasonLabel: DELIVERY_FAILURE_LABEL[input.reason],
      note: input.note?.trim() || null, feeVnd, by: ctx.userId,
    },
    feeVnd,
  })
  queueOrderNotification(ctx.organizationId, order.id, "DELIVERY_FAILED")
  queueStaffNotification(ctx.organizationId, "DELIVERY_FAILED", {
    orderId: order.id,
    orderCode: order.code,
    amountVnd: Number(order.total_vnd),
    reason: DELIVERY_FAILURE_LABEL[input.reason] || input.reason,
    assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
  })
  return result
}

/**
 * Điều phối thẩm định và xác nhận TIẾP NHẬN đơn hàng.
 * Đổi trạng thái xưởng sang ASSIGNED/ARRANGING, ghi chú tiếp nhận và gửi thông báo cho khách.
 */
export async function coordinatorAcceptBrochureOrder(
  ctx: TenantContext,
  orderId: string,
  input: { note?: string | undefined } = {},
  repo = new BrochureOrderRepository(),
  shops = new GreetingCardRepository()
) {
  const [order, shop] = await Promise.all([
    repo.findBrochureOrder(ctx, orderId),
    shops.getShopProfile(ctx.organizationId),
  ])
  if (!order) throw notFound()
  const workflow = parseBrochureWorkflowPolicy(shop.settings, shop.type)
  // Cùng luật với nút trên giao diện: đơn đã huỷ/đã giao/đã tiếp nhận/đã vào sản xuất, hoặc chưa có
  // thông tin chuyển khoản nào → không tiếp nhận (gọi thẳng API cũng bị chặn)
  const acceptBlocker = coordinatorAcceptanceBlocker(
    { status: order.status, productionStatus: order.production_status, deliveryStatus: order.delivery_status },
    { paidVnd: Number(order.paid_vnd), paymentProofUrl: order.greeting_sessions?.[0]?.payment_proof_asset_id ?? null },
    workflow
  )
  if (acceptBlocker) throw conflict(acceptBlocker)

  // Đơn chưa ghi cọc mà khách đã có bill/báo chuyển khoản → tự duyệt cọc như Điều hành
  const paid = Number(order.paid_vnd)
  const total = Number(order.total_vnd)
  const session = order.greeting_sessions?.[0]
  const hasProofOrReported = Boolean(session?.payment_proof_asset_id || session?.status === "PAYMENT_REPORTED")

  // Ghi nhận cọc khi người bấm là Điều hành (R11), hoặc chính sách tiệm cho Điều phối duyệt cọc (như /confirm-deposit)
  const deliveryWindow = order.delivery_window as { date?: string; timeSlot?: string } | null
  const minutesWaiting = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60_000)
  const mayConfirmDeposit = canRoleApproveDeposit(depositApproverRole(hasCapability(ctx, GREETING_CARD_CAPABILITY.paymentRecord)), workflow, {
    isUrgent: isUrgentOrder({ deliveryDate: deliveryWindow?.date, deliveryTimeSlot: deliveryWindow?.timeSlot }),
    isOverdueSla: minutesWaiting >= workflow.slaEscalationMinutes,
  })
  let paidNow = paid
  if (paid <= 0 && total > 0 && hasProofOrReported && mayConfirmDeposit) {
    paidNow = (await coordinatorConfirmDepositPayment(ctx, orderId, { note: input.note })).paidVnd
  }
  // Cùng chốt tiền như khi gán thợ: tiệm bắt thu trước khi cắm mà chưa thu → chưa được tiếp nhận
  const moneyBlocker = paymentGateBlocker("assign-florist", parsePaymentPolicy(shop.settings), { totalVnd: total, paidVnd: paidNow })
  if (moneyBlocker) throw conflict(`${moneyBlocker}. Chờ Điều hành xác nhận tiền cọc rồi tiếp nhận đơn.`)

  const result = await repo.applyProgress(ctx, order, {
    eventType: "COORDINATOR_ACCEPTED",
    productionStatus: "ASSIGNED",
    orderStatus: order.status === "DRAFT" ? "CONFIRMED" : order.status,
    noteAppend: `[Điều phối tiếp nhận] ${input.note?.trim() || "Xác nhận xưởng nhận đơn"}`,
  })
  queueOrderNotification(ctx.organizationId, order.id, "ORDER_ACCEPTED")
  queueStaffNotification(ctx.organizationId, "ORDER_ACCEPTED", { orderId: order.id, orderCode: order.code, amountVnd: total, assignedSaleId: session?.sale_id ?? null })
  return result
}

/**
 * Điều phối THẨM ĐỊNH VÀ TỪ CHỐI đơn hàng (do hết hoa, quá tải, ngoài giờ/khu vực giao).
 * Huỷ đơn, ghi nhận lý do từ chối và kích hoạt quy trình hoàn tiền 100% cho khách hàng.
 */
export async function coordinatorRejectBrochureOrder(
  ctx: TenantContext,
  orderId: string,
  input: { reason: string },
  cancellationRepo = new CancellationRepository(),
  repo = new BrochureOrderRepository()
) {
  const order = await repo.findBrochureOrder(ctx, orderId)
  if (!order) throw notFound()
  const rejectBlocker = coordinatorRejectionBlocker({ status: order.status, productionStatus: order.production_status, deliveryStatus: order.delivery_status }); if (rejectBlocker) throw conflict(rejectBlocker)
  const reasonText = input.reason?.trim() || "Điều phối từ chối nhận đơn (quá tải hoặc không đáp ứng mẫu hoa)"
  // Bấm lặp / hai người cùng bấm → không tạo hai đề xuất huỷ cho một đơn
  if ((await cancellationRepo.listPending(ctx)).some((r) => r.order_id === orderId)) {
    throw conflict("Đơn này đã có đề xuất huỷ đang chờ Điều hành duyệt")
  }
  
  // Điều phối từ chối nhận đơn -> gửi Đề xuất Hủy & Hoàn tiền toàn phần lên Điều hành phê duyệt
  const result = await cancellationRepo.createProposal(ctx, {
    orderId,
    senderRole: "COORDINATOR",
    proposal: {
      type: Number(order.paid_vnd) > 0 ? "FULL_REFUND" : "CANCEL_ONLY",
      reason: `[Điều phối từ chối nhận đơn] ${reasonText}`,
      refundAmountVnd: Number(order.paid_vnd),
      note: "Điều phối xác định không thể cung ứng đơn hàng theo yêu cầu khách.",
    },
  })

  queueStaffNotification(ctx.organizationId, "CANCELLATION_REQUESTED", {
    orderId: order.id,
    orderCode: order.code,
    amountVnd: Number(order.total_vnd),
    reason: `[Điều phối từ chối nhận đơn] ${reasonText}`,
    assignedSaleId: order.greeting_sessions?.[0]?.sale_id ?? null,
  })

  return {
    success: true,
    message: "Đã gửi yêu cầu từ chối nhận đơn và hoàn tiền tới Điều hành xét duyệt.",
    proposalId: result.id,
  }
}
