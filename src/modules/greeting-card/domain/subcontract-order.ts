/**
 * subcontract-order.ts
 *
 * Domain State Machine cho Thẻ Gia Công & Cơ chế Khóa Đồng Thời, Hủy trong hạn (Grace Period).
 * Clean Architecture — Pure TypeScript, 100% không phụ thuộc cơ sở dữ liệu.
 */

export type SubcontractDispatchStatus =
  | "OPEN" // Đang mở để các chi nhánh trong vòng nhận đơn
  | "CLAIMED_GRACE" // 1 chi nhánh đã nhận, đang trong thời gian đếm ngược kiểm tra kho (Grace Period)
  | "COMMITTED" // Đã chốt chính thức cho chi nhánh (hết hạn hủy hoặc chi nhánh cam kết làm ngay)
  | "ESCALATED" // Hết các vòng hoặc không ai nhận -> Chuyển Điều phối can thiệp
  | "CANCELLED" // Đơn đã bị hủy

export interface SubcontractOrderState {
  orderId: string
  orderCode: string
  dispatchStatus: SubcontractDispatchStatus
  currentRound: number
  /** Chi nhánh hiện đang tạm giữ hoặc đã nhận đơn */
  claimedBranchId: string | null
  claimedBranchName?: string | null | undefined
  claimedAt: string | null // ISO Date String
  graceExpiresAt: string | null // ISO Date String
  /** Danh sách các chi nhánh đã từng nhận rồi hủy, hoặc bấm từ chối */
  declinedBranchIds: string[]
  /** Danh sách các chi nhánh đã được gửi lời mời ở vòng hiện tại */
  invitedBranchIds: string[]
  roundExpiresAt: string | null
}

export type ClaimResult =
  | { success: true; nextState: SubcontractOrderState }
  | { success: false; reason: "ALREADY_CLAIMED" | "NOT_OPEN" | "DECLINED_PREVIOUSLY" | "EXPIRED" }

export type CancelClaimResult =
  | { success: true; nextState: SubcontractOrderState }
  | { success: false; reason: "GRACE_EXPIRED" | "NOT_IN_GRACE" | "UNAUTHORIZED_BRANCH" }

/**
 * Kiểm tra xem đơn hàng gia công hiện tại có thể nhận hay không.
 */
export function isSubcontractClaimable(state: SubcontractOrderState, branchId: string): boolean {
  if (state.dispatchStatus !== "OPEN") return false
  if (state.declinedBranchIds.includes(branchId)) return false
  return true
}

/**
 * Chi nhánh bấm [TIẾP NHẬN ĐƠN] trên Thẻ Gia Công.
 * Cơ chế khóa đồng thời: Chỉ chi nhánh đầu tiên kích hoạt thành công khi dispatchStatus === "OPEN".
 */
export function claimSubcontractOrder(
  state: SubcontractOrderState,
  branchId: string,
  branchName: string,
  graceMinutes: number,
  now = new Date()
): ClaimResult {
  if (state.dispatchStatus !== "OPEN") {
    return { success: false, reason: state.dispatchStatus === "CLAIMED_GRACE" || state.dispatchStatus === "COMMITTED" ? "ALREADY_CLAIMED" : "NOT_OPEN" }
  }

  if (state.declinedBranchIds.includes(branchId)) {
    return { success: false, reason: "DECLINED_PREVIOUSLY" }
  }

  const claimedAtIso = now.toISOString()
  const graceExpiresAtIso = new Date(now.getTime() + graceMinutes * 60 * 1000).toISOString()

  return {
    success: true,
    nextState: {
      ...state,
      dispatchStatus: "CLAIMED_GRACE",
      claimedBranchId: branchId,
      claimedBranchName: branchName,
      claimedAt: claimedAtIso,
      graceExpiresAt: graceExpiresAtIso,
    },
  }
}

/**
 * Chi nhánh đã nhận bấm [HỦY NHẬN ĐƠN] trong thời gian kiểm tra kho (Grace Period).
 * Nếu trong hạn: Trả đơn về trạng thái OPEN, đưa chi nhánh này vào danh sách declined để bắn lại cho chi nhánh khác.
 */
export function cancelClaimSubcontractOrder(
  state: SubcontractOrderState,
  branchId: string,
  now = new Date()
): CancelClaimResult {
  if (state.dispatchStatus !== "CLAIMED_GRACE") {
    return { success: false, reason: "NOT_IN_GRACE" }
  }

  if (state.claimedBranchId !== branchId) {
    return { success: false, reason: "UNAUTHORIZED_BRANCH" }
  }

  // Kiểm tra thời hạn Grace Period
  if (state.graceExpiresAt && now.getTime() > new Date(state.graceExpiresAt).getTime()) {
    return { success: false, reason: "GRACE_EXPIRED" }
  }

  return {
    success: true,
    nextState: {
      ...state,
      dispatchStatus: "OPEN",
      claimedBranchId: null,
      claimedBranchName: null,
      claimedAt: null,
      graceExpiresAt: null,
      declinedBranchIds: [...new Set([...state.declinedBranchIds, branchId])],
    },
  }
}

/**
 * Chốt chính thức đơn gia công cho chi nhánh (khi hết thời hạn Grace Period hoặc chi nhánh chủ động chốt làm ngay).
 */
export function commitSubcontractOrder(
  state: SubcontractOrderState
): SubcontractOrderState {
  if (state.dispatchStatus !== "CLAIMED_GRACE" || !state.claimedBranchId) {
    return state
  }

  return {
    ...state,
    dispatchStatus: "COMMITTED",
  }
}

/**
 * Tính số giây còn lại trong thời gian cho phép hủy (Grace Period).
 */
export function getGraceSecondsRemaining(graceExpiresAt: string | null, now = new Date()): number {
  if (!graceExpiresAt) return 0
  const diffMs = new Date(graceExpiresAt).getTime() - now.getTime()
  return Math.max(0, Math.floor(diffMs / 1000))
}

/**
 * Định dạng thời gian đếm ngược dạng "MM:SS" (ví dụ: "04:59").
 */
export function formatGraceCountdown(secondsRemaining: number): string {
  const m = Math.floor(secondsRemaining / 60)
  const s = secondsRemaining % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
