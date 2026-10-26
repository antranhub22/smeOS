import { AppError, conflict, validationFailed } from "@/core/http/errors"
import {
  isAcceptablePassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/modules/organization/domain/credentials"
import {
  DEFAULT_WORKSPACE_NAME,
  TRIAL_CREDIT_BALANCE,
  TRIAL_LIMIT,
} from "@/modules/organization/domain/experience"
import { slugCandidates } from "@/modules/organization/domain/slug"
import { FOUNDER_ROLE_KEY } from "@/modules/organization/domain/system-roles"
import { MembershipRepository, getMembershipRepository } from "@/modules/organization/infra/membership-repository"
import { OrganizationRepository, getOrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { hashPassword } from "@/modules/organization/infra/password-hasher"
import { RegistrationRequestRepository, getRegistrationRequestRepository } from "@/modules/organization/infra/registration-request-repository"
import { RoleRepository, getRoleRepository } from "@/modules/organization/infra/role-repository"
import { OccasionRepository, getOccasionRepository } from "@/modules/organization/infra/occasion-repository"
import { runInTransaction } from "@/modules/organization/infra/transaction"
import { UserRepository, getUserRepository } from "@/modules/organization/infra/user-repository"
import { WorkspaceRepository, getWorkspaceRepository } from "@/modules/organization/infra/workspace-repository"
import { seedExperienceMasterProfile } from "@/modules/profiles/use-cases/seed-experience-profile"

export type SignUpInput = {
  email: string
  password: string
  name?: string | null
  organizationName: string
  industryKey?: string | undefined
  organizationType?: "SINGLE" | "CHAIN" | undefined
  seedProfile?: boolean | undefined
}

export type SignUpResult = {
  /** Đơn đăng ký đang chờ Super Admin duyệt — không tạo session. */
  status: "PENDING_APPROVAL"
  userId: string
  organizationId: string
}

/**
 * Đăng ký tạo người dùng **và** tổ chức — tài khoản ở trạng thái CHỜ DUYỆT.
 *
 * Luồng Approval Gate (giai đoạn thử nghiệm beta):
 * - Membership của Founder được tạo với status = INVITED (chưa active).
 * - Bản ghi `registration_requests` được tạo với status = PENDING.
 * - KHÔNG tạo session — user phải đăng nhập lại sau khi được duyệt.
 * - Super Admin vào /van-hanh → tab Đăng ký mới → duyệt → membership → ACTIVE.
 *
 * Cả bốn bản ghi (user, org, workspace, membership, registration_request) trong
 * một giao dịch — giao dịch hỏng thì không sinh ra org mồ côi.
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) throw validationFailed({ email: "Địa chỉ thư không hợp lệ" })
  if (!isAcceptablePassword(input.password)) {
    throw validationFailed({ password: `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự` })
  }
  const organizationName = input.organizationName.trim()
  if (organizationName.length === 0) {
    throw validationFailed({ organization_name: "Tên tổ chức không được để trống" })
  }

  // Băm trước khi mở giao dịch: bcrypt cố ý chậm, giữ giao dịch mở trong lúc
  // băm là giữ khoá cơ sở dữ liệu không vì lý do gì.
  const passwordHash = await hashPassword(input.password)

  return runInTransaction(async (tx) => {
    const users = getUserRepository(tx)
    const organizations = getOrganizationRepository(tx)
    const workspaces = getWorkspaceRepository(tx)
    const roles = getRoleRepository(tx)
    const memberships = getMembershipRepository(tx)
    const registrations = getRegistrationRequestRepository(tx)

    if (await users.findByEmail(email)) {
      throw conflict("Địa chỉ thư này đã có tài khoản")
    }

    const user = await users.create({
      email,
      password_hash: passwordHash,
      name: input.name?.trim() || null,
    })

    let slug: string | null = null
    for (const candidate of slugCandidates(organizationName)) {
      if (await organizations.findBySlug(candidate)) continue
      slug = candidate
      break
    }
    if (!slug) throw conflict("Không sinh được định danh cho tên tổ chức này")

    const chosenIndustry = input.industryKey || "FLORAL"
    const chosenType = input.organizationType === "CHAIN" ? "CHAIN" : "SINGLE"
    const isChain = chosenType === "CHAIN"

    const organization = await organizations.create({
      name: organizationName,
      slug,
      type: chosenType,
      credit_balance: TRIAL_CREDIT_BALANCE,
      settings: {
        industry: chosenIndustry,
        industry_locked: true,
        brochure_workflow_policy: {
          require_coordinator_acceptance: isChain,
        },
      },
    })

    const workspace = await workspaces.createForNewOrganization({
      organizationId: organization.id,
      name: DEFAULT_WORKSPACE_NAME,
      kind: "EXPERIENCE",
      trial_limit: TRIAL_LIMIT,
      trial_status: "ACTIVE",
    })

    await getOccasionRepository(tx).seedDefault({
      organizationId: organization.id,
      workspaceId: workspace.id,
      userId: user.id,
      branchId: null,
      capabilities: new Set<string>(),
    })
    if (input.seedProfile) {
      await seedExperienceMasterProfile(tx, organization.id, chosenIndustry)
    }

    const founderRole = await roles.findSystemRoleByKey(FOUNDER_ROLE_KEY)
    if (!founderRole) {
      throw new AppError(
        "INTERNAL",
        `Thiếu vai hệ thống ${FOUNDER_ROLE_KEY}. Chạy \`npm run db:seed\`.`
      )
    }

    // Approval Gate: membership ở trạng thái INVITED cho đến khi Super Admin duyệt.
    await memberships.createForNewOrganization({
      organizationId: organization.id,
      userId: user.id,
      roleId: founderRole.id,
      status: "INVITED",
      joinedAt: null,
    })

    // Tạo đơn đăng ký chờ duyệt.
    await registrations.create({
      organizationId: organization.id,
      userId: user.id,
      applicantEmail: email,
      applicantName: input.name?.trim() ?? null,
      orgName: organizationName,
      industryKey: chosenIndustry,
    })

    return { status: "PENDING_APPROVAL" as const, userId: user.id, organizationId: organization.id }
  })
}
