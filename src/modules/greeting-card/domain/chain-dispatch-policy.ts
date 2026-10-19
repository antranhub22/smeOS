/**
 * chain-dispatch-policy.ts
 *
 * Domain Model & Cấu hình Chuẩn hoá cho Hệ thống Bắn Đơn & Điều Phối Gia Công Tự Động (Chuỗi Cửa Hàng).
 * Clean Architecture — Pure TypeScript, tuyệt đối không import Prisma hay hạ tầng ngoài.
 */

export const CHAIN_DISPATCH_POLICY_KEY = "chain_dispatch_policy"

export interface DispatchScoringWeights {
  /** Trọng số khoảng cách từ chi nhánh đến người nhận (0 - 100, %) */
  distance: number
  /** Trọng số điểm đánh giá chất lượng KPI chi nhánh (0 - 100, %) */
  qualityScore: number
  /** Trọng số mức độ tải đơn hiện tại của chi nhánh (0 - 100, %) */
  workload: number
}

export interface DispatchMilestoneReminders {
  enabled: boolean
  /** Nhắc chuẩn bị nguyên vật liệu ngay khi hết thời gian hủy */
  prepAlert: boolean
  /** Nhắc chụp ảnh thành phẩm QC trước giờ giao dự kiến (Số phút, vd: 45) */
  qcReminderMinutesBefore: number
  /** Nhắc bàn giao Shipper trước giờ giao dự kiến (Số phút, vd: 20) */
  dispatchReminderMinutesBefore: number
  /** Cảnh báo vi phạm SLA nếu trễ hạn (Số phút quá hạn, vd: 5) */
  overdueWarningMinutes: number
}

export interface DispatchMessageTemplates {
  /** Tin nhắn mời gia công gửi kèm link thẻ gia công */
  inviteSubcontract: string
  /** Tin nhắn thông báo chi nhánh đã nhận đơn thành công */
  claimSuccess: string
  /** Tin nhắn nhắc chuẩn bị nguyên vật liệu / cắm hoa */
  prepReminder: string
  /** Tin nhắn nhắc chụp ảnh thành phẩm QC */
  qcReminder: string
  /** Tin nhắn nhắc bàn giao Shipper */
  dispatchReminder: string
  /** Tin nhắn cảnh báo trễ hạn SLA */
  overdueAlert: string
}

export interface ChainDispatchPolicy {
  /** Bật/tắt cơ chế bắn đơn tự động cho chuỗi (false = Điều phối liên hệ thủ công) */
  enabled: boolean
  /** Số lượng chi nhánh tối ưu được mời cùng lúc trong một vòng (Mặc định: 3, 1 - 10) */
  topN: number
  /** Thời gian chờ phản hồi tối đa của mỗi vòng trước khi chuyển sang vòng tiếp theo (Phút, mặc định: 5) */
  claimTimeoutMinutes: number
  /** Thời gian cho phép chi nhánh hủy sau khi bấm nhận để kiểm tra kho (Grace Period, Phút, mặc định: 5) */
  cancellationGraceMinutes: number
  /** Bán kính quét chi nhánh tối đa tính từ địa chỉ giao hàng (Km, mặc định: 25) */
  maxRadiusKm: number
  /** Số vòng bắn đơn tối đa trước khi báo động Điều phối can thiệp thủ công (Mặc định: 3) */
  maxRounds: number
  /** Tự động báo động đỏ cho Điều phối khi hết các vòng mà không chi nhánh nào nhận */
  autoEscalateToCoordinator: boolean
  /** Trọng số chấm điểm đánh giá xếp hạng chi nhánh */
  scoringWeights: DispatchScoringWeights
  /** Cấu hình thông báo tự động nhắc việc theo mốc tiến độ */
  milestoneReminders: DispatchMilestoneReminders
  /** Các mẫu tin nhắn tùy biến gửi qua Zalo / Telegram / Messenger */
  messageTemplates: DispatchMessageTemplates
}

