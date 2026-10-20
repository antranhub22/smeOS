import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { verifyPodPhotoWithAi } from "./verify-pod-photo-ai"

describe("verifyPodPhotoWithAi", () => {
  const originalEnv = process.env.OPENAI_API_KEY
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
    global.fetch = originalFetch
  })

  it("trả về fallback an toàn khi không có OPENAI_API_KEY", async () => {
    delete process.env.OPENAI_API_KEY

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyPodPhotoWithAi({
      productName: "Bình hoa cúc mẫu đơn",
      podPhotoBytes: dummyBytes,
      podPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.confidenceScore).toBe(85)
  })

  it("trả về MATCH khi OpenAI xác nhận ảnh giao hàng POD hợp lệ", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              isMatch: true,
              confidenceScore: 92,
              verdict: "MATCH",
              reason: "Ảnh thể hiện khách hàng nhận hoa tại cửa nhà, sản phẩm trùng khớp với ảnh QC.",
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.includes("api.openai.com")) {
        return new Response(JSON.stringify(mockAiResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(new Uint8Array([10, 20]), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      })
    })

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyPodPhotoWithAi({
      productName: "Bình hoa cúc mẫu đơn",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcImageUrl: "https://example.com/qc.jpg",
      podPhotoBytes: dummyBytes,
      podPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.confidenceScore).toBe(92)
    expect(result.reason).toContain("khách hàng nhận hoa")
  })

  it("trả về MISMATCH khi ảnh giao hàng là ảnh rác/không có sản phẩm", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              isMatch: false,
              confidenceScore: 99,
              verdict: "MISMATCH",
              reason: "Ảnh chụp sàn nhà trống, không có bằng chứng giao sản phẩm hoa tươi.",
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.includes("api.openai.com")) {
        return new Response(JSON.stringify(mockAiResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(new Uint8Array([10, 20]), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      })
    })

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyPodPhotoWithAi({
      productName: "Bình hoa cúc mẫu đơn",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcImageUrl: "https://example.com/qc.jpg",
      podPhotoBytes: dummyBytes,
      podPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(false)
    expect(result.verdict).toBe("MISMATCH")
    expect(result.confidenceScore).toBe(99)
    expect(result.reason).toContain("không có bằng chứng giao")
  })
})
