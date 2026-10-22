import type { PhotoMatchVerdict } from "../adapters/photo-match-vision-adapter"
import { loadImageForAi, runPhotoMatch } from "./run-photo-match"

export interface VerifyQcPhotoInput {
  organizationId: string
  orderId: string
  productName: string
  sampleImageUrl?: string | null | undefined
  qcPhotoBytes: Uint8Array
  qcPhotoMimeType: string
}

export type VerifyQcPhotoResult = PhotoMatchVerdict

/**
 * verifyQcPhotoWithAi
 *
 * Dùng AI Vision (qua gateway) đối chiếu ảnh thành phẩm do cửa hàng chụp với mẫu sản phẩm gốc —
 * có đúng sản phẩm không hay chụp nhầm ảnh rác / nhầm đơn khác. Lỗi AI → UNCERTAIN, Điều phối duyệt tay.
 */
export async function verifyQcPhotoWithAi(input: VerifyQcPhotoInput): Promise<VerifyQcPhotoResult> {
  const sample = await loadImageForAi(input.sampleImageUrl)
  const photo = { mimeType: input.qcPhotoMimeType, base64: Buffer.from(input.qcPhotoBytes).toString("base64") }
  const prompt = `Bạn là Chuyên gia Kiểm định Chất lượng (Quality Control Inspector) cao cấp của nền tảng quản lý chuỗi smeOS.
Nhiệm vụ của bạn là kiểm tra đối chiếu trực quan cực kỳ khắt khe giữa Ảnh mẫu gốc và Ảnh thành phẩm do cửa hàng chụp gửi lên.

Thông tin đơn hàng:
- Tên sản phẩm khách đặt: "${input.productName}"
${sample ? "- Ảnh thứ nhất đính kèm là Ảnh [1] — Mẫu Sản Phẩm Gốc khách đặt; ảnh cuối cùng là Ảnh [2] — Ảnh Thành Phẩm cửa hàng vừa tải lên cần kiểm định." : "- Đơn hàng không có ảnh mẫu gốc; ảnh đính kèm duy nhất là Ảnh [2] — Ảnh Thành Phẩm cần kiểm định. Hãy đối chiếu với Tên sản phẩm và yêu cầu chủng loại."}

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
}`
  return runPhotoMatch({
    organizationId: input.organizationId,
    entity: { type: "order_qc_photo", id: input.orderId },
    logKey: "ai_qc_verify",
    uncertainReason: "Hệ thống kiểm định AI chưa sẵn sàng hoặc gặp sự cố. Đơn cần Điều phối viên kiểm tra ảnh thủ công.",
    request: {
      system: "Bạn là Chuyên gia Kiểm định Chất lượng thành phẩm. Luôn trả về đúng một đối tượng JSON.",
      prompt,
      images: sample ? [sample, photo] : [photo],
      defaultReason: { match: "Ảnh thành phẩm phù hợp với mẫu sản phẩm.", mismatch: "Ảnh thành phẩm không khớp với mẫu đơn hàng." },
    },
  })
}
