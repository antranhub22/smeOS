/**
 * Mẫu đề xuất — giai đoạn 1 của quản trị danh mục (PO chốt 23/10/2026).
 *
 * Mẫu do người KHÔNG có `H3` (duyệt vào danh mục, trần cứng `dieu_hanh`) tạo
 * được dùng ngay, nhưng mang nhãn "đề xuất" trong `attributes.proposal` cho tới
 * khi Điều hành duyệt. Chưa đổi schema: khoá này chỉ máy chủ được ghi, mọi giá
 * trị client gửi lên đều bị bỏ (`stripProposal`).
 *
 * Mẫu không có nhãn đề xuất (hoặc đã duyệt) là mẫu chính thức: chỉ Điều hành
 * sửa nội dung; người khác chỉ được đổi trạng thái bán (tạm ẩn / mở bán) và
 * cấu hình khả dụng — việc vận hành hằng ngày không phải chờ duyệt.
 */

export const PROPOSAL_KEY = "proposal"

export interface ProductProposal {
  status: "pending" | "approved"
  byUserId: string
  at: string
  approvedBy?: string
  approvedAt?: string
}

type Attrs = Record<string, unknown> | null | undefined

export function readProposal(attrs: Attrs): ProductProposal | null {
  const raw = attrs?.[PROPOSAL_KEY]
  if (!raw || typeof raw !== "object") return null
  const p = raw as Partial<ProductProposal>
  if ((p.status !== "pending" && p.status !== "approved") || typeof p.byUserId !== "string") return null
  return { status: p.status, byUserId: p.byUserId, at: String(p.at ?? ""), ...(p.approvedBy ? { approvedBy: p.approvedBy, approvedAt: p.approvedAt } : {}) }
}

export function isPendingProposal(attrs: Attrs): boolean {
  return readProposal(attrs)?.status === "pending"
}

/** Bỏ `proposal` khỏi dữ liệu client gửi — nhãn đề xuất chỉ máy chủ ghi. */
export function stripProposal<T extends Record<string, unknown> | null | undefined>(attrs: T): T {
  if (!attrs || !(PROPOSAL_KEY in attrs)) return attrs
  const { [PROPOSAL_KEY]: _ignored, ...rest } = attrs
  return rest as T
}

export function newProposal(userId: string, now: Date = new Date()): ProductProposal {
  return { status: "pending", byUserId: userId, at: now.toISOString() }
}

export function approveProposal(p: ProductProposal, approverId: string, now: Date = new Date()): ProductProposal {
  return { ...p, status: "approved", approvedBy: approverId, approvedAt: now.toISOString() }
}

/** Trường vận hành người không phải Điều hành được đổi trên mẫu chính thức. */
const OPERATIONAL_FIELDS = new Set(["status", "availabilityConfig"])

export type EditDecision = "allow" | "deny"

/**
 * Ai được sửa gì trên một mẫu đã có. `input` là các trường thực sự gửi lên
 * (giá trị `undefined` coi như không gửi).
 */
export function decideEdit(args: {
  canManageCatalog: boolean
  userId: string
  storedAttributes: Attrs
  input: Record<string, unknown>
}): EditDecision {
  if (args.canManageCatalog) return "allow"
  const proposal = readProposal(args.storedAttributes)
  if (proposal?.status === "pending" && proposal.byUserId === args.userId) return "allow"

  const sent = Object.entries(args.input).filter(([, v]) => v !== undefined)
  const onlyOperational = sent.every(([k]) => OPERATIONAL_FIELDS.has(k))
  // Tạm ẩn / mở bán thôi — ngừng kinh doanh vẫn cần L4 ở route.
  const statusOk = args.input.status === undefined || args.input.status === "ACTIVE" || args.input.status === "DRAFT"
  return onlyOperational && statusOk ? "allow" : "deny"
}
