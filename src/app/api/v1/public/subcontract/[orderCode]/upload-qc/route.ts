import { randomUUID } from "crypto"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { log } from "@/core/observability/log"
import { verifyQcPhotoWithAi } from "@/modules/greeting-card/use-cases/verify-qc-photo-ai"
import { queueOrderNotification } from "@/modules/greeting-card/use-cases/notify-customer"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import { notifyShipperRequest } from "@/modules/greeting-card/use-cases/notify-shipper-request"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"
import type { TenantContext } from "@/core/tenancy"

const MAX_QC_PHOTO_BYTES = 10 * 1024 * 1024 // 10 MB

function sniffImage(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; mimeType: string } | null {
  if (bytes.length < 12) return null
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", mimeType: "image/jpeg" }
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", mimeType: "image/png" }
  }
  // WebP: RIFF .... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: "webp", mimeType: "image/webp" }
  }
  return null
}

/**
 * POST /api/v1/public/subcontract/[orderCode]/upload-qc
 *
 * Cửa hàng/Chi nhánh tải ảnh thành phẩm trực tiếp từ máy (camera hoặc thư viện ảnh).
 * Tự động cập nhật production_status thành QUALITY_CHECK để ngắt chuỗi nhắc việc.
 */
export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-upload-qc", limit: 30, windowMs: 60_000 })
  const { orderCode } = await context.params

  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractByCode(orderCode)
  if (!order) throw notFound()

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    throw validationFailed({ body: "Dữ liệu gửi lên không đúng định dạng multipart/form-data" })
  }

  const file = formData.get("file")
  const branchId = formData.get("branchId")

  if (typeof branchId !== "string" || !branchId.trim()) {
    throw validationFailed({ branchId: "Thiếu mã chi nhánh phụ trách" })
  }

  if (!file || !(file instanceof Blob)) {
    throw validationFailed({ file: "Vui lòng chọn ảnh thành phẩm từ máy của bạn" })
  }

  // Kiểm tra chi nhánh có đúng là bên đang gia công đơn này không
  const coordMeta = (order.coordination?.metadata as Record<string, unknown> | null) ?? {}
  const subState = coordMeta.subcontract_dispatch as Record<string, unknown> | undefined
  if (subState?.claimedBranchId && subState.claimedBranchId !== branchId) {
    throw unprocessable("Đơn hàng này không thuộc chi nhánh của bạn.")
  }

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  if (bytes.byteLength === 0) {
    throw validationFailed({ file: "Tệp ảnh được chọn bị rỗng" })
  }
  if (bytes.byteLength > MAX_QC_PHOTO_BYTES) {
    throw validationFailed({ file: "Ảnh tải lên vượt quá dung lượng tối đa 10MB" })
  }

  const sniffed = sniffImage(bytes)
  if (!sniffed) {
    throw validationFailed({ file: "Định dạng tệp không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP." })
  }

  const storage = getStorageProvider()

  // Trích xuất thông tin sản phẩm mẫu ban đầu của đơn hàng
  const snapshot = (order.greeting_sessions?.[0]?.product_snapshot as Record<string, unknown> | null) ?? {}
  const itemMeta = (order.items[0]?.metadata as Record<string, unknown> | null) ?? {}
  const productName = order.items[0]?.description || (snapshot.name as string | undefined) || (itemMeta.name as string | undefined) || "Sản phẩm đặt gia công"
  // Sử dụng SSOT use-case resolveSubcontractSamplePhoto để nạp ảnh mẫu chuẩn của đơn hàng
  const { resolveSubcontractSamplePhoto } = await import("@/modules/greeting-card/use-cases/resolve-subcontract-sample-photo")
  const samplePhotoUrl = await resolveSubcontractSamplePhoto(order)
  let sampleImageUrl = samplePhotoUrl || (snapshot.image_url || snapshot.imageUrl || itemMeta.imageUrl || itemMeta.image_url) as string | undefined

  // Nếu sampleImageUrl là key nội bộ dạng org/... -> ký URL còn hạn
  if (sampleImageUrl && (sampleImageUrl.startsWith("org/") || sampleImageUrl.includes("floraos-core/org/"))) {
    try {
      const key = sampleImageUrl.startsWith("org/")
        ? sampleImageUrl
        : sampleImageUrl.match(/floraos-core\/(org\/[^?]+)/)?.[1]
      if (key) {
        sampleImageUrl = await storage.signedUrl(key, 604800, "GET").catch(() => sampleImageUrl)
      }
    } catch {
      // ignore
    }
  } else if (sampleImageUrl && sampleImageUrl.startsWith("/")) {
    // Nếu là file tĩnh cục bộ (ví dụ: /mock-data/...) -> đọc file và chuyển thành data URI
    try {
      const fs = await import("fs")
      const path = await import("path")
      const localFilePath = path.join(process.cwd(), "public", sampleImageUrl.replace(/^\//, ""))
      if (fs.existsSync(localFilePath)) {
        const fileBytes = fs.readFileSync(localFilePath)
        const ext = path.extname(localFilePath).toLowerCase()
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"
        sampleImageUrl = `data:${mime};base64,${fileBytes.toString("base64")}`
      }
    } catch {
      // bỏ qua fallback
    }
  }

  // AI Vision đối chiếu ảnh thành phẩm với ảnh mẫu ban đầu trước khi lưu trữ
  const aiVerify = await verifyQcPhotoWithAi({
    productName,
    sampleImageUrl,
    qcPhotoBytes: bytes,
    qcPhotoMimeType: sniffed.mimeType,
  })

  // Nếu AI xác nhận ảnh không khớp -> Chặn ngay lập tức và trả thông báo lỗi chi tiết
  if (!aiVerify.isMatch) {
    log.warn("subcontract.qc_photo_rejected_by_ai", {
      orderId: order.id,
      orderCode: order.code,
      branchId,
      aiVerify,
    })
    throw unprocessable(
      `❌ Ảnh thành phẩm không khớp với đơn hàng: ${aiVerify.reason} (Độ tin cậy: ${aiVerify.confidenceScore}%). Vui lòng kiểm tra và chụp đúng sản phẩm!`
    )
  }

  // Khi AI đã xác nhận đúng sản phẩm -> Mới lưu vào Storage
  const assetId = randomUUID()
  const storageKey = `org/${order.organization_id}/subcontract/${order.id}/qc-${assetId}.${sniffed.ext}`
  await storage.put(storageKey, Buffer.from(bytes), sniffed.mimeType)
  const publicPhotoUrl = await storage.signedUrl(storageKey, 604800, "GET")

  const nextProductionStatus = "READY"

  // Cập nhật CSDL
  const coord = await prisma.order_coordinations.findUnique({
    where: { order_id: order.id },
  })

  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
  const existingQcPhotos = Array.isArray(existingMeta.qc_photos) ? (existingMeta.qc_photos as string[]) : []
  // Lưu storageKey thuần dạng org/... vào DB để khi load ra sẽ được tự động ký URL mới còn hạn
  const updatedQcPhotos = [...existingQcPhotos, storageKey]

  const updateOps: unknown[] = [
    prisma.orders.update({
      where: { id: order.id },
      data: {
        production_status: nextProductionStatus,
      },
    }),
    prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          qc_photos: updatedQcPhotos,
          last_qc_uploaded_at: new Date().toISOString(),
          last_qc_uploaded_by_branch: branchId,
          last_ai_verification: {
            isMatch: aiVerify.isMatch,
            confidenceScore: aiVerify.confidenceScore,
            verdict: aiVerify.verdict,
            reason: aiVerify.reason,
          },
          auto_bypassed_coordinator: aiVerify.isMatch,
        } as unknown as Prisma.InputJsonValue,
      },
    }),
  ]

  // Tạo sự kiện nhật ký đơn hàng
  if (aiVerify.isMatch) {
    updateOps.push(
      prisma.order_events.create({
        data: {
          id: randomUUID(),
          organization_id: order.organization_id,
          order_id: order.id,
          axis: "production",
          from_value: order.production_status,
          to_value: "READY",
          actor_id: `branch_${branchId}`,
          reason: `[AI Thẩm Định Khớp] ${aiVerify.reason} (${aiVerify.confidenceScore}%). Tự động duyệt ảnh thành phẩm và chuyển sang Đã cắm xong.`,
        },
      })
    )
  }

  await prisma.$transaction(updateOps as any)

  // Tự động gửi thông báo cập nhật tiến độ cho khách hàng kèm ảnh thành phẩm
  if (aiVerify.isMatch) {
    // 1. Kích hoạt mốc READY cho hệ thống thông báo ZNS/SMS
    queueOrderNotification(order.organization_id, order.id, "READY")

    // 2. Gửi thông báo trực tiếp kèm ảnh thành phẩm và link theo dõi cho Khách hàng
    const customerPhone = order.customer?.phone || (order.greeting_sessions?.[0] as Record<string, unknown> | undefined)?.customer_phone as string | undefined
    const customerName = order.customer?.name || (order.greeting_sessions?.[0] as Record<string, unknown> | undefined)?.customer_name as string | undefined || "Quý khách"
    const sendCode = order.greeting_sessions?.[0]?.send_code

    if (customerPhone) {
      const notifier = new MultiChannelDispatchNotifier()
      const trackingUrl = sendCode ? `http://localhost:3200/b/${sendCode}` : ""
      const messageText = `🌸 [SMEOS] Xin chào ${customerName}!\nĐơn hàng #${order.code} (${productName}) đã được hoàn thiện cắm xong và vượt qua kiểm định chất lượng AI!\n🖼️ Bạn có thể xem ảnh thành phẩm và hành trình đơn hàng tại: ${trackingUrl}\nĐơn sẽ sớm được bàn giao cho đối tác giao hàng.`

      const ctx: TenantContext = {
        organizationId: order.organization_id,
        workspaceId: "default",
        userId: `branch_${branchId}`,
        branchId,
        capabilities: new Set(),
      }

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
        messageText,
        claimUrl: trackingUrl,
        actions: [{ text: "🖼️ Xem ảnh thành phẩm & hành trình", url: trackingUrl }],
      }).catch((err) => {
        log.warn("subcontract.customer_notify_failed", {
          orderCode: order.code,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    }

    // 3. Gửi yêu cầu thông tin shipper cho chi nhánh + lập lịch nhắc 1 lần
    const subMeta = (order.coordination?.metadata as Record<string, unknown> | null)?.subcontract_dispatch as Record<string, unknown> | undefined
    const branchChannels = subMeta?.channels as Record<string, unknown> | undefined
    notifyShipperRequest({
      organizationId: order.organization_id,
      orderId: order.id,
      orderCode: order.code,
      branchId,
      branchPhone: (branchChannels?.phone ?? branchChannels?.zaloPhone) as string | undefined,
      branchTelegramChatId: branchChannels?.telegramChatId as string | undefined,
      branchName: subMeta?.claimedBranchName as string | undefined,
      reminderMinutes: 30,
    }).catch((err) => {
      log.warn("subcontract.shipper_request_failed", {
        orderCode: order.code,
        error: err instanceof Error ? err.message : String(err),
      })
    })

    // ✅ First-Wins Mutex (Store-Stream): Hủy toàn bộ M2 reminders vì cửa hàng đã upload qua link
    cancelSubcontractReminderSteps({
      organizationId: order.organization_id,
      orderId: order.id,
      steps: getMilestoneSteps("M2"),
      reason: "store_action_via_link",
      actorId: `branch_${branchId}`,
    }).catch((err) => {
      log.warn("subcontract.cancel_m2_reminders_failed", {
        orderCode: order.code,
        error: err instanceof Error ? err.message : String(err),
      })
    })
  }

  log.info("subcontract.qc_photo_uploaded", {
    orderId: order.id,
    orderCode: order.code,
    branchId,
    storageKey,
    nextProductionStatus,
    aiVerify,
    fileSize: bytes.byteLength,
  })

  return jsonResponse({
    data: {
      success: true,
      message: aiVerify.isMatch
        ? `✅ AI đã xác nhận ảnh thành phẩm khớp với mẫu (${aiVerify.confidenceScore}%). Đơn hàng đã tự động hoàn tất và chuyển sang trạng thái Sẵn Sàng Giao (READY)!`
        : `⚠️ Ảnh thành phẩm đã tải lên nhưng AI phát hiện có thể chưa khớp với mẫu (${aiVerify.reason}). Điều phối viên sẽ kiểm tra trực tiếp.`,
      photoUrl: publicPhotoUrl,
      allQcPhotos: updatedQcPhotos,
      productionStatus: nextProductionStatus,
      aiVerification: aiVerify,
      autoBypassedCoordinator: aiVerify.isMatch,
    },
  })
})

export const dynamic = "force-dynamic"
