import type { PrismaClient } from "@/generated/prisma/client"

/** Tìm cửa hàng sẵn có theo slug, tên hoặc email chủ — tách khỏi `prisma-partnership-repository.ts` (K11). */
export interface StoreByIdentifier {
  orgId: string
  orgName: string
  founderUserId: string
  contactEmail: string
  contactPhone?: string | undefined
  address?: string | undefined
}

export async function findStoreByIdentifier(db: PrismaClient, identifier: string): Promise<StoreByIdentifier | null> {
  const trimmed = identifier.trim().toLowerCase()

  // 1. Thử tìm qua slug hoặc tên tổ chức
  const org = await db.organizations.findFirst({
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
    const user = await db.users.findUnique({
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
