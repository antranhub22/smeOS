import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { ChainBranchRepository } from "@/modules/greeting-card/infra/chain-branch-repository"
import type { BranchCandidate } from "@/modules/greeting-card/domain/chain-dispatch-engine"
import { GoongGeocoder } from "@/modules/greeting-card/adapters/goong-geocoder"
import { fillMissingBranchLocations } from "@/modules/greeting-card/use-cases/resolve-geo-location"

const phone = z.string().trim().regex(/^\+?\d[\d .-]{7,18}$/, "Số điện thoại không hợp lệ")
const telegramChatId = z.string().trim().regex(/^-?\d{5,20}$/, "Telegram Chat ID chỉ gồm số (nhóm bắt đầu bằng dấu trừ)")

// Giới hạn đầu vào: trước 22/10/2026 route nhận mảng và chuỗi không giới hạn, điểm KPI tuỳ ý
const branchSchema = z.object({
  branchId: z.string().trim().min(1).max(50),
  branchName: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxDeliveryRadiusKm: z.number().min(0).max(500).optional(),
  qualityScore: z.number().min(0).max(100).default(90),
  activeJobsCount: z.number().int().min(0).max(1000).default(0),
  maxConcurrentJobs: z.number().int().min(1).max(1000).default(5),
  isActive: z.boolean().default(true),
  channels: z
    .object({
      phone: phone.optional(),
      telegramChatId: telegramChatId.optional(),
      zaloPhone: phone.optional(),
    })
    .optional(),
})

const bulkImportSchema = z.object({
  branches: z
    .array(branchSchema)
    .min(1)
    .max(500)
    .refine((list) => new Set(list.map((b) => b.branchId)).size === list.length, "Mã chi nhánh bị trùng trong tệp"),
})

/**
 * POST /api/v1/greeting-card/chain-branches/bulk-import
 * Nhập danh sách chi nhánh chuỗi từ file Excel vào bảng `chain_branches` (trùng mã → cập nhật)
 */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.assignFlorist)

  const body = await request.json().catch(() => ({}))
  const parsed = bulkImportSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { branches } = parsed.data

  const candidates: BranchCandidate[] = branches.map((b) => ({
    branchId: b.branchId,
    branchName: b.branchName,
    address: b.address ?? "",
    location:
      typeof b.latitude === "number" && typeof b.longitude === "number"
        ? { latitude: b.latitude, longitude: b.longitude }
        : null,
    qualityScore: b.qualityScore,
    activeJobsCount: b.activeJobsCount,
    maxConcurrentJobs: b.maxConcurrentJobs,
    isActive: b.isActive,
    channels: {
      phone: b.channels?.phone,
      telegramChatId: b.channels?.telegramChatId,
      zaloPhone: b.channels?.zaloPhone,
    },
  }))

  // Chi nhánh có địa chỉ mà thiếu toạ độ → tự tra toạ độ để phân đơn theo khoảng cách
  const geo = await fillMissingBranchLocations(candidates, new GoongGeocoder())

  const { created, updated, total } = await new ChainBranchRepository().upsertMany(ctx.organizationId, geo.branches)

  return jsonResponse({
    data: {
      created,
      updated,
      total,
      geocoded: geo.geocoded,
      geocodeNotFound: geo.notFound,
      geocodeSkipped: geo.skipped,
      errors: [],
    },
  })
})

export const dynamic = "force-dynamic"
