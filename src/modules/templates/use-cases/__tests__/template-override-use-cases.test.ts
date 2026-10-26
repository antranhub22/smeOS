import { describe, it, expect, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import type {
  ITemplateOverrideRepository,
  TemplateOverrideRecord,
} from "../../domain/repositories/template-override-repository.interface"
import { getTemplateOverrides } from "../get-template-overrides"
import { setTemplateOverride } from "../set-template-override"
import { removeTemplateOverride } from "../remove-template-override"

const mockCtx: TenantContext = {
  organizationId: "org-test-123",
  workspaceId: "ws-test-123",
  userId: "user-test-123",
  branchId: null,
  capabilities: new Set(),
}

describe("Template Overrides Use Cases", () => {
  it("getTemplateOverrides delegates to repository listForTemplate", async () => {
    const mockRecord: TemplateOverrideRecord = {
      id: "override-1",
      organization_id: "org-test-123",
      template_family: "SALES",
      template_key: "floral-a6",
      field_key: "shop_phone",
      value: "0901234567",
      updated_by: "user-test-123",
      created_at: new Date(),
      updated_at: new Date(),
    }
    const mockRepo: ITemplateOverrideRepository = {
      findByKey: vi.fn(),
      listForTemplate: vi.fn().mockResolvedValue([mockRecord]),
      upsert: vi.fn(),
      remove: vi.fn(),
    }

    const result = await getTemplateOverrides(mockCtx, "floral-a6", mockRepo)
    expect(result).toEqual([mockRecord])
    expect(mockRepo.listForTemplate).toHaveBeenCalledWith(mockCtx, "floral-a6")
  })

  it("setTemplateOverride validates input and saves via repository", async () => {
    const mockRecord: TemplateOverrideRecord = {
      id: "override-2",
      organization_id: "org-test-123",
      template_family: "ST",
      template_key: "sales_pitch_zalo",
      field_key: "greeting_line",
      value: "Chào bạn",
      updated_by: "user-test-123",
      created_at: new Date(),
      updated_at: new Date(),
    }
    const mockRepo: ITemplateOverrideRepository = {
      findByKey: vi.fn(),
      listForTemplate: vi.fn(),
      upsert: vi.fn().mockResolvedValue(mockRecord),
      remove: vi.fn(),
    }

    const result = await setTemplateOverride(
      mockCtx,
      {
        templateFamily: "ST",
        templateKey: "sales_pitch_zalo",
        fieldKey: "greeting_line",
        value: "Chào bạn",
      },
      mockRepo
    )

    expect(result).toEqual(mockRecord)
    expect(mockRepo.upsert).toHaveBeenCalledWith(mockCtx, {
      templateFamily: "ST",
      templateKey: "sales_pitch_zalo",
      fieldKey: "greeting_line",
      value: "Chào bạn",
    })
  })

  it("removeTemplateOverride deletes through repository or throws notFound", async () => {
    const mockRepo: ITemplateOverrideRepository = {
      findByKey: vi.fn(),
      listForTemplate: vi.fn(),
      upsert: vi.fn(),
      remove: vi.fn().mockResolvedValue(true),
    }

    await expect(
      removeTemplateOverride(mockCtx, "floral-a6", "shipping_note", mockRepo)
    ).resolves.toBeUndefined()

    mockRepo.remove = vi.fn().mockResolvedValue(false)
    await expect(
      removeTemplateOverride(mockCtx, "floral-a6", "shipping_note", mockRepo)
    ).rejects.toThrow()
  })
})
