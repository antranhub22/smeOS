import { prisma } from "@/core/tenancy/infra/prisma"
import type { registration_requests, registration_status } from "@/generated/prisma"
import type { DbClient } from "./db-client"

export type { registration_requests }

export class RegistrationRequestRepository {
  constructor(private readonly db: DbClient = prisma) {}

  create(input: {
    organizationId: string
    userId: string
    applicantEmail: string
    applicantName: string | null
    orgName: string
    industryKey: string | null
  }): Promise<registration_requests> {
    return this.db.registration_requests.create({
      data: {
        organization_id: input.organizationId,
        user_id: input.userId,
        applicant_email: input.applicantEmail,
        applicant_name: input.applicantName,
        org_name: input.orgName,
        industry_key: input.industryKey,
      },
    })
  }

  findByOrganizationId(organizationId: string): Promise<registration_requests | null> {
    return this.db.registration_requests.findUnique({
      where: { organization_id: organizationId },
    })
  }

  findById(id: string): Promise<registration_requests | null> {
    return this.db.registration_requests.findUnique({ where: { id } })
  }

  /** Danh sách đăng ký chờ duyệt — mới nhất lên đầu. */
  listByStatus(status: registration_status): Promise<registration_requests[]> {
    return this.db.registration_requests.findMany({
      where: { status },
      orderBy: { submitted_at: "desc" },
    })
  }

  /** Toàn bộ danh sách — dùng cho trang quản lý van-hanh. */
  listAll(): Promise<registration_requests[]> {
    return this.db.registration_requests.findMany({
      orderBy: { submitted_at: "desc" },
    })
  }

  updateStatus(
    id: string,
    status: registration_status,
    reviewerId: string,
    reviewNote: string | null
  ): Promise<registration_requests> {
    return this.db.registration_requests.update({
      where: { id },
      data: {
        status,
        reviewer_id: reviewerId,
        review_note: reviewNote,
        reviewed_at: new Date(),
      },
    })
  }
}
