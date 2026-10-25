/**
 * AudioJobRepository — Infra layer cho Audio Studio.
 *
 * Delegate sang GenerationJobRepository (đã có sẵn) với filter
 * feature = "audio.generate". Không gọi Prisma trực tiếp ngoại trừ
 * findByOrganization (cần filter feature chính xác).
 *
 * domain/ KHÔNG import file này (Dependency Inversion).
 * Interface IAudioJobRepository nằm tại domain/repositories/audio-job-repository.interface.ts
 */

import { GenerationJobRepository } from "@/modules/jobs/infra/generation-job-repository"
import type { job_status } from "@/modules/jobs/infra/entities"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { TenantContext } from "@/core/tenancy"
import type {
  AudioJobEntity,
  AudioJobStage,
  AudioSceneInput,
  TtsProviderKey,
  AudioQualityTier,
  MusicMood,
  AudioTaskType,
} from "../domain/audio-types"
import type { IAudioJobRepository } from "../domain/repositories/audio-job-repository.interface"

// Re-export interface cho các module cần import từ một nơi
export type { IAudioJobRepository }

// ============================================================
// IMPLEMENTATION
// ============================================================

export class AudioJobRepository implements IAudioJobRepository {
  private readonly jobRepo: GenerationJobRepository

  constructor() {
    this.jobRepo = new GenerationJobRepository(prisma)
  }

  async findById(ctx: TenantContext, jobId: string): Promise<AudioJobEntity | null> {
    const row = await this.jobRepo.findById(ctx, jobId)
    if (!row || row.feature !== "audio.generate") return null
    return this.mapToEntity(row)
  }

  async findByOrganization(
    ctx: TenantContext,
    options?: { limit?: number; offset?: number; stage?: AudioJobStage }
  ): Promise<AudioJobEntity[]> {
    const where = {
      organization_id: ctx.organizationId,
      feature: "audio.generate" as const,
      ...(options?.stage ? { status: this.stageToStatus(options.stage) } : {}),
    }

    const rows = await prisma.generation_jobs.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    })

    return rows.map((r) => this.mapToEntity(r))
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(row: any): AudioJobEntity {
    const payload = (row.payload ?? {}) as Record<string, unknown>
    const output = (row.output ?? {}) as Record<string, unknown>

    return {
      id: row.id,
      organizationId: row.organization_id,
      taskType: (payload.taskType as AudioTaskType) ?? "AUDIO_MIX",
      stage: this.statusToStage(row.status, row.stage),
      voiceId: (payload.voiceId as string) ?? "flora-nu-truyen-cam",
      providerKey: (payload.providerKey as TtsProviderKey) ?? "openai",
      qualityTier: (payload.qualityTier as AudioQualityTier) ?? "standard",
      musicTrackId: (payload.musicTrackId as string) ?? null,
      musicMood: (payload.musicMood as MusicMood) ?? "warm",
      totalDurationSeconds:
        (output.total_duration_seconds as number) ?? (payload.totalDurationSeconds as number) ?? 0,
      mixedAudioUrl: null,
      mixedAudioStorageKey: (output.audio_storage_key as string) ?? null,
      voiceOnlyUrl: null,
      bgmOnlyUrl: null,
      costCredits: (payload.creditsCost as number) ?? 0,
      errorMessage: row.error ?? null,
      scenes: (payload.scenes as readonly AudioSceneInput[]) ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private stageToStatus(stage: AudioJobStage): job_status {
    switch (stage) {
      case "DRAFT": return "PENDING" as job_status
      case "GENERATING": return "PROCESSING" as job_status
      case "COMPLETED": return "COMPLETED" as job_status
      case "FAILED": return "FAILED" as job_status
    }
  }

  private statusToStage(status: string, stage?: string | null): AudioJobStage {
    if (stage && ["DRAFT", "GENERATING", "COMPLETED", "FAILED"].includes(stage)) {
      return stage as AudioJobStage
    }
    switch (status) {
      case "PENDING": return "DRAFT"
      case "PROCESSING": return "GENERATING"
      case "COMPLETED": return "COMPLETED"
      case "FAILED": return "FAILED"
      default: return "DRAFT"
    }
  }
}

// ============================================================
// SINGLETON FACTORY
// ============================================================

let _instance: AudioJobRepository | undefined

/** Trả về singleton AudioJobRepository (inject mặc định cho use-cases). */
export function getAudioJobRepository(): IAudioJobRepository {
  _instance ??= new AudioJobRepository()
  return _instance
}
