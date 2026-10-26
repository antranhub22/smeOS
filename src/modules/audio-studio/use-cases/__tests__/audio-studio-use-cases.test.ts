/**
 * Unit tests — audio-studio use-cases với Mock repositories.
 *
 * Không cần DB thật. Dùng vi.mock() để thay thế factory functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// ============================================================
// MOCK factories trước khi import use-cases
// ============================================================

vi.mock("@/modules/audio-studio/infra/audio-job-repository", () => ({
  getAudioJobRepository: () => mockAudioJobRepo,
}))

vi.mock("@/modules/audio-studio/infra/voice-clone-repository", () => ({
  getVoiceCloneRepository: () => mockVoiceCloneRepo,
}))

vi.mock("@/modules/audio-studio/infra/music-track-repository", () => ({
  getMusicTrackRepository: () => mockMusicTrackRepo,
}))

vi.mock("@/core/http/errors", async () => {
  const { AppError } = await vi.importActual<typeof import("@/core/http/errors")>("@/core/http/errors")
  return {
    AppError,
    notFound: () => new AppError("NOT_FOUND", "Not found"),
    unprocessable: (msg: string) => new AppError("UNPROCESSABLE_ENTITY", msg),
    validationFailed: (e: Record<string, string>) => new AppError("VALIDATION_FAILED", JSON.stringify(e)),
  }
})

vi.mock("@/modules/usage/use-cases/refund-job", () => ({
  refundJob: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/modules/usage/use-cases/refund-partial", () => ({
  refundPartial: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/modules/assets/adapters/storage-provider-factory", () => ({
  getStorageProvider: () => ({
    signedUrl: vi.fn().mockResolvedValue("https://example.com/signed"),
  }),
}))

vi.mock("@/modules/jobs/infra/generation-job-repository", () => ({
  GenerationJobRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn().mockResolvedValue(null),
  })),
  getGenerationJobRepository: vi.fn().mockReturnValue({
    findById: vi.fn().mockResolvedValue(null),
  }),
}))

vi.mock("@/core/rbac/capabilities", () => ({
  requireCapability: vi.fn(),
}))

import type { IAudioJobRepository } from "@/modules/audio-studio/domain/repositories/audio-job-repository.interface"
import type { IVoiceCloneRepository, VoiceCloneData } from "@/modules/audio-studio/domain/repositories/voice-clone-repository.interface"
import type { IMusicTrackRepository, MusicTrackData } from "@/modules/audio-studio/domain/repositories/music-track-repository.interface"
import type { AudioJobEntity } from "@/modules/audio-studio/domain/audio-types"
import type { TenantContext } from "@/core/tenancy"

// ============================================================
// MOCKS IN-MEMORY
// ============================================================

const mockAudioJob: AudioJobEntity = {
  id: "job-001",
  organizationId: "org-001",
  taskType: "VOICEOVER",
  stage: "COMPLETED",
  voiceId: "flora-nu-truyen-cam",
  providerKey: "openai",
  qualityTier: "standard",
  musicTrackId: null,
  musicMood: "warm",
  totalDurationSeconds: 30,
  mixedAudioUrl: null,
  mixedAudioStorageKey: "org/org-001/audio/job-001.mp3",
  voiceOnlyUrl: null,
  bgmOnlyUrl: null,
  costCredits: 5,
  errorMessage: null,
  scenes: [],
  createdAt: new Date("2026-10-01"),
  updatedAt: new Date("2026-10-01"),
}

const mockVoiceClone: VoiceCloneData = {
  id: "vc-001",
  name: "Giọng chủ tiệm",
  status: "READY",
  provider: "elevenlabs",
  provider_voice_id: "ev-123",
  error: null,
  job_id: "job-vc-001",
  sample_storage_key: "org/org-001/audio/voice-samples/vc-001.mp3",
  sample_mime_type: "audio/mpeg",
  sample_bytes: 500_000,
  consent_text: "Tôi đồng ý",
  consented_by: "user-001",
  consented_at: new Date("2026-10-01"),
  deleted_at: null,
  created_at: new Date("2026-10-01"),
  updated_at: new Date("2026-10-01"),
}

const mockMusicTrack: MusicTrackData = {
  id: "mt-001",
  organization_id: "org-001",
  title: "Nhạc nền thư giãn",
  mood: "warm",
  storage_key: "org/org-001/audio/music/mt-001.mp3",
  mime_type: "audio/mpeg",
  file_bytes: 3_000_000,
  duration_seconds: 120,
  license_type: "royalty_free",
  license_source: "https://example.com",
  license_note: null,
  attested_by: "user-001",
  attested_at: new Date("2026-10-01"),
  deleted_at: null,
  created_at: new Date("2026-10-01"),
  updated_at: new Date("2026-10-01"),
}

const mockAudioJobRepo: IAudioJobRepository = {
  findById: vi.fn().mockResolvedValue(mockAudioJob),
  findByOrganization: vi.fn().mockResolvedValue([mockAudioJob]),
}

const mockVoiceCloneRepo: IVoiceCloneRepository = {
  create: vi.fn().mockResolvedValue(mockVoiceClone),
  setJob: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(mockVoiceClone),
  list: vi.fn().mockResolvedValue([mockVoiceClone]),
  markDeleted: vi.fn().mockResolvedValue(undefined),
}

const mockMusicTrackRepo: IMusicTrackRepository = {
  create: vi.fn().mockResolvedValue(mockMusicTrack),
  findById: vi.fn().mockResolvedValue(mockMusicTrack),
  list: vi.fn().mockResolvedValue([mockMusicTrack]),
  markDeleted: vi.fn().mockResolvedValue(true),
}

const ctx: TenantContext = {
  organizationId: "org-001",
  workspaceId: "ws-001",
  userId: "user-001",
  branchId: null,
  capabilities: new Set(["I1"]),
}

// ============================================================
// TESTS
// ============================================================

describe("audio-studio: IAudioJobRepository port", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mockAudioJobRepo.findById).mockResolvedValue(mockAudioJob)
    vi.mocked(mockVoiceCloneRepo.findById).mockResolvedValue(mockVoiceClone)
    vi.mocked(mockMusicTrackRepo.list).mockResolvedValue([mockMusicTrack])
    vi.mocked(mockMusicTrackRepo.markDeleted).mockResolvedValue(true)
  })

  it("IAudioJobRepository.findById trả về job entity", async () => {
    const result = await mockAudioJobRepo.findById(ctx, "job-001")
    expect(result).toMatchObject({ id: "job-001", stage: "COMPLETED" })
  })

  it("IAudioJobRepository.findByOrganization trả về danh sách jobs", async () => {
    const result = await mockAudioJobRepo.findByOrganization(ctx, { limit: 10 })
    expect(result).toHaveLength(1)
    expect(result[0]!.taskType).toBe("VOICEOVER")
  })

  it("IAudioJobRepository.findById trả về null khi không tìm thấy job", async () => {
    vi.mocked(mockAudioJobRepo.findById).mockResolvedValue(null)
    const result = await mockAudioJobRepo.findById(ctx, "not-found")
    expect(result).toBeNull()
  })
})

describe("audio-studio: IVoiceCloneRepository port", () => {
  it("IVoiceCloneRepository.list trả về danh sách voice clones", async () => {
    const rows = await mockVoiceCloneRepo.list(ctx)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.name).toBe("Giọng chủ tiệm")
  })

  it("IVoiceCloneRepository.findById trả về clone theo id", async () => {
    const result = await mockVoiceCloneRepo.findById(ctx, "vc-001")
    expect(result!.status).toBe("READY")
    expect(result!.provider_voice_id).toBe("ev-123")
  })

  it("IVoiceCloneRepository.findById trả về null khi không tìm thấy", async () => {
    vi.mocked(mockVoiceCloneRepo.findById).mockResolvedValue(null)
    const result = await mockVoiceCloneRepo.findById(ctx, "not-exist")
    expect(result).toBeNull()
  })
})

describe("audio-studio: IMusicTrackRepository port", () => {
  it("IMusicTrackRepository.list trả về danh sách music tracks", async () => {
    const rows = await mockMusicTrackRepo.list(ctx)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.title).toBe("Nhạc nền thư giãn")
  })

  it("IMusicTrackRepository.markDeleted trả về true khi xóa thành công", async () => {
    const result = await mockMusicTrackRepo.markDeleted(ctx, "mt-001")
    expect(result).toBe(true)
  })

  it("IMusicTrackRepository.findById trả về track theo id", async () => {
    const result = await mockMusicTrackRepo.findById(ctx, "mt-001")
    expect(result!.mood).toBe("warm")
    expect(result!.license_type).toBe("royalty_free")
  })
})
