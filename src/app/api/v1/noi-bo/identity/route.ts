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
import { prisma } from "@/core/tenancy/infra/prisma"

export const GET = handle(async (request) => {
  try {
    const { ctx } = await requireTenantContext(request)

  const org = await prisma.organizations.findUnique({
    where: { id: ctx.organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      created_at: true,
      business_profile: {
        select: {
          display_name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
    },
  })

  if (!org) {
    return jsonResponse({ success: false, error: "Organization not found" }, { status: 404 })
  }

  // Lấy quan hệ chuỗi — tổ chức này là ĐỐI TÁC của chuỗi nào?
  const asPartner = await prisma.chain_partnerships.findMany({
    where: { partner_org_id: ctx.organizationId, status: "ACTIVE" },
    select: {
      id: true,
      partner_code: true,
      partnership_type: true,
      chain_organization: { select: { id: true, name: true, slug: true } },
    },
    take: 20,
  })

  // Lấy quan hệ chuỗi — tổ chức này là CHUỖI đang quản lý ai?
  const asChain = await prisma.chain_partnerships.findMany({
    where: { chain_org_id: ctx.organizationId, status: "ACTIVE" },
    select: {
      id: true,
      partner_code: true,
      partnership_type: true,
      partner_organization: { select: { id: true, name: true, slug: true } },
    },
    take: 50,
  })

  // Thành viên / nhân viên của tổ chức này
  const members = await prisma.memberships.findMany({
    where: { organization_id: ctx.organizationId, status: "ACTIVE" },
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
    },
    take: 100,
  })

  return jsonResponse({
    success: true,
    data: {
      organization: {
        id: org.id,
        shortId: org.id.slice(0, 8).toUpperCase(),
        slug: org.slug,
        name: org.name,
        displayName: org.business_profile?.display_name ?? org.name,
        type: org.type,
        phone: org.business_profile?.phone ?? null,
        email: org.business_profile?.email ?? null,
        address: org.business_profile?.address ?? null,
        createdAt: org.created_at,
        /** Mã định danh dùng để kết nối: slug (ngắn gọn, unique) */
        connectCode: org.slug,
      },
      chainRelations: {
        asPartnerOf: asPartner.map((r) => ({
          partnershipId: r.id,
          partnerCode: r.partner_code,
          partnershipType: r.partnership_type,
          chainOrgId: r.chain_organization.id,
          chainName: r.chain_organization.name,
          chainSlug: r.chain_organization.slug,
          chainConnectCode: r.chain_organization.slug,
        })),
        asChainOf: asChain.map((r) => ({
          partnershipId: r.id,
          partnerCode: r.partner_code,
          partnershipType: r.partnership_type,
          partnerOrgId: r.partner_organization.id,
          partnerName: r.partner_organization.name,
          partnerSlug: r.partner_organization.slug,
        })),
      },
      members: members.map((m) => ({
        membershipId: m.id,
        memberId: m.id.slice(0, 8).toUpperCase(),
        userId: m.user.id,
        name: m.user.name ?? m.user.email,
        email: m.user.email,
      })),
    },
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
