import type { ChainPartnershipEntity, ProvisionPartnerInput, PartnershipStatus } from "../domain/partnership-entities"

export interface ListPartnershipsFilter {
  chainOrgId: string
  status?: PartnershipStatus | undefined
  province?: string | undefined
  query?: string | undefined
  limit?: number | undefined
  offset?: number | undefined
}

export interface IChainPartnershipRepository {
  provisionPartner(input: ProvisionPartnerInput): Promise<{
    partnership: ChainPartnershipEntity
    partnerOrgId: string
    founderUserId: string
  }>
  listPartnerships(filter: ListPartnershipsFilter): Promise<{
    items: ChainPartnershipEntity[]
    total: number
  }>
  findPartnershipById(id: string): Promise<ChainPartnershipEntity | null>
  updateStatus(id: string, status: PartnershipStatus): Promise<ChainPartnershipEntity>
}
