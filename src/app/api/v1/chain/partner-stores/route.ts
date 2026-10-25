/**
 * POST /api/v1/chain/partner-stores
 *
 * Implements registration of a partner / franchise store bound by a Data Sharing Agreement (DSA).
 */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { registerPartnerStore } from "@/modules/field-platform/use-cases/register-partner-store"
import { validationFailed } from "@/core/http/errors"

const schema = z.object({
  name: z.string().min(2, "Tên cửa hàng phải có ít nhất 2 ký tự"),
  code: z.string().min(2, "Mã cửa hàng phải có ít nhất 2 ký tự"),
  address: z.string().nullish(),
  legalEntityId: z.string().min(2, "Mã pháp nhân / MST đối tác là bắt buộc"),
  fieldCeilings: z.record(z.string(), z.enum(["NONE", "AGGREGATED", "MASKED", "RAW"] as const)),
  validUntil: z.string().optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const result = await registerPartnerStore({
    organizationId: ctx.organizationId,
    name: parsed.data.name,
    code: parsed.data.code,
    address: parsed.data.address,
    legalEntityId: parsed.data.legalEntityId,
    fieldCeilings: parsed.data.fieldCeilings,
    validUntil: parsed.data.validUntil,
  })

  return jsonResponse({ data: result }, { status: 201 })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
