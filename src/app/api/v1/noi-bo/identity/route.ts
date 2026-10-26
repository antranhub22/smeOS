/**
 * GET /api/v1/noi-bo/identity
 *
 * Trả về thông tin định danh công khai của tổ chức đang đăng nhập:
 * - Mã ID tổ chức (slug / UUID rút gọn)
 * - Tên hiển thị, loại tổ chức
 * - Danh sách chuỗi mà tổ chức này là thành viên (chain_partnerships)
 * - Mã đối tác trong chuỗi (nếu có)
 * Mục đích: Hiển thị trên profile kết nối, dùng để mời/liên kết chuỗi.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getOrganizationIdentity } from "@/modules/organization/infra/identity-query"

export const GET = handle(async (request) => {
  try {
    const { ctx } = await requireTenantContext(request)
    const identityData = await getOrganizationIdentity(ctx.organizationId)

    if (!identityData) {
      return jsonResponse({ success: false, error: "Organization not found" }, { status: 404 })
    }

    return jsonResponse({
      success: true,
      data: identityData,
    })
  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "IDENTITY_ERROR",
          message: error?.message ?? String(error),
          stack: error?.stack?.slice(0, 300),
        },
      },
      { status: 500 }
    )
  }
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
