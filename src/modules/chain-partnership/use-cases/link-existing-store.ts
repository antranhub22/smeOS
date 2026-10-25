import type { IChainPartnershipRepository } from "../domain/repositories/chain-partnership-repository.interface"
import { getChainPartnershipRepository } from "../infra/prisma-partnership-repository"
import type { IInternalChatRepository } from "@/modules/internal-chat/domain/repositories/chat-repository.interface"
import { getInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import type { ChainPartnershipEntity, InviteExistingStoreInput } from "../domain/partnership-entities"

export class LinkExistingStoreUseCase {
  constructor(
    private readonly partnershipRepo: IChainPartnershipRepository = getChainPartnershipRepository(),
    private readonly chatRepo: IInternalChatRepository = getInternalChatRepository()
  ) {}

  async execute(input: InviteExistingStoreInput, coordinatorUserId: string): Promise<ChainPartnershipEntity> {
    // 1. Tìm cửa hàng dựa theo email đại diện hoặc slug/tên tổ chức
    const store = await this.partnershipRepo.findStoreByIdentifier(input.identifier)
    if (!store) {
      throw new Error(`Không tìm thấy cửa hàng hoặc tài khoản nào khớp với: "${input.identifier}"`)
    }

    if (store.orgId === input.chainOrgId) {
      throw new Error("Không thể tự liên kết chính tổ chức của Chuỗi làm đối tác")
    }

    // 2. Tạo liên kết chain_partnerships
    const partnership = await this.partnershipRepo.linkExistingStore({
      chainOrgId: input.chainOrgId,
      partnerOrgId: store.orgId,
      partnerCode: input.partnerCode,
      partnershipType: input.partnershipType,
      commissionRate: input.commissionRate,
      capacityDaily: input.capacityDaily,
      contactName: store.orgName,
      contactPhone: store.contactPhone,
      contactEmail: store.contactEmail,
    })

    // 3. Tự động thiết lập phòng Chat nội bộ 1-1 giữa Chuỗi và Cửa hàng
    try {
      await this.chatRepo.createConversation({
        organizationId: input.chainOrgId,
        conversationType: "CHAIN_PARTNER",
        title: `Trao đổi: ${store.orgName} (${input.partnerCode})`,
        createdBy: coordinatorUserId,
        participantUserIds: [
          {
            userId: coordinatorUserId,
            organizationId: input.chainOrgId,
            roleInChat: "OWNER",
          },
          ...(store.founderUserId
            ? [
                {
                  userId: store.founderUserId,
                  organizationId: store.orgId,
                  roleInChat: "MEMBER",
                },
              ]
            : []),
        ],
        metadata: {
          partnerOrgId: store.orgId,
          partnerCode: input.partnerCode,
        },
      })
    } catch {
      // Ignored if chat creation fails
    }

    return partnership
  }
}
