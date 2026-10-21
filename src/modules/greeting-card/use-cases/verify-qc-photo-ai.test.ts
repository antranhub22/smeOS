import { beforeEach, describe, expect, it, vi } from "vitest"

const callCapability = vi.fn()
vi.mock("@/core/ai/gateway", () => ({ callCapability: (...args: unknown[]) => callCapability(...args) }))
vi.mock("@/core/ai/wiring", () => ({ aiGatewayDeps: () => ({}) }))
vi.mock("@/core/ai/adapters/multi-llm-provider", () => ({ createContentLLM: () => ({}) }))

import { verifyQcPhotoWithAi } from "./verify-qc-photo-ai"

const input = {
  organizationId: "org-1",
  orderId: "order-1",
  productName: "Bó hoa hồng đỏ 50 bông",
  sampleImageUrl: "data:image/jpeg;base64,AAAA",
  qcPhotoBytes: new Uint8Array([1, 2, 3, 4]),
  qcPhotoMimeType: "image/jpeg",
}

describe("verifyQcPhotoWithAi (qua gateway)", () => {
  beforeEach(() => {
    callCapability.mockReset()
  })

  it("gọi năng lực qua gateway, mức SHOP, gửi ảnh mẫu rồi ảnh thành phẩm", async () => {
    callCapability.mockResolvedValue({ kind: "xong", output: { isMatch: true, confidenceScore: 95, verdict: "MATCH", reason: "Đúng mẫu." } })
    const result = await verifyQcPhotoWithAi(input)
    expect(result).toEqual({ isMatch: true, confidenceScore: 95, verdict: "MATCH", reason: "Đúng mẫu." })
    const [request] = callCapability.mock.calls[0]!
    expect(request).toMatchObject({ capability: "content_generation", privacy: "SHOP", entity: { type: "order_qc_photo", id: "order-1" } })
  })

  it("gateway hết đường chạy: UNCERTAIN, không tự cho qua", async () => {
    callCapability.mockResolvedValue({ kind: "khong_chay_duoc", reason: "no_model", attempts: [] })
    const result = await verifyQcPhotoWithAi(input)
    expect(result.isMatch).toBe(false)
    expect(result.verdict).toBe("UNCERTAIN")
  })

  it("gateway ném lỗi: UNCERTAIN", async () => {
    callCapability.mockImplementation(async () => { throw new Error("network down") })
    const result = await verifyQcPhotoWithAi(input)
    expect(result).toMatchObject({ isMatch: false, verdict: "UNCERTAIN" })
  })
})
