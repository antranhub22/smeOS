/**
 * IAudioJobRepository — Port Interface cho Audio Studio.
 *
 * Đặt tại domain/ để use-cases phụ thuộc vào interface này
 * thay vì implementation cụ thể (Dependency Inversion Principle).
 *
 * domain/ KHÔNG import Prisma hay bất kỳ infra nào.
 */

import type { TenantContext } from "@/core/tenancy"
import type { AudioJobEntity, AudioJobStage } from "../audio-types"

export interface IAudioJobRepository {
  findById(ctx: TenantContext, jobId: string): Promise<AudioJobEntity | null>
  findByOrganization(
    ctx: TenantContext,
    options?: { limit?: number; offset?: number; stage?: AudioJobStage }
  ): Promise<AudioJobEntity[]>
}
