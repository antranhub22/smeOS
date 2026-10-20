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
        text: `Bạn là Chuyên gia Kiểm định Chất lượng (Quality Control Inspector) cao cấp của nền tảng quản lý chuỗi smeOS.
Nhiệm vụ của bạn là kiểm tra đối chiếu trực quan cực kỳ khắt khe giữa Ảnh mẫu gốc và Ảnh thành phẩm do cửa hàng chụp gửi lên.

Thông tin đơn hàng:
- Tên sản phẩm khách đặt: "${input.productName}"
${sampleDataUri ? "- Đơn hàng có đính kèm Ảnh [1] là Mẫu Sản Phẩm Gốc do khách đặt để so sánh." : "- Đơn hàng không có ảnh mẫu gốc, hãy đối chiếu ảnh thành phẩm với Tên sản phẩm và yêu cầu chủng loại."}

QUY TẮC PHÊ DUYỆT BẮT BUỘC (ZERO TOLERANCE CHO SẢN PHẨM SAI):
1. SO SÁNH TRỰC QUAN NẾU CÓ ẢNH [1] (ẢNH MẪU GỐC):
   - So sánh trực tiếp Ảnh [1] (Mẫu) và Ảnh [2] (Thành phẩm):
   - Chủng loại thành phần chính: Nếu Ảnh [1] là hoa cúc mẫu đơn, tulip, baby... mà Ảnh [2] là hoa hồng (hoặc ngược lại) -> BẮT BUỘC isMatch = false, verdict = "MISMATCH".
   - Tông màu chủ đạo: Nếu Ảnh [1] tone màu vàng/trắng/cam nhưng Ảnh [2] tone màu hồng/đỏ -> BẮT BUỘC isMatch = false, verdict = "MISMATCH".
   - Kiểu dáng thiết kế: Nếu Ảnh [1] là dạng cắm tròn/dài nhưng Ảnh [2] là lẵng/giỏ/hộp (hoặc ngược lại) -> BẮT BUỘC isMatch = false, verdict = "MISMATCH".
   - KHÔNG ĐƯỢC CHẤP NHẬN: "Cùng ngành hàng nhưng khác chủng loại", "Cùng dáng nhưng khác màu hoàn toàn". Bất kỳ khác biệt lớn nào về chất liệu, chủng loại hoặc màu sắc -> BẮT BUỘC verdict = "MISMATCH".

2. ĐỐI CHIẾU VỚI TÊN SẢN PHẨM:
   - Nếu trong tên sản phẩm có loài hoa cụ thể (ví dụ: "Tulip", "Hồng đỏ", "Baby", "Lan hồ điệp"...), Ảnh [2] bắt buộc phải đúng loài hoa đó.

3. ĐỘ TIN CẬY (confidenceScore):
   - Chỉ trả isMatch = true khi thực sự tương đồng ít nhất 85% về loài hoa chính, màu sắc và kiểu dáng.
   - Nếu nghi ngờ hoặc khác biệt rõ rệt -> isMatch = false, verdict = "MISMATCH", confidenceScore < 50.

Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON duy nhất (không dùng markdown hay backticks):
{
  "isMatch": boolean,
  "confidenceScore": number, // 0 - 100
  "verdict": "MATCH" | "MISMATCH",
  "reason": "Giải thích chi tiết 1-2 câu tiếng Việt (chỉ rõ sự khác biệt cụ thể về loài hoa, màu sắc hoặc kiểu dáng nếu không khớp)"
}`,
      },
    ]

    // Thêm ảnh mẫu sản phẩm ban đầu nếu có (độ nét cao detail: high)
    if (sampleDataUri) {
      messagesContent.push({
        type: "text",
        text: "Ảnh [1] — Ảnh Mẫu Sản Phẩm Khách Đặt Ban Đầu:",
      })
      messagesContent.push({
        type: "image_url",
        image_url: { url: sampleDataUri, detail: "high" },
      })
    }

    messagesContent.push({
      type: "text",
      text: "Ảnh [2] — Ảnh Thành Phẩm Thực Tế Do Cửa Hàng Vừa Tải Lên Cần Kiểm Định:",
    })
    messagesContent.push({
      type: "image_url",
      image_url: { url: qcDataUri, detail: "high" },
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
