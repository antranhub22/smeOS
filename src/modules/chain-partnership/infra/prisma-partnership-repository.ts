import type { PrismaClient } from "@/generated/prisma/client"
import { prisma as defaultPrisma } from "@/core/tenancy/infra/prisma"
import { hashPassword } from "@/modules/organization/infra/password-hasher"
import { slugCandidates } from "@/modules/organization/domain/slug"
import type {
  IChainPartnershipRepository,
  ListPartnershipsFilter,
} from "../domain/repositories/chain-partnership-repository.interface"
import type {
  ChainPartnershipEntity,
  ProvisionPartnerInput,
  PartnershipStatus,
  PartnershipType,
} from "../domain/partnership-entities"

export class PrismaChainPartnershipRepository implements IChainPartnershipRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async provisionPartner(input: ProvisionPartnerInput): Promise<{
    partnership: ChainPartnershipEntity
    partnerOrgId: string
    founderUserId: string
  }> {
    const rawPassword = input.password || "SmeOS@Partner2026"
    const passwordHash = await hashPassword(rawPassword)

    // Generate unique slug for partner store
    const candidateSlugs = slugCandidates(input.partnerStoreName)
    let partnerSlug = candidateSlugs[0] || `store-${Date.now()}`
    const existingOrg = await this.prisma.organizations.findUnique({
      where: { slug: partnerSlug },
    })
    if (existingOrg) {
      partnerSlug = `${partnerSlug}-${Date.now().toString().slice(-4)}`
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Tạo tổ chức Cửa hàng đối tác (STORE)
      const partnerOrg = await tx.organizations.create({
        data: {
          name: input.partnerStoreName,
          slug: partnerSlug,
          type: "STORE",
          settings: {
            address: input.address,
            province: input.province,
            district: input.district,
            chain_id: input.chainOrgId,
          },
        },
      })

      // 2. Tạo Workspace mặc định cho Cửa hàng
      await tx.workspaces.create({
        data: {
          organization_id: partnerOrg.id,
          name: "Không gian làm việc",
          kind: "PRODUCTION",
        },
      })

      // 3. Tạo User đối tác (hoặc lấy nếu email đã tồn tại)
      let user = await tx.users.findUnique({
        where: { email: input.contactEmail.toLowerCase().trim() },
      })
      if (!user) {
        user = await tx.users.create({
          data: {
            email: input.contactEmail.toLowerCase().trim(),
            password_hash: passwordHash,
            name: input.contactName,
            phone: input.contactPhone,
          },
        })
      }

      // 4. Tìm vai store_admin hoặc vai quản trị mặc định
      const role = await tx.roles.findFirst({
        where: {
          OR: [{ key: "store_admin" }, { key: "dieu_hanh" }, { is_system: true }],
        },
      })

      // 5. Tạo Membership cho đối tác tại tổ chức mới
      if (role) {
        await tx.memberships.create({
          data: {
            organization_id: partnerOrg.id,
            user_id: user.id,
            role_id: role.id,
            status: "ACTIVE",
          },
        })
      }

      // 6. Tạo Liên kết quan hệ Chuỗi - Đối tác (chain_partnerships)
      const row = await tx.chain_partnerships.create({
        data: {
          chain_org_id: input.chainOrgId,
          partner_org_id: partnerOrg.id,
          partner_code: input.partnerCode,
          partnership_type: input.partnershipType ?? "SUBCONTRACTOR",
          status: "ACTIVE",
          capacity_daily: input.capacityDaily ?? 10,
          commission_rate: input.commissionRate ? Number(input.commissionRate) : null,
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          contact_email: input.contactEmail,
          address: input.address ?? null,
          province: input.province ?? null,
          district: input.district ?? null,
        },
      })

      return {
        partnership: this.mapEntity(row, partnerOrg.name),
        partnerOrgId: partnerOrg.id,
        founderUserId: user.id,
      }
    })
  }

  async listPartnerships(filter: ListPartnershipsFilter): Promise<{
    items: ChainPartnershipEntity[]
    total: number
  }> {
    const where: any = {
      chain_org_id: filter.chainOrgId,
    }

    if (filter.status) {
      where.status = filter.status
    }
    if (filter.province) {
      where.province = filter.province
    }
    if (filter.query) {
      where.OR = [
        { partner_code: { contains: filter.query, mode: "insensitive" } },
        { contact_name: { contains: filter.query, mode: "insensitive" } },
        { contact_phone: { contains: filter.query, mode: "insensitive" } },
      ]
    }

    const [rows, total] = await Promise.all([
      this.prisma.chain_partnerships.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: Math.min(filter.limit ?? 50, 100),
        skip: filter.offset ?? 0,
        include: {
          partner_organization: {
            select: { name: true, slug: true, settings: true },
          },
        },
      }),
      this.prisma.chain_partnerships.count({ where }),
    ])

    return {
      items: rows.map((r) =>
        this.mapEntity(
          r,
          r.partner_organization?.name,
          r.partner_organization?.slug,
          r.partner_organization?.settings
        )
      ),
      total,
    }
  }

  async findPartnershipById(id: string): Promise<ChainPartnershipEntity | null> {
    const row = await this.prisma.chain_partnerships.findUnique({
      where: { id },
      include: {
        partner_organization: {
          select: { name: true, slug: true, settings: true },
        },
      },
    })
    return row
      ? this.mapEntity(
          row,
          row.partner_organization?.name,
          row.partner_organization?.slug,
          row.partner_organization?.settings
        )
      : null
  }

  async updateStatus(id: string, status: PartnershipStatus): Promise<ChainPartnershipEntity> {
    const row = await this.prisma.chain_partnerships.update({
      where: { id },
      data: { status },
      include: {
        partner_organization: {
          select: { name: true, slug: true },
        },
      },
    })
    return this.mapEntity(row, row.partner_organization?.name, row.partner_organization?.slug)
  }

  async findStoreByIdentifier(identifier: string): Promise<{
    orgId: string
    orgName: string
    founderUserId: string
    contactEmail: string
    contactPhone?: string | undefined
    address?: string | undefined
  } | null> {
    const trimmed = identifier.trim().toLowerCase()

    // 1. Thử tìm qua slug hoặc tên tổ chức
    const org = await this.prisma.organizations.findFirst({
      where: {
        OR: [{ slug: trimmed }, { name: { equals: identifier.trim(), mode: "insensitive" } }],
      },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
          take: 1,
        },
      },
    })

    // 2. Nếu không thấy, thử tìm qua email người dùng
    if (!org) {
      const user = await this.prisma.users.findUnique({
        where: { email: trimmed },
        include: {
          memberships: {
            include: { organization: true },
            take: 1,
          },
        },
      })
      if (user && user.memberships[0]?.organization) {
        const foundOrg = user.memberships[0].organization
        const settings = (foundOrg.settings as Record<string, unknown> | null) ?? {}
        return {
          orgId: foundOrg.id,
          orgName: foundOrg.name,
          founderUserId: user.id,
          contactEmail: user.email,
          contactPhone: user.phone ?? undefined,
          address: typeof settings.address === "string" ? settings.address : undefined,
        }
      }
    }

    if (!org) return null

    const founderUser = org.memberships[0]?.user
    const settings = (org.settings as Record<string, unknown> | null) ?? {}

    return {
      orgId: org.id,
      orgName: org.name,
      founderUserId: founderUser?.id || "",
      contactEmail: founderUser?.email || "",
      contactPhone: founderUser?.phone ?? undefined,
      address: typeof settings.address === "string" ? settings.address : undefined,
    }
  }

  async linkExistingStore(params: {
    chainOrgId: string
    partnerOrgId: string
    partnerCode: string
    partnershipType?: string | undefined
    commissionRate?: number | undefined
    capacityDaily?: number | undefined
    contactName?: string | undefined
    contactPhone?: string | undefined
    contactEmail?: string | undefined
  }): Promise<ChainPartnershipEntity> {
    const updateData: any = {
      status: "ACTIVE",
      partner_code: params.partnerCode,
      partnership_type: params.partnershipType ?? "SUBCONTRACTOR",
      commission_rate: params.commissionRate ? Number(params.commissionRate) : null,
      capacity_daily: params.capacityDaily ?? 10,
    }
    if (params.contactName !== undefined) updateData.contact_name = params.contactName
    if (params.contactPhone !== undefined) updateData.contact_phone = params.contactPhone
    if (params.contactEmail !== undefined) updateData.contact_email = params.contactEmail

    const row = await this.prisma.chain_partnerships.upsert({
      where: {
        chain_org_id_partner_org_id: {
          chain_org_id: params.chainOrgId,
          partner_org_id: params.partnerOrgId,
        },
      },
      update: updateData,
      create: {
        chain_org_id: params.chainOrgId,
        partner_org_id: params.partnerOrgId,
        partner_code: params.partnerCode,
        partnership_type: params.partnershipType ?? "SUBCONTRACTOR",
        status: "ACTIVE",
        commission_rate: params.commissionRate ? Number(params.commissionRate) : null,
        capacity_daily: params.capacityDaily ?? 10,
        contact_name: params.contactName ?? null,
        contact_phone: params.contactPhone ?? null,
        contact_email: params.contactEmail ?? null,
      },
      include: {
        partner_organization: {
          select: { name: true },
        },
      },
    })

    const partnerName = (row as any).partner_organization?.name
    return this.mapEntity(row, partnerName)
  }



  private mapEntity(
    row: any,
    partnerOrgName?: string,
    partnerOrgSlug?: string,
    partnerSettings?: unknown
  ): ChainPartnershipEntity {
    const s = partnerSettings && typeof partnerSettings === "object" ? (partnerSettings as Record<string, unknown>) : {}
    const unlocked = Array.isArray(s.unlocked_tools)
      ? (s.unlocked_tools as unknown[]).filter((x): x is string => typeof x === "string")
      : null

    return {
      id: row.id,
      chainOrgId: row.chain_org_id,
      partnerOrgId: row.partner_org_id,
      partnerCode: row.partner_code,
      partnershipType: row.partnership_type as PartnershipType,
      status: row.status as PartnershipStatus,
      commissionRate: row.commission_rate ? Number(row.commission_rate) : undefined,
      capacityDaily: row.capacity_daily,
      contactName: row.contact_name ?? undefined,
      contactPhone: row.contact_phone ?? undefined,
      contactEmail: row.contact_email ?? undefined,
      address: row.address ?? undefined,
      province: row.province ?? undefined,
      district: row.district ?? undefined,
      partnerOrgName: partnerOrgName ?? undefined,
      partnerOrgSlug: partnerOrgSlug ?? undefined,
      unlockedTools: unlocked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

let defaultRepo: IChainPartnershipRepository | null = null

export function getChainPartnershipRepository(): IChainPartnershipRepository {
  if (!defaultRepo) {
    defaultRepo = new PrismaChainPartnershipRepository()
  }
  return defaultRepo
}
