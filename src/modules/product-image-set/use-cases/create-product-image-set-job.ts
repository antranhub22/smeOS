import { notFound, validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { AssetRepository } from "@/modules/assets/infra/asset-repository"
import { enqueueJob } from "@/modules/jobs/use-cases/enqueue-job"
import { IMAGE_SET_BUNDLES } from "../domain/bundle-catalog"
import { buildSetVariantPrompt } from "../domain/prompt-builder"

export const PRODUCT_IMAGE_SET_FEATURE = "media.variant.cloud"

export interface CreateProductImageSetJobInput {
  assetId: string
  bundleId?: string | undefined
  customNote?: string | undefined
  idempotencyKey: string
}

export async function createProductImageSetJob(
  ctx: TenantContext,
  input: CreateProductImageSetJobInput
) {
  if (!input.assetId) {
    throw validationFailed({ assetId: "Bắt buộc phải chọn ảnh gốc của sản phẩm" })
  }

  const assetRepo = new AssetRepository()
  const asset = await assetRepo.findById(ctx, input.assetId)
  if (!asset) {
    throw notFound()
  }

  const bundle =
    IMAGE_SET_BUNDLES.find((b) => b.id === input.bundleId) ?? IMAGE_SET_BUNDLES[0]!

  const variantPrompts = bundle.variants.map((v) => ({
    id: v.id,
    name: v.name,
    aspectRatio: v.aspectRatio,
    angle: v.angle,
    angleLabel: v.angleLabel,
    channelTarget: v.channelTarget,
    prompt: buildSetVariantPrompt({
      bundleId: bundle.id,
      variant: v,
      customNote: input.customNote,
    }),
  }))

  const config = {
    bundle_id: bundle.id,
    bundle_name: bundle.name,
    provider_order: ["imagen", "openai", "fal"],
    variants: variantPrompts,
    custom_note: input.customNote,
  }

  return enqueueJob(ctx, {
    feature: PRODUCT_IMAGE_SET_FEATURE,
    productId: asset.product_id,
    payload: {
      asset_id: input.assetId,
      config,
    },
    idempotencyKey: input.idempotencyKey,
  })
}
