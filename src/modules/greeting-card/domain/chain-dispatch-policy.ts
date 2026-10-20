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
  /** Khoảng cách gửi nhắc lại lần 2 nếu chưa có ảnh (Số phút, mặc định: 5) */
  qcRetryIntervalMinutes: number
  /** Thời gian sau lần 2 để báo động cho Điều phối nếu vẫn chưa có ảnh (Số phút, mặc định: 5) */
  qcEscalateAfterMinutes: number
  /** Nhắc cung cấp Shipper trước giờ giao dự kiến N phút (Số phút, vd: 30) */
  dispatchReminderMinutesBefore: number
  /** Khoảng cách gửi nhắc Shipper lần 2 nếu chưa có (Số phút, mặc định: 5) */
  shipperRetryIntervalMinutes: number
  /** Thời gian sau lần 2 để báo động đỏ cho Điều phối gọi trực tiếp nếu vẫn chưa có Shipper (Số phút, mặc định: 5) */
  shipperEscalateAfterMinutes: number
  /** Nhắc hoàn thành giao hàng / tải ảnh POD sau giờ giao dự kiến (Số phút, mặc định: 0) */
  deliveryReminderMinutesAfter: number
  /** Khoảng cách gửi nhắc hoàn thành giao hàng lần 2 (Số phút, mặc định: 5) */
  deliveryRetryIntervalMinutes: number
  /** Thời gian sau lần 2 để báo động đỏ Điều phối gọi can thiệp nếu chưa hoàn thành (Số phút, mặc định: 5) */
  deliveryEscalateAfterMinutes: number
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
  /** Tin nhắn nhắc chụp ảnh thành phẩm QC lần 1 */
  qcReminder: string
  /** Tin nhắn nhắc chụp ảnh thành phẩm QC lần 2 (khẩn cấp) */
  qcReminderSecond: string
  /** Tin nhắn cảnh báo Điều phối khi quá hạn nhắc ảnh QC lần 2 */
  qcEscalationAlert: string
  /** Tin nhắn nhắc bàn giao Shipper */
  dispatchReminder: string
  /** Tin nhắn nhắc cung cấp Shipper lần 1 */
  shipperReminder: string
  /** Tin nhắn nhắc cung cấp Shipper lần 2 (khẩn cấp) */
  shipperReminderSecond: string
  /** Tin nhắn cảnh báo đỏ Điều phối khi quá hạn nhắc Shipper lần 2 */
  shipperEscalationAlert: string
  /** Tin nhắn nhắc hoàn thành giao hàng / tải ảnh POD lần 1 */
  deliveryReminder: string
  /** Tin nhắn nhắc hoàn thành giao hàng / tải ảnh POD lần 2 (khẩn cấp) */
  deliveryReminderSecond: string
  /** Tin nhắn cảnh báo đỏ Điều phối khi quá hạn hoàn thành giao hàng */
  deliveryEscalationAlert: string
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
  /**
   * Tự động xác nhận đơn khi Chi nhánh đã nhận & chốt làm (Gate 2).
   * - true (Mặc định): Shop bấm chốt -> Hệ thống tự động duyệt CONFIRMED & ASSIGNED đơn luôn, Điều phối không cần bấm tay.
   * - false: Shop bấm chốt -> Đơn vẫn chờ Điều phối vào Thẻ gia công bấm nút Xác nhận duyệt.
   */
  autoConfirmOnBranchCommit: boolean
  /** Trọng số chấm điểm đánh giá xếp hạng chi nhánh */
  scoringWeights: DispatchScoringWeights
  /** Cấu hình thông báo tự động nhắc việc theo mốc tiến độ */
  milestoneReminders: DispatchMilestoneReminders
  /** Các mẫu tin nhắn tùy biến gửi qua Zalo / Telegram / Messenger */
  messageTemplates: DispatchMessageTemplates
}

