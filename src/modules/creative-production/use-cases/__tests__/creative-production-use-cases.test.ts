import { describe, expect, it, vi, beforeEach } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import type { ICampaignPackageRepository } from "../../domain/repositories/campaign-package-repository.interface"
import type { IContentDraftRepository } from "../../domain/repositories/content-draft-repository.interface"
import type { ICreativeProductionRepository } from "../../domain/repositories/creative-production-repository.interface"
import type { IAssetRepository } from "@/modules/assets/domain/repositories/asset-repository.interface"
import type { IVideoJobRepository } from "@/modules/video-studio/domain/repositories/video-job-repository.interface"
import type { IAudioJobRepository } from "@/modules/audio-studio/domain/repositories/audio-job-repository.interface"
import { saveContentDraft, getContentDraft } from "../content-draft"
import {
  createCampaignPackage,
  getCampaignPackage,
  listCampaignPackages,
  saveLaunchPlan,
} from "../manage-campaign-package"
import { getCreativeProductionRepository } from "../../infra/creative-production-repository"

const ctx: TenantContext = {
  organizationId: "org-test-01",
  userId: "user-test-01",
  workspaceId: "ws-test-01",
  branchId: null,
  capabilities: new Set(["I1"]),
}

describe("creative-production: Content Draft use-cases with DI", () => {
  const mockDraftRepo: IContentDraftRepository = {
    find: vi.fn(),
    upsert: vi.fn(),
  }

  const mockAssetRepo: IAssetRepository = {
    findById: vi.fn(),
    findByOrganizationId: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findMasterByJobId: vi.fn(),
    approve: vi.fn(),
    findApprovedMaster: vi.fn(),
    listByJobId: vi.fn(),
    listDerivedFrom: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("saveContentDraft gọi repository upsert sau khi kiểm tra asset hợp lệ", async () => {
    vi.mocked(mockAssetRepo.findById).mockResolvedValue({
      id: "asset-01",
      organization_id: "org-test-01",
      kind: "MASTER",
      status: "READY",
      approval_state: "APPROVED",
    } as never)

    vi.mocked(mockDraftRepo.upsert).mockResolvedValue({
      id: "draft-01",
      organization_id: "org-test-01",
      asset_id: "asset-01",
      topic_id: "topic-01",
      mode: "CREATIVE",
      topic_title: "Chủ đề thử nghiệm",
      posts: [],
      updated_at: new Date("2026-10-25T12:00:00Z"),
    } as never)

    const result = await saveContentDraft(
      ctx,
      { assetId: "asset-01", topicId: "topic-01", mode: "CREATIVE" },
      { posts: [], topicTitle: "Chủ đề thử nghiệm" },
      mockDraftRepo,
      mockAssetRepo
    )

    expect(result.asset_id).toBe("asset-01")
    expect(result.topic_title).toBe("Chủ đề thử nghiệm")
    expect(mockDraftRepo.upsert).toHaveBeenCalledTimes(1)
  })

  it("getContentDraft trả về null khi không tìm thấy", async () => {
    vi.mocked(mockDraftRepo.find).mockResolvedValue(null)

    const result = await getContentDraft(
      ctx,
      { assetId: "asset-01", topicId: "topic-01", mode: "CREATIVE" },
      mockDraftRepo
    )

    expect(result).toBeNull()
  })
})

describe("creative-production: Campaign Package use-cases with DI", () => {
  const mockPackageRepo: ICampaignPackageRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    updateDraft: vi.fn(),
    saveQa: vi.fn(),
    approve: vi.fn(),
    saveLaunchPlan: vi.fn(),
    orderFactsForProduct: vi.fn(),
    countConversationsSince: vi.fn(),
    metricFacts: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("listCampaignPackages trả về danh sách gói chiến dịch", async () => {
    vi.mocked(mockPackageRepo.list).mockResolvedValue([
      {
        id: "pkg-01",
        name: "Chiến dịch Thu Đông",
        status: "DRAFT",
        master_asset_id: "asset-01",
        approved_at: null,
        created_at: new Date("2026-10-25T10:00:00Z"),
      } as never,
    ])

    const result = await listCampaignPackages(ctx, { limit: 10 }, mockPackageRepo)
    expect(result.data).toHaveLength(1)
    expect(result.data[0]!.name).toBe("Chiến dịch Thu Đông")
    expect(mockPackageRepo.list).toHaveBeenCalledWith(ctx, { masterAssetId: undefined, limit: 10 })
  })

  it("saveLaunchPlan từ chối nếu gói chưa duyệt", async () => {
    vi.mocked(mockPackageRepo.findById).mockResolvedValue({
      id: "pkg-01",
      status: "DRAFT",
    } as never)

    await expect(
      saveLaunchPlan(
        ctx,
        "pkg-01",
        { channels: [], scheduledAt: null, postRefs: [] },
        mockPackageRepo
      )
    ).rejects.toThrow("Chỉ lập kế hoạch đăng cho gói đã duyệt")
  })
})

describe("creative-production: ICreativeProductionRepository port", () => {
  it("getCreativeProductionRepository singleton factory hoạt động chính xác", async () => {
    const repo = getCreativeProductionRepository()
    expect(repo).toBeDefined()
    expect(typeof repo.saveCampaign).toBe("function")
    expect(typeof repo.getCampaign).toBe("function")
    expect(typeof repo.updateCampaignStatus).toBe("function")
    expect(typeof repo.listCampaigns).toBe("function")
  })
})
