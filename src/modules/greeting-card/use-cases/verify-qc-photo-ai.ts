import { log } from "@/core/observability/log"

export interface VerifyQcPhotoInput {
  productName: string
  sampleImageUrl?: string | null | undefined
  qcPhotoBytes: Uint8Array
  qcPhotoMimeType: string
}

export interface VerifyQcPhotoResult {
  isMatch: boolean
  confidenceScore: number // 0 - 100
  verdict: "MATCH" | "MISMATCH" | "UNCERTAIN"
  reason: string
}

/**
 * verifyQcPhotoWithAi
 *
 * Sử dụng AI Vision để đối chiếu ảnh thành phẩm do cửa hàng chụp với mẫu sản phẩm gốc ban đầu.
 * Xác định chính xác: Có đúng sản phẩm không hay bị chụp nhầm ảnh rác / nhầm đơn hàng khác.
 */
export async function verifyQcPhotoWithAi(input: VerifyQcPhotoInput): Promise<VerifyQcPhotoResult> {
  const apiKey = process.env.OPENAI_API_KEY

  // Nếu không có API Key trong môi trường: KHÔNG được tự ý phê duyệt là MATCH!
  // Trả về UNCERTAIN để đưa về hàng đợi Điều Phối Viên duyệt thủ công, bảo vệ chất lượng đơn hàng.
  if (!apiKey) {
    log.warn("ai_qc_verify.no_api_key", { productName: input.productName })
    return {
      isMatch: false,
      confidenceScore: 50,
      verdict: "UNCERTAIN",
      reason: "Chưa cấu hình API Key kiểm định AI. Đơn cần Điều phối viên kiểm tra ảnh thủ công.",
    }
  }

  try {
    const qcBase64 = Buffer.from(input.qcPhotoBytes).toString("base64")
    const qcDataUri = `data:${input.qcPhotoMimeType};base64,${qcBase64}`

    // Đảm bảo nạp ảnh mẫu sản phẩm ban đầu thành data URI
    let sampleDataUri: string | null = null
    if (input.sampleImageUrl) {
      if (input.sampleImageUrl.startsWith("data:")) {
        sampleDataUri = input.sampleImageUrl
      } else if (input.sampleImageUrl.startsWith("http://") || input.sampleImageUrl.startsWith("https://")) {
        try {
          const sampleRes = await fetch(input.sampleImageUrl, { signal: AbortSignal.timeout(6000) })
          if (sampleRes.ok) {
            const buf = await sampleRes.arrayBuffer()
            const mime = sampleRes.headers.get("content-type") || "image/jpeg"
            sampleDataUri = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`
          }
        } catch {
          // fallback giữ URL gốc nếu fetch thất bại
          sampleDataUri = input.sampleImageUrl
        }
      }
    }

    const messagesContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } }
    > = [
      {
        type: "text",
        text: `Bạn là Chuyên gia Kiểm định Chất lượng (Quality Control Inspector) của nền tảng quản lý đơn hàng chuỗi smeOS.
Nhiệm vụ của bạn là kiểm tra ảnh chụp thành phẩm do cửa hàng vừa tải lên xem có ĐÚNG là sản phẩm của đơn hàng hay không.

Thông tin đơn hàng cần làm:
- Tên sản phẩm khách đặt: "${input.productName}"
${sampleDataUri ? "- Đơn hàng có đính kèm Ảnh [1] là Mẫu Sản Phẩm Gốc để đối chiếu." : "- Không có ảnh mẫu gốc, hãy đối chiếu ảnh thành phẩm với Tên sản phẩm trên."}

YÊU CẦU KIỂM DUYỆT RẤT NGHIÊM NGẶT & CHI TIẾT:
1. Đối chiếu chủng loại & loài hoa/sản phẩm chính:
   - Nếu đơn hàng đặt loài hoa cụ thể (ví dụ: hoa Tulip, hoa Hồng, hoa Hướng Dương, hoa Cúc...) thì ảnh thành phẩm BẮT BUỘC phải là loài hoa đó.
   - TUYỆT ĐỐI KHÔNG CHẤP NHẬN: Bó hoa hồng/cúc nhưng đơn đặt là Bó hoa tulip (hoặc ngược lại). Nếu loài hoa chính không khớp -> BẮT BUỘC trả về isMatch = false và verdict = "MISMATCH".
2. Nếu có ảnh mẫu gốc [Ảnh 1]:
   - So sánh tông màu chủ đạo (ví dụ: mẫu màu trắng nhưng làm màu hồng/đỏ -> MISMATCH).
   - So sánh kiểu dáng bó/lẵng/hộp hoa và phong cách cắm.
   - Nếu khác biệt rõ rệt về loài hoa hoặc màu sắc -> BẮT BUỘC verdict = "MISMATCH".
3. TUYỆT ĐỐI TỪ CHỐI các ảnh rác, ảnh tài liệu, chụp màn hình, ảnh tự sướng, hoặc sản phẩm của ngành hàng khác.

Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON duy nhất (không dùng markdown hay backticks):
{
  "isMatch": boolean,
  "confidenceScore": number, // 0 - 100
  "verdict": "MATCH" | "MISMATCH",
  "reason": "Giải thích ngắn gọn 1-2 câu tiếng Việt lý do đánh giá (nêu rõ nếu loài hoa hoặc màu sắc không khớp)"
}`,
      },
    ]

    // Thêm ảnh mẫu sản phẩm ban đầu nếu có
    if (sampleDataUri) {
      messagesContent.push({
        type: "text",
        text: "Ảnh [1] — Ảnh Mẫu Sản Phẩm Khách Đặt Ban Đầu:",
      })
      messagesContent.push({
        type: "image_url",
        image_url: { url: sampleDataUri, detail: "low" },
      })
    }

    messagesContent.push({
      type: "text",
      text: "Ảnh [2] — Ảnh Thành Phẩm Thực Tế Do Cửa Hàng Vừa Tải Lên Cần Kiểm Định:",
    })
    messagesContent.push({
      type: "image_url",
      image_url: { url: qcDataUri, detail: "low" },
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: messagesContent }],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      log.warn("ai_qc_verify.api_error", { status: res.status, error: errText })
      return {
        isMatch: false,
        confidenceScore: 50,
        verdict: "UNCERTAIN",
        reason: `Dịch vụ kiểm định AI tạm thời gián đoạn (${res.status}). Đơn cần Điều phối viên kiểm tra ảnh thủ công.`,
      }
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const rawContent = json.choices?.[0]?.message?.content?.trim() || "{}"
    const parsed = JSON.parse(rawContent) as {
      isMatch?: boolean
      confidenceScore?: number
      verdict?: "MATCH" | "MISMATCH"
      reason?: string
    }

    const isMatch = Boolean(parsed.isMatch)
    const confidenceScore = typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 85
    const verdict = parsed.verdict === "MISMATCH" ? "MISMATCH" : isMatch ? "MATCH" : "MISMATCH"
    const reason =
      parsed.reason ||
      (isMatch ? "Ảnh thành phẩm phù hợp với mẫu sản phẩm." : "Ảnh thành phẩm không khớp với mẫu đơn hàng.")

    log.info("ai_qc_verify.completed", {
      productName: input.productName,
      isMatch,
      confidenceScore,
      verdict,
      reason,
    })

    return {
      isMatch,
      confidenceScore,
      verdict,
      reason,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    log.warn("ai_qc_verify.exception", { error: errorMsg })
    return {
      isMatch: false,
      confidenceScore: 50,
      verdict: "UNCERTAIN",
      reason: "Hệ thống kiểm định AI gặp sự cố kết nối. Đơn cần Điều phối viên kiểm tra ảnh thủ công.",
    }
  }
}