export const DEFAULT_DISPATCH_MESSAGE_TEMPLATES: Readonly<DispatchMessageTemplates> = Object.freeze({
  inviteSubcontract:
    "🌸 [ĐƠN GIA CÔNG MỚI] Đơn hàng #{{orderCode}}\n📍 Giao tại: {{deliveryAddress}}\n⏰ Thời gian giao: {{deliveryTime}}\n💰 Thù lao gia công: {{subcontractPriceVnd}}\n👉 Nhận đơn ngay: {{claimUrl}} (Hết hạn sau {{timeoutMinutes}} phút)",
  claimSuccess:
    "✅ [TIẾP NHẬN THÀNH CÔNG] Chi nhánh {{branchName}} đã nhận đơn #{{orderCode}}.\n⏳ Bạn có {{graceMinutes}} phút để kiểm tra kho và xác nhận lần cuối nếu thiếu nguyên liệu.",
  prepReminder:
    "🔔 [BẮT ĐẦU CHẾ TÁC] Đơn #{{orderCode}} đã chính thức chốt. Vui lòng chuẩn bị hoa và nguyên vật liệu theo định lượng BOM.",
  qcReminder:
    "📸 [NHẮC CHỤP ẢNH QC] Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng hoàn tất cắm hoa và chụp ảnh gửi khách trước {{qcTime}}.",
  dispatchReminder:
    "🛵 [BÀN GIAO SHIPPER] Đơn #{{orderCode}} sắp đến giờ giao. Vui lòng đóng gói và bàn giao cho shipper.",
  overdueAlert:
    "⚠️ [CẢNH BÁO TRỄ HẠN] Đơn #{{orderCode}} đã quá hạn {{overdueMinutes}} phút mà chưa hoàn tất! Điều phối chuỗi đang theo dõi.",
})

export const DEFAULT_CHAIN_DISPATCH_POLICY: Readonly<ChainDispatchPolicy> = Object.freeze({
  enabled: true,
  topN: 3,
  claimTimeoutMinutes: 5,
  cancellationGraceMinutes: 5,
  maxRadiusKm: 25,
  maxRounds: 3,
  autoEscalateToCoordinator: true,
  scoringWeights: Object.freeze({
    distance: 50,
    qualityScore: 30,
    workload: 20,
  }),
  milestoneReminders: Object.freeze({
    enabled: true,
    prepAlert: true,
    qcReminderMinutesBefore: 45,
    dispatchReminderMinutesBefore: 20,
    overdueWarningMinutes: 5,
  }),
  messageTemplates: DEFAULT_DISPATCH_MESSAGE_TEMPLATES,
})

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) return fallback
  const floored = Math.floor(val)
  return Math.min(Math.max(floored, min), max)
}

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) return fallback
  return Math.min(Math.max(val, min), max)
}

/**
 * Đọc và chuẩn hóa cấu hình ChainDispatchPolicy từ settings của cửa hàng / tổ chức.
 */
