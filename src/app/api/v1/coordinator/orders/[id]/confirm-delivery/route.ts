/**
 * POST /api/v1/coordinator/orders/[id]/confirm-delivery
 *
 * Coordinator-Stream M4: Điều phối viên xác nhận giao hàng thành công thay cửa hàng.
 * Hỗ trợ 2 sub-mode:
 *   1. Upload ảnh POD (multipart/form-data với file)
 *   2. Xác nhận không ảnh (application/json với confirmWithoutPhoto=true + reason)
 *
 * Hành động này triệt tiêu (First-Wins Mutex) toàn bộ reminder M4 đang pending.
 */

import { randomUUID } from "crypto"
import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { notFound, unprocessable, validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { SubcontractOrderRepository } from "@/modules/greeting-card/infra/subcontract-order-repository"
import { prisma } from "@/core/tenancy/infra/prisma"
import { log } from "@/core/observability/log"
import {
  cancelSubcontractReminderSteps,
  getMilestoneSteps,
} from "@/modules/greeting-card/use-cases/cancel-subcontract-reminder-steps"
import { queueOrderNotification } from "@/modules/greeting-card/use-cases/notify-customer"
import type { Prisma } from "@/generated/prisma/client"

const MAX_POD_BYTES = 10 * 1024 * 1024

const confirmJsonSchema = z.object({
  confirmWithoutPhoto: z.literal(true),
  reason: z.string().trim().min(5, "Lý do tối thiểu 5 ký tự").max(300),
})

function sniffImage(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; mimeType: string } | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { ext: "jpg", mimeType: "image/jpeg" }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return { ext: "png", mimeType: "image/png" }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
    return { ext: "webp", mimeType: "image/webp" }
  return null
}

