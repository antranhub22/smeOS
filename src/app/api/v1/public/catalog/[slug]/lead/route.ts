/**
 * POST /api/v1/public/catalog/[slug]/lead — khách để lại tên + SĐT trên trang catalog công khai.
 *
 * Công khai, không phiên. Tổ chức suy từ catalog trong use-case (không nhận từ client — A12).
 * Chặn máy: giới hạn tần suất theo IP + ô bẫy `website` + (khi bật) Cloudflare Turnstile.
 */

import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { clientIp, enforceRateLimit } from "@/core/http/rate-limit"
import { issuesToDetails, rejectBotSubmission } from "@/modules/greeting-card/contracts/public-order-schema"
import { LEAD_MESSAGE_MAX, LEAD_NAME_MAX } from "@/modules/acquisition/domain/lead-rules"
import { captureCatalogLead } from "@/modules/acquisition/use-cases/capture-lead"

const utmField = z.string().max(100).optional()

const bodySchema = z.object({
  name: z.string().max(LEAD_NAME_MAX * 2),
  phone: z.string().max(20),
  message: z.string().max(LEAD_MESSAGE_MAX * 2).optional(),
  consent: z.boolean(),
  ref: z.string().max(20).optional(),
  utm: z.object({ source: utmField, medium: utmField, campaign: utmField }).optional(),
  verificationToken: z.string().max(4096).optional(),
  /** Ô bẫy máy tự điền */
  website: z.string().max(200).optional(),
})

export const POST = handle<[{ params: Promise<{ slug: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "catalog-lead", limit: 10, windowMs: 10 * 60_000 })
  const { slug } = await context.params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed(issuesToDetails(parsed.error.issues))
  rejectBotSubmission(parsed.data)
  const { website: _bot, ...input } = parsed.data
  const result = await captureCatalogLead(slug, input, clientIp(request))
  return jsonResponse(result, { status: 201 })
})

export const dynamic = "force-dynamic"
