/**
 * Ảnh minh họa & tiêu đề gọn cho các thẻ cơ hội/chủ đề trong Market Intelligence.
 *
 * Bối cảnh (19/09/2026): Tony phản ánh các thẻ hiển thị quá nhiều chữ và câu tiêu đề
 * lặp công thức "Cơ hội nội dung theo xu hướng X phù hợp phong cách Y" trên mọi thẻ.
 * PO 06/11/2026: bỏ ảnh kho minh hoạ theo chủ đề — thẻ chỉ dùng ảnh dẫn chứng video.
 */

export interface IllustrationEntry {
  url: string;
  alt: string;
}

export {
  type EvidenceItemLike,
  type OpportunityLike,
  type VideoEvidencePreview,
  type DualVideoEvidencePreview,
  getTopicDualRealVideoEvidence,
  getDualOpportunityEvidencePreview,
  getOpportunityEvidencePreview,
} from "./video-evidence-catalog";
import { getOpportunityEvidencePreview, type OpportunityLike } from "./video-evidence-catalog";

export function getOpportunityIllustration(item: OpportunityLike): IllustrationEntry {
  const preview = getOpportunityEvidencePreview(item);
  return {
    url: preview.thumbnailUrl,
    alt: preview.alt,
  };
}

interface HeadlineLike {
  opportunitySummary: string;
  recommendedHooks?: unknown;
}

/**
 * Tiêu đề gọn cho thẻ: ưu tiên câu Hook giật tít cụ thể (đã có sẵn trong dữ liệu,
 * khác nhau theo từng cơ hội) thay vì câu mô tả công thức lặp lại
 * "Cơ hội nội dung theo xu hướng X phù hợp phong cách Y" trên mọi thẻ.
 */
export function getOpportunityHeadline(item: HeadlineLike): string {
  const hooks = Array.isArray(item.recommendedHooks) ? item.recommendedHooks : [];
  const firstHook = hooks.find((h): h is string => typeof h === "string" && h.trim().length > 0);
  const text = firstHook?.trim() || item.opportunitySummary || "";

  // Xử lý mẫu câu lặp cũ "Bật mí bí quyết chọn ... không phải ai cũng biết"
  if (text.startsWith("Bật mí bí quyết chọn ") && text.endsWith(" không phải ai cũng biết")) {
    const rawTopic = text
      .replace("Bật mí bí quyết chọn ", "")
      .replace(" không phải ai cũng biết", "")
      .trim();
    // Lấy tên chủ đề chính, lọc bỏ danh sách từ khóa phân tách bằng dấu phẩy
    const cleanTopic = rawTopic.includes(",") ? rawTopic.split(",")[0]?.trim() || rawTopic : rawTopic;
    const lower = cleanTopic.toLowerCase();

    if (lower.includes("mẹ") || lower.includes("bố") || lower.includes("20/10") || lower.includes("8/3")) {
      return `Bí quyết chọn ${cleanTopic} ý nghĩa & đong đầy tình cảm`;
    }
    if (lower.includes("khai trương") || lower.includes("đối tác") || lower.includes("doanh nghiệp")) {
      return `Gợi ý ${cleanTopic} sang trọng chiêu tài lộc mừng hồng phát`;
    }
    if (lower.includes("cưới") || lower.includes("kỷ niệm")) {
      return `BST ${cleanTopic} thanh lịch dẫn đầu xu hướng năm nay`;
    }
    if (lower.includes("sinh nhật")) {
      return `Gợi ý ${cleanTopic} tinh tế ghi điểm tuyệt đối`;
    }
    if (lower.includes("tốt nghiệp")) {
      return `Top thiết kế ${cleanTopic} rực rỡ chúc mừng ngày cử nhân`;
    }
    return `Xu hướng thiết kế ${cleanTopic} chuẩn gu & tươi lâu`;
  }

  // Nếu tiêu đề là chuỗi nối nhiều từ khóa bằng dấu phẩy (vd: "BST Hoa 20/10, Sản phẩm tốt nghiệp...")
  if (text.includes(",") && text.split(",").length >= 2) {
    const firstSegment = text.split(",")[0]?.trim() || text;
    if (firstSegment.toLowerCase().startsWith("bst ")) {
      return `${firstSegment} thanh lịch dẫn đầu xu hướng`;
    }
    return `${firstSegment} — Xu hướng thiết kế thịnh hành`;
  }

  return text;
}