export function parseChainDispatchPolicy(settings: unknown): ChainDispatchPolicy {
  if (!settings || typeof settings !== "object") return { ...DEFAULT_CHAIN_DISPATCH_POLICY }

  const s = settings as Record<string, unknown>
  const raw = s[CHAIN_DISPATCH_POLICY_KEY]
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CHAIN_DISPATCH_POLICY }

  const r = raw as Record<string, unknown>
  const weights = (r.scoring_weights || r.scoringWeights) as Record<string, unknown> | undefined
  const reminders = (r.milestone_reminders || r.milestoneReminders) as Record<string, unknown> | undefined
  const templates = (r.message_templates || r.messageTemplates) as Record<string, unknown> | undefined

  const distWeight = clampInt(weights?.distance, 0, 100, DEFAULT_CHAIN_DISPATCH_POLICY.scoringWeights.distance)
  const qualWeight = clampInt(weights?.qualityScore ?? weights?.quality_score, 0, 100, DEFAULT_CHAIN_DISPATCH_POLICY.scoringWeights.qualityScore)
  const workWeight = clampInt(weights?.workload, 0, 100, DEFAULT_CHAIN_DISPATCH_POLICY.scoringWeights.workload)

  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : DEFAULT_CHAIN_DISPATCH_POLICY.enabled,
    topN: clampInt(r.top_n ?? r.topN, 1, 10, DEFAULT_CHAIN_DISPATCH_POLICY.topN),
    claimTimeoutMinutes: clampInt(r.claim_timeout_minutes ?? r.claimTimeoutMinutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.claimTimeoutMinutes),
    cancellationGraceMinutes: clampInt(r.cancellation_grace_minutes ?? r.cancellationGraceMinutes, 1, 30, DEFAULT_CHAIN_DISPATCH_POLICY.cancellationGraceMinutes),
    maxRadiusKm: clampNumber(r.max_radius_km ?? r.maxRadiusKm, 1, 100, DEFAULT_CHAIN_DISPATCH_POLICY.maxRadiusKm),
    maxRounds: clampInt(r.max_rounds ?? r.maxRounds, 1, 10, DEFAULT_CHAIN_DISPATCH_POLICY.maxRounds),
    autoEscalateToCoordinator: typeof (r.auto_escalate_to_coordinator ?? r.autoEscalateToCoordinator) === "boolean"
      ? Boolean(r.auto_escalate_to_coordinator ?? r.autoEscalateToCoordinator)
      : DEFAULT_CHAIN_DISPATCH_POLICY.autoEscalateToCoordinator,
    scoringWeights: {
      distance: distWeight,
      qualityScore: qualWeight,
      workload: workWeight,
    },
    milestoneReminders: {
      enabled: typeof reminders?.enabled === "boolean" ? reminders.enabled : DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.enabled,
      prepAlert: typeof reminders?.prepAlert === "boolean" ? reminders.prepAlert : (reminders?.prep_alert === undefined ? DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.prepAlert : Boolean(reminders.prep_alert)),
      qcReminderMinutesBefore: clampInt(reminders?.qcReminderMinutesBefore ?? reminders?.qc_reminder_minutes_before, 5, 240, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.qcReminderMinutesBefore),
      dispatchReminderMinutesBefore: clampInt(reminders?.dispatchReminderMinutesBefore ?? reminders?.dispatch_reminder_minutes_before, 5, 120, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.dispatchReminderMinutesBefore),
      overdueWarningMinutes: clampInt(reminders?.overdueWarningMinutes ?? reminders?.overdue_warning_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.overdueWarningMinutes),
    },
    messageTemplates: {
      inviteSubcontract: typeof templates?.inviteSubcontract === "string" && templates.inviteSubcontract.trim()
        ? templates.inviteSubcontract
        : (typeof templates?.invite_subcontract === "string" && templates.invite_subcontract.trim() ? templates.invite_subcontract : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.inviteSubcontract),
      claimSuccess: typeof templates?.claimSuccess === "string" && templates.claimSuccess.trim()
        ? templates.claimSuccess
        : (typeof templates?.claim_success === "string" && templates.claim_success.trim() ? templates.claim_success : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.claimSuccess),
      prepReminder: typeof templates?.prepReminder === "string" && templates.prepReminder.trim()
        ? templates.prepReminder
        : (typeof templates?.prep_reminder === "string" && templates.prep_reminder.trim() ? templates.prep_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.prepReminder),
      qcReminder: typeof templates?.qcReminder === "string" && templates.qcReminder.trim()
        ? templates.qcReminder
        : (typeof templates?.qc_reminder === "string" && templates.qc_reminder.trim() ? templates.qc_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.qcReminder),
      dispatchReminder: typeof templates?.dispatchReminder === "string" && templates.dispatchReminder.trim()
        ? templates.dispatchReminder
        : (typeof templates?.dispatch_reminder === "string" && templates.dispatch_reminder.trim() ? templates.dispatch_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.dispatchReminder),
      overdueAlert: typeof templates?.overdueAlert === "string" && templates.overdueAlert.trim()
        ? templates.overdueAlert
        : (typeof templates?.overdue_alert === "string" && templates.overdue_alert.trim() ? templates.overdue_alert : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.overdueAlert),
    },
  }
}

/**
 * Serialize cấu hình để lưu vào store settings của tổ chức.
 */
export function serializeChainDispatchPolicy(policy: ChainDispatchPolicy): Record<string, unknown> {
  return {
    enabled: policy.enabled,
    top_n: policy.topN,
    claim_timeout_minutes: policy.claimTimeoutMinutes,
    cancellation_grace_minutes: policy.cancellationGraceMinutes,
    max_radius_km: policy.maxRadiusKm,
    max_rounds: policy.maxRounds,
    auto_escalate_to_coordinator: policy.autoEscalateToCoordinator,
    scoring_weights: {
      distance: policy.scoringWeights.distance,
      quality_score: policy.scoringWeights.qualityScore,
      workload: policy.scoringWeights.workload,
    },
    milestone_reminders: {
      enabled: policy.milestoneReminders.enabled,
      prep_alert: policy.milestoneReminders.prepAlert,
      qc_reminder_minutes_before: policy.milestoneReminders.qcReminderMinutesBefore,
      dispatch_reminder_minutes_before: policy.milestoneReminders.dispatchReminderMinutesBefore,
      overdue_warning_minutes: policy.milestoneReminders.overdueWarningMinutes,
    },
    message_templates: {
      invite_subcontract: policy.messageTemplates.inviteSubcontract,
      claim_success: policy.messageTemplates.claimSuccess,
      prep_reminder: policy.messageTemplates.prepReminder,
      qc_reminder: policy.messageTemplates.qcReminder,
      dispatch_reminder: policy.messageTemplates.dispatchReminder,
      overdue_alert: policy.messageTemplates.overdueAlert,
    },
  }
}

/**
 * Trộn các biến số vào mẫu tin nhắn thông báo (Template Interpolation Engine).
 */
export function renderDispatchMessage(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return key in vars ? String(vars[key]) : match
  })
}
