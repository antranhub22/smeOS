import { afterEach, describe, expect, it, vi } from "vitest"

import type { PlatformContext } from "@/core/platform/platform-context"
import type { TenantContext } from "@/core/tenancy"
import * as auditModule from "@/modules/audit/use-cases/record-audit-log"
import { toStoredOrganizationType } from "@/modules/organization/domain/organization-type"
import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { requestOrganizationUpgrade } from "@/modules/organization/use-cases/request-organization-upgrade"
import { approveOrganizationModelChange } from "@/modules/platform/use-cases/approve-organization-model-change"

/** ADR-012 T-8a (D-55): `FLOWER_NETWORK` và `CHAIN` chỉ khác nhãn → mọi đường ghi lưu `CHAIN`. */
const tenantCtx: TenantContext = {
  organizationId: "org-t8",
  workspaceId: "ws-1",
  userId: "user-owner",
  branchId: null,
  capabilities: new Set(["F2"]),
}
const platformCtx: PlatformContext = { userId: "user-admin", capabilities: new Set(["N1", "N2"]) }

const org = (type: "SINGLE" | "CHAIN" | "FLOWER_NETWORK", settings: Record<string, unknown> = {}) => ({
  id: "org-t8", name: "Tiệm", slug: "tiem", type, credit_balance: 0, credit_plan: null, settings,
  data_region: "vn", created_at: new Date(), updated_at: new Date(),
})

describe("loại tổ chức FLOWER_NETWORK lưu thành CHAIN", () => {
  afterEach(() => vi.restoreAllMocks())

  it("toStoredOrganizationType chỉ đổi FLOWER_NETWORK", () => {
    expect(toStoredOrganizationType("FLOWER_NETWORK")).toBe("CHAIN")
    expect(toStoredOrganizationType("CHAIN")).toBe("CHAIN")
    expect(toStoredOrganizationType("SINGLE")).toBe("SINGLE")
  })

  it("gửi yêu cầu FLOWER_NETWORK → lưu yêu cầu CHAIN", async () => {
    vi.spyOn(auditModule, "recordAuditLog").mockResolvedValue(undefined as never)
    const save = vi.spyOn(OrganizationRepository.prototype, "updateSettings").mockResolvedValue(undefined)
    vi.spyOn(OrganizationRepository.prototype, "current").mockResolvedValue(org("SINGLE"))
    const result = await requestOrganizationUpgrade(tenantCtx, { requestedType: "FLOWER_NETWORK" })
    expect(result.pendingChange.requested_type).toBe("CHAIN")
    expect(save).toHaveBeenCalledWith(tenantCtx, expect.objectContaining({ pending_model_change: expect.objectContaining({ requested_type: "CHAIN" }) }))
  })

  it("tổ chức đã là CHAIN xin FLOWER_NETWORK → trùng mô hình", async () => {
    vi.spyOn(OrganizationRepository.prototype, "current").mockResolvedValue(org("CHAIN"))
    await expect(requestOrganizationUpgrade(tenantCtx, { requestedType: "FLOWER_NETWORK" })).rejects.toThrow("Tổ chức của bạn hiện đã ở mô hình này")
  })

  it("duyệt yêu cầu cũ FLOWER_NETWORK → tổ chức lưu CHAIN, bật điều phối nhận đơn", async () => {
    vi.spyOn(auditModule, "recordAuditLog").mockResolvedValue(undefined as never)
    vi.spyOn(OrganizationRepository.prototype, "findById").mockResolvedValue(org("SINGLE", { pending_model_change: { requested_type: "FLOWER_NETWORK" } }))
    const update = vi.spyOn(OrganizationRepository.prototype, "updateTypeAndSettings").mockResolvedValue({} as never)
    const result = await approveOrganizationModelChange(platformCtx, { organizationId: "org-t8", targetType: "FLOWER_NETWORK" })
    expect(result.targetType).toBe("CHAIN")
    expect(update).toHaveBeenCalledWith(
      "org-t8",
      "CHAIN",
      expect.objectContaining({ brochure_workflow_policy: expect.objectContaining({ require_coordinator_acceptance: true }) }),
    )
  })
})
