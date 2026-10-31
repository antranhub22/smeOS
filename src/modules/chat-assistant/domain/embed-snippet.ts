/**
 * Mã nhúng trợ lý ảo lên website ngoài. Dựng từ slug thật của tiệm và địa chỉ
 * công khai của ứng dụng — không còn slug/tên miền mẫu. Trả `null` khi thiếu
 * một trong hai để giao diện ẩn khối mã và hướng người dùng hoàn thiện hồ sơ.
 */
export interface EmbedSnippetInput {
  readonly shopSlug: string | null | undefined
  readonly appUrl: string | null | undefined
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function buildEmbedSnippet(input: EmbedSnippetInput): string | null {
  const slug = input.shopSlug?.trim()
  const base = input.appUrl?.trim().replace(/\/+$/, "")
  if (!slug || !base) return null
  const src = `${base}/sdk/floraos-chat.js`
  return `<script src="${escapeAttr(src)}" data-shop-slug="${escapeAttr(slug)}" defer></script>`
}
