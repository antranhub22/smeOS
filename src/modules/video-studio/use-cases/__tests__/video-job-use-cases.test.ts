import { describe, it, expect, vi } from "vitest"
import type { TenantContext } from "@/core/tenancy"
import type { IVideoJobRepository, VideoJobWithScenes } from "../../domain/repositories/video-job-repository.interface"
import { CreateVideoJobUseCase } from "../create-video-job"
import { GetVideoJobUseCase } from "../get-video-job"
import { ListVideoJobsUseCase } from "../list-video-jobs"
import { ApproveStoryboardUseCase } from "../approve-storyboard"

function createMockContext(capabilities: string[] = ["I1", "P3", "P4"]): TenantContext {
  return {
    organizationId: "org_video_test",
    userId: "usr_video_producer",
    capabilities: new Set(capabilities),
  } as unknown as TenantContext
}

function createMockJob(overrides: Partial<VideoJobWithScenes> = {}): VideoJobWithScenes {
  return {
    id: "job_video_1",
    organization_id: "org_video_test",
    product_id: "prod_1",
    title: "Video giới thiệu sản phẩm",
    format: "REEL_15S",
    stage: "DRAFT",
    duration_seconds: 15,
    aspect_ratio: "9:16",
    music_track: null,
    voice_code: null,
    has_subtitle: true,
    caption_style: "MODERN_BADGE",
    has_watermark: false,
    cost_credits: 25,
    script_approval: "PENDING",
    script_approved_at: null,
    script_approved_by: null,
    video_approval: "PENDING",
    video_approved_at: null,
    video_approved_by: null,
    final_video_url: null,
    final_asset_id: null,
    error_message: null,
    scene_plan_id: null,
    scene_plan_revision: null,
    audio_job_id: null,
    audio_storage_key: null,
    created_at: new Date(),
    updated_at: new Date(),
    scenes: [
      {
        id: "sc_1",
        video_job_id: "job_video_1",
        scene_index: 1,
        duration_seconds: 5,
        image_asset_id: "ast_1",
        text_overlay: "Khám phá phong cách mới",
        voice_script: "Xin chào",
        transition_effect: "fade",
        motion_effect: "zoom_in",
        created_at: new Date(),
      },
      {
        id: "sc_2",
        video_job_id: "job_video_1",
        scene_index: 2,
        duration_seconds: 10,
        image_asset_id: "ast_2",
        text_overlay: "Đặt hàng ngay hôm nay",
        voice_script: "Liên hệ ngay",
        transition_effect: "fade",
        motion_effect: "pan_right",
        created_at: new Date(),
      },
    ],
    ...overrides,
  }
}

function createMockRepo(overrides: Partial<IVideoJobRepository> = {}): IVideoJobRepository {
  return {
    create: vi.fn().mockResolvedValue(createMockJob()),
    findById: vi.fn().mockResolvedValue(createMockJob()),
    list: vi.fn().mockResolvedValue([createMockJob()]),
    updateScenes: vi.fn().mockResolvedValue(createMockJob()),
    attachPlanAudio: vi.fn().mockResolvedValue(undefined),
    fillMissingSceneImages: vi.fn().mockResolvedValue(undefined),
    approveScript: vi.fn().mockResolvedValue(createMockJob({ script_approval: "APPROVED", stage: "SCRIPT_APPROVED" })),
    updateStage: vi.fn().mockResolvedValue(createMockJob()),
    approveVideo: vi.fn().mockResolvedValue(createMockJob({ video_approval: "APPROVED", stage: "APPROVED" })),
    ...overrides,
  }
}

describe("Video Studio Use-Cases with IVideoJobRepository Port", () => {
  describe("CreateVideoJobUseCase", () => {
    it("tạo video job thành công khi truyền repo mock", async () => {
      const ctx = createMockContext(["I1"])
      const mockRepo = createMockRepo()
      const useCase = new CreateVideoJobUseCase(mockRepo)

      const result = await useCase.execute(ctx, {
        title: "Video Reel Mùa Xuân",
        format: "REEL_15S",
        scenes: [
          { sceneIndex: 1, durationSeconds: 5, textOverlay: "Cảnh 1" },
          { sceneIndex: 2, durationSeconds: 10, textOverlay: "Cảnh 2" },
        ],
      })

      expect(result.id).toBe("job_video_1")
      expect(mockRepo.create).toHaveBeenCalled()
    })
  })

  describe("GetVideoJobUseCase", () => {
    it("lấy thông tin video job thành công", async () => {
      const ctx = createMockContext(["I1"])
      const mockRepo = createMockRepo()
      const useCase = new GetVideoJobUseCase(mockRepo)

      const result = await useCase.execute(ctx, "job_video_1")
      expect(result.id).toBe("job_video_1")
      expect(mockRepo.findById).toHaveBeenCalledWith(ctx, "job_video_1")
    })

    it("ném lỗi nếu job không tồn tại", async () => {
      const ctx = createMockContext(["I1"])
      const mockRepo = createMockRepo({ findById: vi.fn().mockResolvedValue(null) })
      const useCase = new GetVideoJobUseCase(mockRepo)

      await expect(useCase.execute(ctx, "job_nonexistent")).rejects.toThrow(
        "Không tìm thấy tác vụ video"
      )
    })
  })

  describe("ListVideoJobsUseCase", () => {
    it("liệt kê danh sách video jobs", async () => {
      const ctx = createMockContext(["I1"])
      const mockRepo = createMockRepo()
      const useCase = new ListVideoJobsUseCase(mockRepo)

      const list = await useCase.execute(ctx, { limit: 10 })
      expect(list).toHaveLength(1)
      expect(mockRepo.list).toHaveBeenCalledWith(ctx, { limit: 10 })
    })
  })

  describe("ApproveStoryboardUseCase", () => {
    it("duyệt storyboard thành công khi có quyền P3", async () => {
      const ctx = createMockContext(["P3"])
      const mockJob = createMockJob({
        stage: "SCRIPT_READY",
        script_approval: "PENDING",
      })
      const mockRepo = createMockRepo({
        findById: vi
          .fn()
          .mockResolvedValueOnce(mockJob)
          .mockResolvedValueOnce({
            ...mockJob,
            script_approval: "APPROVED",
            stage: "SCRIPT_APPROVED",
          }),
        approveScript: vi.fn().mockResolvedValue({
          ...mockJob,
          script_approval: "APPROVED",
          stage: "SCRIPT_APPROVED",
        }),
      })
      const useCase = new ApproveStoryboardUseCase(mockRepo)

      const approved = await useCase.execute(ctx, "job_video_1")
      expect(approved.script_approval).toBe("APPROVED")
      expect(mockRepo.approveScript).toHaveBeenCalledWith(ctx, "job_video_1", ctx.userId)
    })
  })
})