export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R5")
  const { id: orderId } = await context.params

  const repo = new SubcontractOrderRepository()
  const order = await repo.findSubcontractById(orderId, ctx.organizationId)
  if (!order) throw notFound()

  if (order.status === "COMPLETED" || order.delivery_status === "DELIVERED") {
    return jsonResponse({
      data: {
        success: true,
        alreadyCompleted: true,
        message: "Đơn hàng đã hoàn thành trước đó.",
        orderStatus: order.status,
        deliveryStatus: order.delivery_status,
      },
    })
  }

  const contentType = request.headers.get("content-type") ?? ""
  const deliveredAt = new Date().toISOString()

  let podPhotoStorageKey: string | null = null
  let publicPhotoUrl: string | null = null
  let confirmNote = ""
  let confirmMode: "with_photo" | "without_photo" = "with_photo"

  if (contentType.includes("multipart/form-data")) {
    // Mode 1: Upload ảnh POD
    const formData = await request.formData().catch(() => null)
    if (!formData) throw validationFailed({ body: "Dữ liệu phải là multipart/form-data" })

    const file = formData.get("file")
    if (!file || !(file instanceof Blob))
      throw validationFailed({ file: "Vui lòng chọn ảnh giao hàng (POD)" })

    confirmNote = typeof formData.get("note") === "string"
      ? (formData.get("note") as string).trim()
      : ""

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    if (bytes.byteLength === 0) throw validationFailed({ file: "Tệp ảnh bị rỗng" })
    if (bytes.byteLength > MAX_POD_BYTES) throw validationFailed({ file: "Ảnh vượt quá 10MB" })

    const sniffed = sniffImage(bytes)
    if (!sniffed) throw validationFailed({ file: "Định dạng không hợp lệ (JPG/PNG/WebP)" })

    const storage = getStorageProvider()

    // AI kiểm định ảnh giao hàng POD đối chiếu với mẫu và thành phẩm QC
    const snapshot = (order.greeting_sessions?.[0]?.product_snapshot as Record<string, unknown> | null) ?? {}
    const productName = order.items[0]?.description || (snapshot.name as string) || "Sản phẩm gia công"
    let sampleImageUrl = (snapshot.image_url || snapshot.imageUrl) as string | undefined
    if (sampleImageUrl?.startsWith("org/")) {
      sampleImageUrl = await storage.signedUrl(sampleImageUrl, 3600, "GET").catch(() => sampleImageUrl)
    }

    const coordExisting = await prisma.order_coordinations.findUnique({ where: { order_id: order.id } })
    const existingQcPhotos = Array.isArray((coordExisting?.metadata as Record<string, unknown> | null)?.qc_photos)
      ? ((coordExisting?.metadata as Record<string, unknown>).qc_photos as string[])
      : []
    const latestQcKey = existingQcPhotos[existingQcPhotos.length - 1]
    let qcImageUrl: string | undefined
    if (latestQcKey) {
      if (latestQcKey.startsWith("http://") || latestQcKey.startsWith("https://") || latestQcKey.startsWith("data:")) {
        qcImageUrl = latestQcKey
      } else {
        qcImageUrl = await storage.signedUrl(latestQcKey, 3600, "GET").catch(() => undefined)
      }
    }

    const { verifyPodPhotoWithAi } = await import("@/modules/greeting-card/use-cases/verify-pod-photo-ai")
    const aiVerify = await verifyPodPhotoWithAi({
      productName,
      sampleImageUrl,
      qcImageUrl,
      podPhotoBytes: bytes,
      podPhotoMimeType: sniffed.mimeType,
    })

    if (!aiVerify.isMatch) {
      throw unprocessable(
        `❌ AI phát hiện ảnh giao hàng không hợp lệ: ${aiVerify.reason} (${aiVerify.confidenceScore}%). Vui lòng kiểm tra lại ảnh chụp!`
      )
    }

    const assetId = randomUUID()
    podPhotoStorageKey = `org/${order.organization_id}/subcontract/${order.id}/coord-pod-${assetId}.${sniffed.ext}`
    await storage.put(podPhotoStorageKey, Buffer.from(bytes), sniffed.mimeType)
    publicPhotoUrl = await storage.signedUrl(podPhotoStorageKey, 604800, "GET")
    confirmMode = "with_photo"
  } else {
    // Mode 2: Xác nhận không ảnh (coordinator có quyền waive ảnh với lý do)
    const body = await request.json().catch(() => ({}))
    const parsed = confirmJsonSchema.safeParse(body)
    if (!parsed.success) {
      throw validationFailed(
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] ?? "body", i.message]))
      )
    }
    confirmNote = parsed.data.reason
    confirmMode = "without_photo"
  }

  // Cập nhật DB
  const coord = await prisma.order_coordinations.findUnique({ where: { order_id: order.id } })
  const existingMeta = (coord?.metadata as Record<string, unknown> | null) ?? {}
  const existingPodPhotos = Array.isArray(existingMeta.pod_photos)
    ? (existingMeta.pod_photos as string[])
    : []

  const deliveryProof = {
    photoUrls: podPhotoStorageKey ? [...existingPodPhotos, podPhotoStorageKey] : existingPodPhotos,
    note: confirmNote || "Điều phối xác nhận giao hàng thành công",
    deliveredAt,
    confirmedByCoordinator: ctx.userId,
    confirmMode,
  }

  await prisma.$transaction([
    prisma.orders.update({
      where: { id: order.id },
      data: { delivery_status: "DELIVERED", status: "COMPLETED" },
    }),
    prisma.order_coordinations.update({
      where: { order_id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          ...(podPhotoStorageKey && { pod_photos: deliveryProof.photoUrls }),
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
        actor_id: `coordinator:${ctx.userId}`,
        reason: `[Coordinator Confirm Delivery][${confirmMode}] ${confirmNote}`,
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
        actor_id: `coordinator:${ctx.userId}`,
        reason: "[Hoàn Tất] Điều phối xác nhận giao hàng thành công.",
      },
    }),
  ])

  // ✅ First-Wins Mutex: Hủy toàn bộ M4 reminders đang pending
  const cancelResult = await cancelSubcontractReminderSteps({
    organizationId: order.organization_id,
    orderId: order.id,
    steps: getMilestoneSteps("M4"),
    reason: "coordinator_action",
    actorId: ctx.userId,
  })

  queueOrderNotification(order.organization_id, order.id, "DELIVERED")

  log.info("coordinator.confirm_delivery_subcontract", {
    orderId: order.id,
    orderCode: order.code,
    actorId: ctx.userId,
    confirmMode,
    cancelledSteps: cancelResult.cancelledSteps,
  })

  return jsonResponse({
    data: {
      success: true,
      message: `✅ Điều phối đã xác nhận giao hàng thành công (${confirmMode === "with_photo" ? "có ảnh POD" : "xác nhận không ảnh"}). Mọi nhắc nhở M4 đã bị hủy.`,
      orderStatus: "COMPLETED",
      deliveryStatus: "DELIVERED",
      deliveredAt,
      photoUrl: publicPhotoUrl,
      cancelledReminders: cancelResult.cancelledSteps,
    },
  })
})

export const dynamic = "force-dynamic"
