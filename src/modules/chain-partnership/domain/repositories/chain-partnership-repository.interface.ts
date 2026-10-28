/**
 * IChainPartnershipRepository — Port Interface cho quản lý Đối tác Chuỗi.
 *
 * Đặt tại domain/repositories/ theo chuẩn Clean Architecture (Zero ORM).
 */

import type {
  ChainPartnershipEntity,
  ProvisionPartnerInput,
  PartnershipStatus,
} from "../partnership-entities"

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
    /** Mật khẩu sinh ngẫu nhiên khi chuỗi không đặt — chỉ trả về đúng một lần (AUD-009). */
    temporaryPassword?: string | undefined
  }>
  listPartnerships(filter: ListPartnershipsFilter): Promise<{
    items: ChainPartnershipEntity[]
    total: number
  }>
  findPartnershipById(id: string): Promise<ChainPartnershipEntity | null>
  updateStatus(id: string, status: PartnershipStatus): Promise<ChainPartnershipEntity>
  findStoreByIdentifier(identifier: string): Promise<{
    orgId: string
    orgName: string
    founderUserId: string
    contactEmail: string
    contactPhone?: string | undefined
    address?: string | undefined
  } | null>
  linkExistingStore(params: {
    chainOrgId: string
    partnerOrgId: string
    partnerCode: string
    partnershipType?: string | undefined
    commissionRate?: number | undefined
    capacityDaily?: number | undefined
    contactName?: string | undefined
    contactPhone?: string | undefined
    contactEmail?: string | undefined
  }): Promise<ChainPartnershipEntity>
}
