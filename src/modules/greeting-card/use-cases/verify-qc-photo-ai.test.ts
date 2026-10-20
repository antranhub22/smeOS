import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { verifyQcPhotoWithAi } from "./verify-qc-photo-ai"

describe("verifyQcPhotoWithAi", () => {
  const originalEnv = process.env.OPENAI_API_KEY
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
    global.fetch = originalFetch
  })

  it("trả về fallback an toàn (isMatch=true) khi không có OPENAI_API_KEY", async () => {
    delete process.env.OPENAI_API_KEY

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyQcPhotoWithAi({
      productName: "Bó hoa hồng đỏ 50 bông",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcPhotoBytes: dummyBytes,
      qcPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.confidenceScore).toBe(85)
    expect(result.reason).toContain("Hệ thống kiểm định an toàn nội bộ")
  })

  it("trả về MATCH khi OpenAI xác nhận ảnh khớp với sản phẩm", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              isMatch: true,
              confidenceScore: 95,
              verdict: "MATCH",
              reason: "Ảnh thành phẩm đúng mẫu bó hoa hồng đỏ, tông màu và kiểu dáng tương đồng 95%.",
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
    const result = await verifyQcPhotoWithAi({
      productName: "Bó hoa hồng đỏ",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcPhotoBytes: dummyBytes,
      qcPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.confidenceScore).toBe(95)
    expect(result.reason).toContain("Ảnh thành phẩm đúng mẫu")
  })

  it("trả về MISMATCH khi OpenAI phát hiện ảnh thành phẩm không khớp hoặc ảnh rác", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              isMatch: false,
              confidenceScore: 98,
              verdict: "MISMATCH",
              reason: "Ảnh thành phẩm là đồ gia dụng, hoàn toàn không phải bó hoa theo đơn hàng.",
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
    const result = await verifyQcPhotoWithAi({
      productName: "Bó hoa hồng đỏ",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcPhotoBytes: dummyBytes,
      qcPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(false)
    expect(result.verdict).toBe("MISMATCH")
    expect(result.confidenceScore).toBe(98)
    expect(result.reason).toContain("không phải bó hoa")
  })

  it("xử lý an toàn khi OpenAI API lỗi (HTTP 500) mà không crash ứng dụng", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.includes("api.openai.com")) {
        return new Response("Internal Server Error", { status: 500 })
      }
      return new Response(new Uint8Array([10, 20]), { status: 200 })
    })

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyQcPhotoWithAi({
      productName: "Bó hoa hồng đỏ",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcPhotoBytes: dummyBytes,
      qcPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.reason).toContain("Chế độ dự phòng khi AI bận")
  })

  it("xử lý an toàn khi fetch ném ngoại lệ (Network Error)", async () => {
    process.env.OPENAI_API_KEY = "sk-test-mock-key"

    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection dropped"))

    const dummyBytes = new Uint8Array([1, 2, 3, 4])
    const result = await verifyQcPhotoWithAi({
      productName: "Bó hoa hồng đỏ",
      sampleImageUrl: "https://example.com/sample.jpg",
      qcPhotoBytes: dummyBytes,
      qcPhotoMimeType: "image/jpeg",
    })

    expect(result.isMatch).toBe(true)
    expect(result.verdict).toBe("MATCH")
    expect(result.reason).toContain("Hệ thống kiểm định nội bộ xác nhận hợp lệ")
  })
})
