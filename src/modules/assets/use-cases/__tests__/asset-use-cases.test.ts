import { describe, it, expect, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import type { IAssetRepository, AssetEntity } from "../../domain/repositories/asset-repository.interface"
import { getAsset } from "../get-asset"
import { deleteAsset } from "../delete-asset"
import { listAssets } from "../list-assets"
import type { IProductRepository } from "@/modules/products/domain/repositories/product-repository.interface"

const mockTenant: TenantContext = {
  organizationId: "org-assets-1",
  branchId: null,
  userId: "user-1",
  workspaceId: "ws-1",
  capabilities: new Set(["G1", "G2", "G3"]),
}

const mockAsset: AssetEntity = {
  id: "ast_123",
  organization_id: "org-assets-1",
  product_id: "prod_1",
  parent_asset_id: null,
  kind: "ORIGINAL",
  state: "READY",
  version: 1,
  storage_key: "org/org-assets-1/prod_1/ast_123.jpg",
  thumb_key: null,
  mime_type: "image/jpeg",
  width: 1000,
  height: 1000,
  aspect_ratio: "1:1",
  file_size: 102400,
  provider: null,
  model: null,
  model_version: null,
  pipeline_version: null,
  parameters: null,
  prompt: null,
  input_sha256: null,
  output_sha256: null,
  quality_score: 95,
  identity_score: 95,
  generated_flags: null,
  cost_usd: null,
  metadata: null,
  approval_state: "APPROVED",
  approved_by: "user-1",
  approved_at: new Date(),
  created_by: "user-1",
  created_at: new Date(),
}

function createMockAssetRepo(overrides?: Partial<IAssetRepository>): IAssetRepository {
  return {
    findById: vi.fn().mockResolvedValue(mockAsset),
    findByOrganizationId: vi.fn().mockResolvedValue(mockAsset),
    list: vi.fn().mockResolvedValue([mockAsset]),
    create: vi.fn().mockResolvedValue(mockAsset),
    delete: vi.fn().mockResolvedValue(true),
    findMasterByJobId: vi.fn().mockResolvedValue(null),
    approve: vi.fn().mockResolvedValue(mockAsset),
    findApprovedMaster: vi.fn().mockResolvedValue(mockAsset),
    listByJobId: vi.fn().mockResolvedValue([]),
    listDerivedFrom: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

describe("Asset Use-Cases with IAssetRepository Port", () => {
  describe("getAsset", () => {
    it("trả về thông tin asset khi tồn tại", async () => {
      const repo = createMockAssetRepo()
      const result = await getAsset(mockTenant, "ast_123", repo)

      expect(repo.findById).toHaveBeenCalledWith(mockTenant, "ast_123")
      expect(result.id).toBe("ast_123")
    })

    it("ném lỗi 404 khi không tìm thấy", async () => {
      const repo = createMockAssetRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      await expect(getAsset(mockTenant, "ast_unknown", repo)).rejects.toThrow()
    })
  })

  describe("deleteAsset", () => {
    it("xóa asset thành công", async () => {
      const repo = createMockAssetRepo()
      const purge = vi.fn().mockResolvedValue(undefined)
      await expect(deleteAsset(mockTenant, "ast_123", repo, purge)).resolves.toBeUndefined()
      expect(repo.delete).toHaveBeenCalledWith(mockTenant, "ast_123")
      expect(purge).toHaveBeenCalledWith(mockTenant, mockAsset)
    })

    it("ném lỗi 404 khi không thấy asset, không xoá gì", async () => {
      const repo = createMockAssetRepo({ findById: vi.fn().mockResolvedValue(null) })
      const purge = vi.fn()
      await expect(deleteAsset(mockTenant, "ast_unknown", repo, purge)).rejects.toThrow()
      expect(repo.delete).not.toHaveBeenCalled()
      expect(purge).not.toHaveBeenCalled()
    })

    it("ném lỗi 404 khi xóa thất bại", async () => {
      const repo = createMockAssetRepo({
        delete: vi.fn().mockResolvedValue(false),
      })
      await expect(deleteAsset(mockTenant, "ast_unknown", repo)).rejects.toThrow()
    })
  })

  describe("listAssets", () => {
    it("trả về danh sách asset kèm phân trang", async () => {
      const assetRepo = createMockAssetRepo()
      const productRepo: IProductRepository = {
        findById: vi.fn().mockResolvedValue({ id: "prod_1", name: "Sản phẩm A" } as never),
        findByCode: vi.fn().mockResolvedValue(null),
        listExistingCodes: vi.fn().mockResolvedValue(new Set()),
        list: vi.fn().mockResolvedValue([]),
        listWithPreview: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        updateIdentity: vi.fn(),
      }

      const result = await listAssets(
        mockTenant,
        { limit: 10 },
        assetRepo,
        productRepo
      )

      expect(assetRepo.list).toHaveBeenCalled()
      expect(result.data).toHaveLength(1)
      expect(result.data[0]?.id).toBe("ast_123")
      expect(result.data[0]?.product_name).toBe("Sản phẩm A")
    })
  })
})
