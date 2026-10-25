import type { IChainPartnershipRepository } from "../domain/repositories/chain-partnership-repository.interface"
import { getChainPartnershipRepository } from "../infra/prisma-partnership-repository"
import type { IInternalChatRepository } from "@/modules/internal-chat/domain/repositories/chat-repository.interface"
import { getInternalChatRepository } from "@/modules/internal-chat/infra/prisma-chat-repository"
import type { ChainPartnershipEntity, ProvisionPartnerInput } from "../domain/partnership-entities"

export class ProvisionPartnerAccountUseCase {
  constructor(
    private readonly partnershipRepo: IChainPartnershipRepository = getChainPartnershipRepository(),
    private readonly chatRepo: IInternalChatRepository = getInternalChatRepository()
  ) {}

  async execute(input: ProvisionPartnerInput, coordinatorUserId: string): Promise<ChainPartnershipEntity> {
    // 1. Cấp tài khoản Cửa hàng đối tác & Tạo quan hệ chuỗi
    const result = await this.partnershipRepo.provisionPartner(input)

    // 2. Tự động thiết lập phòng Chat nội bộ 1-1 giữa Chuỗi và Cửa hàng đối tác
    try {
      await this.chatRepo.createConversation({
        organizationId: input.chainOrgId,
        conversationType: "CHAIN_PARTNER",
        title: `Trao đổi: ${input.partnerStoreName} (${input.partnerCode})`,
        createdBy: coordinatorUserId,
        participantUserIds: [
          {
            userId: coordinatorUserId,
            organizationId: input.chainOrgId,
            roleInChat: "OWNER",
          },
          {
            userId: result.founderUserId,
            organizationId: result.partnerOrgId,
            roleInChat: "MEMBER",
          },
        ],
        metadata: {
          partnerOrgId: result.partnerOrgId,
          partnerCode: input.partnerCode,
        },
      })
    } catch {
      // Ignored if chat creation fails; partnership remains valid
    }

    return result.partnership
  }
}
