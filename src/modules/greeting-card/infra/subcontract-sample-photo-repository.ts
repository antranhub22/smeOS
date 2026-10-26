import { prisma } from "@/core/tenancy/infra/prisma"
import type { ISubcontractSamplePhotoRepository } from "../domain/repositories/subcontract-sample-photo-repository.interface"

export class SubcontractSamplePhotoRepository implements ISubcontractSamplePhotoRepository {
  private db = prisma

  async findProductWithImages(
    organizationId: string,
    productId: string | null,
    productName: string | null
  ): Promise<{
    attributes: unknown
    images: Array<{ asset_id: string; role: string }>
  } | null> {
    return this.db.products.findFirst({
      where: productId
        ? { id: productId, organization_id: organizationId }
        : {
            organization_id: organizationId,
            name: { equals: productName!, mode: "insensitive" },
          },
      select: {
        attributes: true,
        images: {
          orderBy: { position: "asc" },
          take: 10,
          select: { asset_id: true, role: true },
        },
      },
    })
  }

  async findAssetById(
    assetId: string,
    organizationId: string
  ): Promise<{ storage_key: string } | null> {
    return this.db.assets.findFirst({
      where: { id: assetId, organization_id: organizationId },
      select: { storage_key: true },
    })
  }
}

let _subcontractSamplePhotoRepo: ISubcontractSamplePhotoRepository | null = null
export function getSubcontractSamplePhotoRepository(): ISubcontractSamplePhotoRepository {
  if (!_subcontractSamplePhotoRepo) _subcontractSamplePhotoRepo = new SubcontractSamplePhotoRepository()
  return _subcontractSamplePhotoRepo
}