export const DEFAULT_DISPATCH_MESSAGE_TEMPLATES: Readonly<DispatchMessageTemplates> = Object.freeze({
  inviteSubcontract:
    "🌸 [ĐƠN GIA CÔNG MỚI] Đơn hàng #{{orderCode}}\n📍 Giao tại: {{deliveryAddress}}\n⏰ Thời gian giao: {{deliveryTime}}\n💰 Thù lao gia công: {{subcontractPriceVnd}}\n⏳ Hạn nhận đơn: {{timeoutMinutes}} phút (Bấm nút bên dưới)",
  claimSuccess:
    "✅ [TIẾP NHẬN THÀNH CÔNG] Chi nhánh {{branchName}} đã nhận đơn #{{orderCode}}.\n⏳ Bạn có {{graceMinutes}} phút để kiểm tra kho và xác nhận lần cuối nếu thiếu nguyên liệu.",
  prepReminder:
    "🔔 [BẮT ĐẦU CHẾ TÁC] Đơn #{{orderCode}} đã chính thức chốt. Vui lòng chuẩn bị hoa và nguyên vật liệu theo định lượng BOM.",
  qcReminder:
    "📸 [NHẮC CHỤP ẢNH QC] Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng hoàn tất cắm hoa và chụp ảnh gửi khách trước {{qcTime}}.",
  qcReminderSecond:
    "⚠️ [NHẮC LẦN 2 - KHẨN CẤP] Đơn #{{orderCode}} sắp đến giờ giao nhưng hệ thống chưa nhận được ảnh chụp thành phẩm! Yêu cầu cửa hàng chụp và tải ảnh ngay.",
  qcEscalationAlert:
    "🚨 [CẢNH BÁO NGUY CƠ TRỄ HẠN] Đơn #{{orderCode}} tại {{branchName}} đã nhắc 2 lần nhưng CHƯA CÓ ẢNH THÀNH PHẨM! Điều phối vui lòng can thiệp gấp. Hotline: {{branchPhone}}",
  dispatchReminder:
    "🛵 [BÀN GIAO SHIPPER] Đơn #{{orderCode}} sắp đến giờ giao. Vui lòng đóng gói và bàn giao cho shipper.",
  shipperReminder:
    "🛵 [YÊU CẦU SHIPPER] Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng cung cấp Họ tên & SĐT Shipper để điều phối chuẩn bị bàn giao hàng: {{claimUrl}}",
  shipperReminderSecond:
    "⚠️ [NHẮC LẦN 2 - KHẨN] Đơn #{{orderCode}} chỉ còn {{minutesUntilDelivery}} phút là đến giờ giao nhưng hệ thống CHƯA CÓ THÔNG TIN SHIPPER! Chi nhánh vui lòng nhập ngay: {{claimUrl}}",
  shipperEscalationAlert:
    "🚨 [CẢNH BÁO ĐỎ - THIẾU SHIPPER] Đơn #{{orderCode}} tại {{branchName}} đã nhắc 2 lần nhưng CHƯA CUNG CẤP SHIPPER! Còn {{minutesUntilDelivery}} phút đến giờ giao. Điều phối gọi ngay: {{branchPhone}}",
  deliveryReminder:
    "⏰ [NHẮC BÀN GIAO & POD] Đơn #{{orderCode}} đã đến giờ giao ({{deliveryTime}}). Chi nhánh {{branchName}} vui lòng tải ảnh xác nhận giao hàng (POD) để hoàn tất đơn: {{claimUrl}}",
  deliveryReminderSecond:
    "⚠️ [NHẮC LẦN 2 - GIAO HÀNG KHẨN] Đơn #{{orderCode}} đã quá giờ giao {{overdueMinutes}} phút nhưng chưa có ảnh xác nhận giao hàng! Vui lòng cập nhật ngay: {{claimUrl}}",
  deliveryEscalationAlert:
    "🚨 [CẢNH BÁO ĐỎ - CHƯA GIAO HÀNG] Đơn #{{orderCode}} tại {{branchName}} đã quá hạn giao nhưng chưa có ảnh xác nhận! Điều phối gọi can thiệp gấp: {{branchPhone}}",
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
  autoConfirmOnBranchCommit: true,
  scoringWeights: Object.freeze({
    distance: 50,
    qualityScore: 30,
    workload: 20,
  }),
  milestoneReminders: Object.freeze({
    enabled: true,
    prepAlert: true,
    qcReminderMinutesBefore: 45,
    qcRetryIntervalMinutes: 5,
    qcEscalateAfterMinutes: 5,
    dispatchReminderMinutesBefore: 30,
    shipperRetryIntervalMinutes: 5,
    shipperEscalateAfterMinutes: 5,
    deliveryReminderMinutesAfter: 0,
    deliveryRetryIntervalMinutes: 5,
    deliveryEscalateAfterMinutes: 5,
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
    autoConfirmOnBranchCommit: typeof (r.auto_confirm_on_branch_commit ?? r.autoConfirmOnBranchCommit) === "boolean"
      ? Boolean(r.auto_confirm_on_branch_commit ?? r.autoConfirmOnBranchCommit)
      : DEFAULT_CHAIN_DISPATCH_POLICY.autoConfirmOnBranchCommit,
    scoringWeights: {
      distance: distWeight,
      qualityScore: qualWeight,
      workload: workWeight,
    },
    milestoneReminders: {
      enabled: typeof reminders?.enabled === "boolean" ? reminders.enabled : DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.enabled,
      prepAlert: typeof reminders?.prepAlert === "boolean" ? reminders.prepAlert : (reminders?.prep_alert === undefined ? DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.prepAlert : Boolean(reminders.prep_alert)),
      qcReminderMinutesBefore: clampInt(reminders?.qcReminderMinutesBefore ?? reminders?.qc_reminder_minutes_before, 5, 240, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.qcReminderMinutesBefore),
      qcRetryIntervalMinutes: clampInt(reminders?.qcRetryIntervalMinutes ?? reminders?.qc_retry_interval_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.qcRetryIntervalMinutes),
      qcEscalateAfterMinutes: clampInt(reminders?.qcEscalateAfterMinutes ?? reminders?.qc_escalate_after_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.qcEscalateAfterMinutes),
      dispatchReminderMinutesBefore: clampInt(reminders?.dispatchReminderMinutesBefore ?? reminders?.dispatch_reminder_minutes_before, 5, 120, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.dispatchReminderMinutesBefore),
      shipperRetryIntervalMinutes: clampInt(reminders?.shipperRetryIntervalMinutes ?? reminders?.shipper_retry_interval_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.shipperRetryIntervalMinutes),
      shipperEscalateAfterMinutes: clampInt(reminders?.shipperEscalateAfterMinutes ?? reminders?.shipper_escalate_after_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.shipperEscalateAfterMinutes),
      deliveryReminderMinutesAfter: clampInt(reminders?.deliveryReminderMinutesAfter ?? reminders?.delivery_reminder_minutes_after, 0, 120, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.deliveryReminderMinutesAfter),
      deliveryRetryIntervalMinutes: clampInt(reminders?.deliveryRetryIntervalMinutes ?? reminders?.delivery_retry_interval_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.deliveryRetryIntervalMinutes),
      deliveryEscalateAfterMinutes: clampInt(reminders?.deliveryEscalateAfterMinutes ?? reminders?.delivery_escalate_after_minutes, 1, 60, DEFAULT_CHAIN_DISPATCH_POLICY.milestoneReminders.deliveryEscalateAfterMinutes),
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
      qcReminderSecond: typeof templates?.qcReminderSecond === "string" && templates.qcReminderSecond.trim()
        ? templates.qcReminderSecond
        : (typeof templates?.qc_reminder_second === "string" && templates.qc_reminder_second.trim() ? templates.qc_reminder_second : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.qcReminderSecond),
      qcEscalationAlert: typeof templates?.qcEscalationAlert === "string" && templates.qcEscalationAlert.trim()
        ? templates.qcEscalationAlert
        : (typeof templates?.qc_escalation_alert === "string" && templates.qc_escalation_alert.trim() ? templates.qc_escalation_alert : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.qcEscalationAlert),
      dispatchReminder: typeof templates?.dispatchReminder === "string" && templates.dispatchReminder.trim()
        ? templates.dispatchReminder
        : (typeof templates?.dispatch_reminder === "string" && templates.dispatch_reminder.trim() ? templates.dispatch_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.dispatchReminder),
      shipperReminder: typeof templates?.shipperReminder === "string" && templates.shipperReminder.trim()
        ? templates.shipperReminder
        : (typeof templates?.shipper_reminder === "string" && templates.shipper_reminder.trim() ? templates.shipper_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.shipperReminder),
      shipperReminderSecond: typeof templates?.shipperReminderSecond === "string" && templates.shipperReminderSecond.trim()
        ? templates.shipperReminderSecond
        : (typeof templates?.shipper_reminder_second === "string" && templates.shipper_reminder_second.trim() ? templates.shipper_reminder_second : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.shipperReminderSecond),
      shipperEscalationAlert: typeof templates?.shipperEscalationAlert === "string" && templates.shipperEscalationAlert.trim()
        ? templates.shipperEscalationAlert
        : (typeof templates?.shipper_escalation_alert === "string" && templates.shipper_escalation_alert.trim() ? templates.shipper_escalation_alert : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.shipperEscalationAlert),
      deliveryReminder: typeof templates?.deliveryReminder === "string" && templates.deliveryReminder.trim()
        ? templates.deliveryReminder
        : (typeof templates?.delivery_reminder === "string" && templates.delivery_reminder.trim() ? templates.delivery_reminder : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.deliveryReminder),
      deliveryReminderSecond: typeof templates?.deliveryReminderSecond === "string" && templates.deliveryReminderSecond.trim()
        ? templates.deliveryReminderSecond
        : (typeof templates?.delivery_reminder_second === "string" && templates.delivery_reminder_second.trim() ? templates.delivery_reminder_second : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.deliveryReminderSecond),
      deliveryEscalationAlert: typeof templates?.deliveryEscalationAlert === "string" && templates.deliveryEscalationAlert.trim()
        ? templates.deliveryEscalationAlert
        : (typeof templates?.delivery_escalation_alert === "string" && templates.delivery_escalation_alert.trim() ? templates.delivery_escalation_alert : DEFAULT_DISPATCH_MESSAGE_TEMPLATES.deliveryEscalationAlert),
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
    auto_confirm_on_branch_commit: policy.autoConfirmOnBranchCommit,
    scoring_weights: {
      distance: policy.scoringWeights.distance,
      quality_score: policy.scoringWeights.qualityScore,
      workload: policy.scoringWeights.workload,
    },
    milestone_reminders: {
      enabled: policy.milestoneReminders.enabled,
      prep_alert: policy.milestoneReminders.prepAlert,
      qc_reminder_minutes_before: policy.milestoneReminders.qcReminderMinutesBefore,
      qc_retry_interval_minutes: policy.milestoneReminders.qcRetryIntervalMinutes,
      qc_escalate_after_minutes: policy.milestoneReminders.qcEscalateAfterMinutes,
      dispatch_reminder_minutes_before: policy.milestoneReminders.dispatchReminderMinutesBefore,
      shipper_retry_interval_minutes: policy.milestoneReminders.shipperRetryIntervalMinutes,
      shipper_escalate_after_minutes: policy.milestoneReminders.shipperEscalateAfterMinutes,
      delivery_reminder_minutes_after: policy.milestoneReminders.deliveryReminderMinutesAfter,
      delivery_retry_interval_minutes: policy.milestoneReminders.deliveryRetryIntervalMinutes,
      delivery_escalate_after_minutes: policy.milestoneReminders.deliveryEscalateAfterMinutes,
      overdue_warning_minutes: policy.milestoneReminders.overdueWarningMinutes,
    },
    message_templates: {
      invite_subcontract: policy.messageTemplates.inviteSubcontract,
      claim_success: policy.messageTemplates.claimSuccess,
      prep_reminder: policy.messageTemplates.prepReminder,
      qc_reminder: policy.messageTemplates.qcReminder,
      qc_reminder_second: policy.messageTemplates.qcReminderSecond,
      qc_escalation_alert: policy.messageTemplates.qcEscalationAlert,
      dispatch_reminder: policy.messageTemplates.dispatchReminder,
      shipper_reminder: policy.messageTemplates.shipperReminder,
      shipper_reminder_second: policy.messageTemplates.shipperReminderSecond,
      shipper_escalation_alert: policy.messageTemplates.shipperEscalationAlert,
      delivery_reminder: policy.messageTemplates.deliveryReminder,
      delivery_reminder_second: policy.messageTemplates.deliveryReminderSecond,
      delivery_escalation_alert: policy.messageTemplates.deliveryEscalationAlert,
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
