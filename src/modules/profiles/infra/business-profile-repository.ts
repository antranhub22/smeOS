import type { business_profiles, InputJsonValue } from "./entities"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { TenantContext } from "@/core/tenancy"
import type { DbClient } from "./db-client"
import type {
  IBusinessProfileRepository,
  UpsertBusinessProfileInput,
} from "../domain/repositories/business-profile-repository.interface"

export type { UpsertBusinessProfileInput, IBusinessProfileRepository }

/**
 * `business_profiles` có đúng một bản ghi mỗi tổ chức
 * (`@@unique([organization_id])`, đặc tả 07 mục 4).
 *
 * `upsert` là nguồn của `PUT /business-profile` — PUT nghĩa là thay toàn bộ
 * bản ghi, nên mọi trường vắng mặt trong yêu cầu được ghi `null`, không giữ
 * nguyên giá trị cũ.
 */
export class BusinessProfileRepository implements IBusinessProfileRepository {
  constructor(private readonly db: DbClient = prisma) {}

  current(ctx: TenantContext): Promise<business_profiles | null> {
    return this.db.business_profiles.findUnique({
      where: { organization_id: ctx.organizationId },
    })
  }

  upsert(ctx: TenantContext, input: UpsertBusinessProfileInput): Promise<business_profiles> {
    const fields = {
      legal_name: input.legal_name ?? null,
      display_name: input.display_name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      website: input.website ?? null,
      social_links: (input.social_links ?? null) as InputJsonValue,
      tax_code: input.tax_code ?? null,
      description: input.description ?? null,
      operating_hours: (input.operating_hours ?? null) as InputJsonValue,
    }

    return this.db.business_profiles.upsert({
      where: { organization_id: ctx.organizationId },
      create: { organization_id: ctx.organizationId, ...fields },
      update: fields,
    })
  }
}

let defaultRepo: IBusinessProfileRepository | null = null

export function getBusinessProfileRepository(): IBusinessProfileRepository {
  if (!defaultRepo) {
    defaultRepo = new BusinessProfileRepository()
  }
  return defaultRepo
}
