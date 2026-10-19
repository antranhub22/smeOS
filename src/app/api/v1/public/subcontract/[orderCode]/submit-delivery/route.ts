import { randomUUID } from "crypto"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { log } from "@/core/observability/log"
import { queueOrderNotification } from "@/modules/greeting-card/use-cases/notify-customer"
import { MultiChannelDispatchNotifier } from "@/modules/greeting-card/infra/dispatch-notification-adapter"
import type { TenantContext } from "@/core/tenancy"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"

const MAX_POD_PHOTO_BYTES = 10 * 1024 * 1024 // 10 MB

function sniffImage(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; mimeType: string } | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", mimeType: "image/jpeg" }
  }
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
 * POST /api/v1/public/subcontract/[orderCode]/submit-delivery
 *
 * Cửa hàng/Chi nhánh gửi ảnh bằng chứng giao hàng (POD) và xác nhận hoàn tất đơn hàng.
 * Cập nhật delivery_status = DELIVERED, status = COMPLETED, và thông báo cho khách hàng.
 */
export const POST = handle<[{ params: Promise<{ orderCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "subcontract-submit-delivery", limit: 30, windowMs: 60_000 })
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
  const note = typeof formData.get("note") === "string" ? (formData.get("note") as string).trim() : ""

  if (typeof branchId !== "string" || !branchId.trim()) {
    throw validationFailed({ branchId: "Thiếu mã chi nhánh phụ trách" })
  }

  if (!file || !(file instanceof Blob)) {
    throw validationFailed({ file: "Vui lòng chọn ảnh chụp giao hàng (ảnh người nhận / trước cửa / phiếu nhận)" })
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
  if (bytes.byteLength > MAX_POD_PHOTO_BYTES) {
    throw validationFailed({ file: "Ảnh tải lên vượt quá dung lượng tối đa 10MB" })
  }

  const sniffed = sniffImage(bytes)
  if (!sniffed) {
    throw validationFailed({ file: "Định dạng tệp không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP." })
  }

  const storage = getStorageProvider()
  const assetId = randomUUID()
  const storageKey = `org/${order.organization_id}/subcontract/${order.id}/pod-${assetId}.${sniffed.ext}`
  await storage.put(storageKey, Buffer.from(bytes), sniffed.mimeType)
  const publicPhotoUrl = await storage.signedUrl(storageKey, 604800, "GET")

  const deliveredAt = new Date().toISOString()
  const coord = await prisma.order_coordinations.findUnique({
    where: { order_id: order.id },
  })
  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
  const existingPodPhotos = Array.isArray(existingMeta.pod_photos) ? (existingMeta.pod_photos as string[]) : []
  const updatedPodPhotos = [...existingPodPhotos, storageKey]

  const deliveryProof = {
    photoUrls: updatedPodPhotos,
    note: note || "Đã giao thành công cho khách hàng",
    deliveredAt,
    deliveredByBranch: branchId,
  }

  const updateOps: unknown[] = [
    prisma.orders.update({
      where: { id: order.id },
      data: {
        delivery_status: "DELIVERED",
        status: "COMPLETED",
      },
    }),
    prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          pod_photos: updatedPodPhotos,
          delivery_proof: deliveryProof,
          last_pod_uploaded_at: deliveredAt,
        } as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.order_events.create({
      data: {
        id: randomUUID(),
        organization_id: order.organization_id,
        order_id: order.id,
        axis: "delivery",
        from_value: order.delivery_status || "DELIVERING",
        to_value: "DELIVERED",
        actor_id: `branch_${branchId}`,
        reason: `[Xác Nhận Giao Hàng POD] Chi nhánh tải ảnh giao hàng thành công. Ghi chú: ${note || "Không có"}`,
      },
    }),
    prisma.order_events.create({
      data: {
        id: randomUUID(),
        organization_id: order.organization_id,
        order_id: order.id,
        axis: "status",
        from_value: order.status,
        to_value: "COMPLETED",
        actor_id: `branch_${branchId}`,
        reason: "[Hoàn Tất] Đơn hàng hoàn thành sau khi xác nhận giao hoa thành công.",
      },
    }),
  ]

  await prisma.$transaction(updateOps as any)

  // 1. Tự động gửi thông báo chúc mừng & cảm ơn khách hàng kèm ảnh giao hàng
  try {
    queueOrderNotification(order.organization_id, order.id, "DELIVERED")
  } catch (err) {
    log.error("subcontract.customer_notify_delivered_failed", { orderId: order.id, error: err })
  }

  // ✅ First-Wins Mutex (Store-Stream): Hủy toàn bộ M4 reminders vì cửa hàng đã xác nhận giao qua link
  cancelSubcontractReminderSteps({
    organizationId: order.organization_id,
    orderId: order.id,
    steps: getMilestoneSteps("M4"),
    reason: "store_action_via_link",
    actorId: `branch_${branchId}`,
  }).catch((err) => {
    log.warn("subcontract.cancel_m4_reminders_failed", {
      orderCode: order.code,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  // 2. Bắn thông báo xác nhận hoàn tất tới kênh Điều phối / Chi nhánh
  try {
    const org = await repo.findOrganizationSettings(order.organization_id)
    const branches = (org?.settings as Record<string, unknown> | null)?.["chain_branches"]
    const branchList = Array.isArray(branches) ? branches : []
    const branchObj = branchList.find((b: any) => b.branchId === branchId)
    const branchName = branchObj?.branchName || "Chi nhánh phụ trách"

    const tenantCtx: TenantContext = {
      organizationId: order.organization_id,
      workspaceId: "default",
      userId: `branch_${branchId}`,
      branchId,
      capabilities: new Set<string>(),
    }
    const notifier = new MultiChannelDispatchNotifier()
    if (branchObj) {
      await notifier.sendSubcontractInvite(tenantCtx, {
        branch: branchObj,
        orderCode: order.code,
        messageText: `🎉 [HOÀN TẤT GIAO HÀNG] Đơn hàng #${order.code} đã được giao thành công!\n📸 Bằng chứng giao hàng (POD) đã lưu trữ.\n💰 Chi phí gia công đã được ghi nhận quyết toán. Cảm ơn chi nhánh ${branchName}!`,
        claimUrl: `https://app.smeos.vn/subcontract/${order.code}?branch=${encodeURIComponent(branchId)}`,
        title: `🎉 [GIAO THÀNH CÔNG #${order.code}]`,
        actions: [{ text: "👁️ Xem Thẻ Đơn", url: `https://app.smeos.vn/subcontract/${order.code}?branch=${encodeURIComponent(branchId)}` }],
      })
    }
  } catch (err) {
    log.error("subcontract.branch_notify_delivered_failed", { orderId: order.id, error: err })
  }

  log.info("subcontract.delivery_completed", {
    orderId: order.id,
    orderCode: order.code,
    branchId,
    deliveredAt,
  })

  return jsonResponse({
    data: {
      orderCode: order.code,
      deliveryStatus: "DELIVERED",
      orderStatus: "COMPLETED",
      deliveredAt,
      photoUrl: publicPhotoUrl,
      note: note || null,
    },
  })
})
