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

const branchSchema = z.object({
  branchId: z.string().min(1),
  branchName: z.string().min(1),
  address: z.string().optional(),
  ward: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  /** Tỉnh / thành phố — nhận cả tên cũ `city` của file mẫu */
  province: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  serviceWards: z.array(z.string().max(120)).max(50).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxDeliveryRadiusKm: z.number().optional(),
  qualityScore: z.number().default(90),
  activeJobsCount: z.number().default(0),
  maxConcurrentJobs: z.number().default(5),
  isActive: z.boolean().default(true),
  channels: z
    .object({
      phone: z.string().optional(),
      telegramChatId: z.string().optional(),
      zaloPhone: z.string().optional(),
    })
    .optional(),
})

const bulkImportSchema = z.object({
  branches: z.array(branchSchema).min(1),
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
    area: { ward: b.ward, district: b.district, province: b.province ?? b.city, serviceWards: b.serviceWards ?? [] },
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
