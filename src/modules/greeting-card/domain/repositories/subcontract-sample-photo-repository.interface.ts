export interface ISubcontractSamplePhotoRepository {
  findProductWithImages(
    organizationId: string,
    productId: string | null,
    productName: string | null
  ): Promise<{
    attributes: unknown
    images: Array<{ asset_id: string; role: string }>
  } | null>

  findAssetById(
    assetId: string,
    organizationId: string
  ): Promise<{ storage_key: string } | null>
}
