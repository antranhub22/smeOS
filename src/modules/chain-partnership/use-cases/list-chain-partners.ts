import type { IChainPartnershipRepository, ListPartnershipsFilter } from "../domain/partnership-repository.interface"
import type { ChainPartnershipEntity } from "../domain/partnership-entities"

export class ListChainPartnersUseCase {
  constructor(private readonly partnershipRepo: IChainPartnershipRepository) {}

  async execute(filter: ListPartnershipsFilter): Promise<{
    items: ChainPartnershipEntity[]
    total: number
  }> {
    return this.partnershipRepo.listPartnerships(filter)
  }
}
