import { describe, it, expect, beforeEach } from "vitest"
import type { IChainPartnershipRepository, ListPartnershipsFilter } from "../domain/partnership-repository.interface"
import type { IInternalChatRepository, CreateConversationParams } from "@/modules/internal-chat/domain/chat-repository.interface"
import type { ChainPartnershipEntity, ProvisionPartnerInput } from "../domain/partnership-entities"
import { ProvisionPartnerAccountUseCase } from "./provision-partner-account"
import { ListChainPartnersUseCase } from "./list-chain-partners"

class InMemoryPartnershipRepository implements IChainPartnershipRepository {
  public partnerships: ChainPartnershipEntity[] = []

  async provisionPartner(input: ProvisionPartnerInput): Promise<{
    partnership: ChainPartnershipEntity
    partnerOrgId: string
    founderUserId: string
  }> {
    const entity: ChainPartnershipEntity = {
      id: "part-rel-1",
      chainOrgId: input.chainOrgId,
      partnerOrgId: "partner-org-1",
      partnerCode: input.partnerCode,
      partnershipType: input.partnershipType ?? "SUBCONTRACTOR",
      status: "ACTIVE",
      capacityDaily: input.capacityDaily ?? 10,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      partnerOrgName: input.partnerStoreName,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.partnerships.push(entity)
    return {
      partnership: entity,
      partnerOrgId: "partner-org-1",
      founderUserId: "founder-user-1",
    }
  }

  async listPartnerships(filter: ListPartnershipsFilter): Promise<{
    items: ChainPartnershipEntity[]
    total: number
  }> {
    return { items: this.partnerships, total: this.partnerships.length }
  }

  async findPartnershipById(id: string): Promise<ChainPartnershipEntity | null> {
    return this.partnerships.find((p) => p.id === id) ?? null
  }

  async updateStatus(id: string, status: any): Promise<ChainPartnershipEntity> {
    const p = this.partnerships.find((x) => x.id === id)
    if (!p) throw new Error("Not found")
    p.status = status
    return p
  }
}

class InMemoryChatRepoMock implements Partial<IInternalChatRepository> {
  public createdConversations: CreateConversationParams[] = []

  async createConversation(params: CreateConversationParams): Promise<any> {
    this.createdConversations.push(params)
    return { id: "conv-mock-1" }
  }
}

describe("Chain Partnership Use Cases", () => {
  let partnershipRepo: InMemoryPartnershipRepository
  let chatRepo: InMemoryChatRepoMock

  beforeEach(() => {
    partnershipRepo = new InMemoryPartnershipRepository()
    chatRepo = new InMemoryChatRepoMock()
  })

  it("cấp tài khoản đối tác thành công và tự động tạo phòng chat nội bộ", async () => {
    const useCase = new ProvisionPartnerAccountUseCase(
      partnershipRepo,
      chatRepo as unknown as IInternalChatRepository
    )

    const partnership = await useCase.execute(
      {
        chainOrgId: "chain-hq-1",
        partnerStoreName: "Tiệm Hoa Cầu Giấy",
        partnerCode: "DT-HN-01",
        contactName: "Nguyễn Văn Chủ Tiệm",
        contactPhone: "0987654321",
        contactEmail: "chutiem@hoacaugiay.vn",
      },
      "coordinator-user-1"
    )

    expect(partnership.partnerCode).toBe("DT-HN-01")
    expect(partnership.partnerOrgName).toBe("Tiệm Hoa Cầu Giấy")
    expect(partnershipRepo.partnerships).toHaveLength(1)

    // Kiểm tra kênh chat nội bộ 1-1 đã được tự động mở
    expect(chatRepo.createdConversations).toHaveLength(1)
    const conv = chatRepo.createdConversations[0]!
    expect(conv.conversationType).toBe("CHAIN_PARTNER")
    expect(conv.participantUserIds).toHaveLength(2)
  })

  it("liệt kê danh sách đối tác của chuỗi", async () => {
    const useCase = new ListChainPartnersUseCase(partnershipRepo)
    partnershipRepo.partnerships.push({
      id: "part-1",
      chainOrgId: "chain-hq-1",
      partnerOrgId: "p-org-1",
      partnerCode: "DT-01",
      partnershipType: "SUBCONTRACTOR",
      status: "ACTIVE",
      capacityDaily: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await useCase.execute({ chainOrgId: "chain-hq-1" })
    expect(result.total).toBe(1)
    expect(result.items[0]!.partnerCode).toBe("DT-01")
  })
})

