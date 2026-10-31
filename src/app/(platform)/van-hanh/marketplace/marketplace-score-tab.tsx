import React from "react"
import { Award, UserCheck, Calendar, FileText, CheckCircle } from "@/components/ui/icons"
import type {
  PartnerStoreScoreAndTier,
  PartnerStoreAudit,
  PartnerStoreBusiness,
} from "@/modules/platform/domain/partner-marketplace.types"

interface MarketplaceScoreTabProps {
  scoreAndTier: PartnerStoreScoreAndTier
  audit: PartnerStoreAudit
  business: PartnerStoreBusiness
}

export function MarketplaceScoreTab({ scoreAndTier, audit, business }: MarketplaceScoreTabProps) {
  const criteria = [
    { label: "Tay nghề cắm & Đúng mẫu thiết kế", score: scoreAndTier.skillAndCraftScore },
    { label: "Quy trình & Cơ sở vật chất", score: scoreAndTier.processFacilityScore },
    { label: "Nguồn cung ứng & Bảo quản hoa", score: scoreAndTier.supplyStorageScore },
    { label: "Năng lực sản xuất & Giao vận", score: scoreAndTier.productionDeliveryScore },
    { label: "Pháp lý & Hiện diện số", score: scoreAndTier.legalDigitalScore },
    { label: "Kỷ luật & Tinh thần hợp tác", score: scoreAndTier.disciplineCooperationScore },
  ]

  return (
    <div className="space-y-6">
      {/* 6 Dimension Score Grid */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
          <Award className="h-4 w-4" /> Bảng Điểm Đánh Giá Năng Lực 6 Tiêu Chí
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {criteria.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3.5 bg-surface text-center shadow-2xs">
              <div className="text-caption text-text-muted font-medium mb-1 line-clamp-2 min-h-[32px]">
                {item.label}
              </div>
              <div className="text-base font-black text-primary">
                {item.score && item.score.trim().length > 0 ? item.score : "---"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Tier & Total Score Banner */}
      <div className="rounded-xl border border-warning-border bg-warning-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-warning-text border border-warning-border font-bold shadow-xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-caption font-bold uppercase tracking-wider text-warning-text">
              Phân Hạng Đề Xuất
            </div>
            <div className="text-base font-black text-warning-text">
              {scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"}
            </div>
          </div>
        </div>
        {scoreAndTier.totalScore && (
          <div className="text-right">
            <div className="text-caption text-text-muted">Tổng điểm đánh giá</div>
            <div className="text-xl font-black text-primary leading-none">{scoreAndTier.totalScore}</div>
          </div>
        )}
      </div>

      {/* Partnership Expectations & Wishes */}
      <div className="rounded-xl border border-border p-4 bg-surface-alt/30 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <FileText className="h-4 w-4" /> Kỳ Vọng & Mong Muốn Hợp Tác Với Hệ Thống
        </h4>
        <div className="space-y-2 text-xs">
          {business.cooperationWishes && (
            <div className="py-1 border-b border-border/50">
              <span className="text-text-muted block mb-0.5 font-medium">Nguyện vọng hợp tác cụ thể:</span>
              <p className="font-semibold text-text italic">&quot;{business.cooperationWishes}&quot;</p>
            </div>
          )}
          {business.algExpectations && (
            <div className="py-1 border-b border-border/50">
              <span className="text-text-muted block mb-0.5 font-medium">Kỳ vọng khi tham gia nền tảng:</span>
              <p className="text-text">&quot;{business.algExpectations}&quot;</p>
            </div>
          )}
          {scoreAndTier.additionalNotes && (
            <div className="py-1 border-b border-border/50">
              <span className="text-text-muted block mb-0.5 font-medium">Ghi chú bổ sung từ hội đồng:</span>
              <p className="text-text">{scoreAndTier.additionalNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Meta & Field Surveyor */}
      <div className="rounded-xl border border-border p-4 bg-surface-alt/20 text-xs text-text-muted flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>
            Khảo sát bởi chuyên viên: <strong className="text-text">{audit.specialist || "Ban khảo sát"}</strong> (
            {audit.surveyDate})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-text-muted" />
          <span>Hình thức: <strong className="text-text">{audit.surveyType || "Lần đầu"}</strong></span>
          {audit.timestamp && <span className="text-caption">({audit.timestamp})</span>}
        </div>
      </div>
    </div>
  )
}

