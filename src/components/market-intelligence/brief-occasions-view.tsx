"use client";

import { Button } from "@/components/ui/button"
import React, { useState } from "react";
import { CalendarDays } from "@/components/ui/icon-set/calendar-days"
import { Tag } from "@/components/ui/icon-set/tag"
import { ArrowRight } from "@/components/ui/icon-set/arrow-right"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { Video } from "@/components/ui/icon-set/video"
import { Play } from "@/components/ui/icon-set/play"
;
import type { OpportunityItem } from "./opportunity-card";
import { determineTrendLifecycle, LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";
import { getDualOpportunityEvidencePreview, getOpportunityHeadline } from "./opportunity-illustration";

interface BriefOccasionsViewProps {
  opportunities: OpportunityItem[];
  onSelectOpportunity: (item: OpportunityItem) => void;
}

const OCCASION_SECTIONS = [
  {
    id: "birthday",
    title: "1. Sinh Nhật & Chúc Mừng",
    timeframe: "Cao điểm quanh năm",
    audience: "Bạn bè, người thân, đồng nghiệp",
    stockAdvice: "Nên nhập: Hoa hồng kem dâu, Tulip pastel, Baby trắng, Cẩm chướng",
    colorAdvice: "Tông pastel dịu ngọt, tươi vui, trẻ trung",
    keywords: ["sinh nhật", "mẹ", "chúc mừng", "tặng"],
    badgeClass: "bg-primary-muted text-primary border-primary-border",
  },
  {
    id: "wedding",
    title: "2. Kỷ Niệm Ngày Cưới & Tình Yêu",
    timeframe: "Mùa cưới & ngày kỷ niệm",
    audience: "Cặp đôi, vợ chồng, người yêu",
    stockAdvice: "Nên nhập: Hồng đỏ Ecuador, Cẩm tú cầu, Lan hồ điệp trắng, Mẫu đơn",
    colorAdvice: "Tông đỏ nhung lãng mạn, hồng phấn tinh tế, trắng ngọc",
    keywords: ["cưới", "kỷ niệm", "yêu", "tình"],
    badgeClass: "bg-accent-bg text-accent-text border-accent-border",
  },
  {
    id: "graduation",
    title: "3. Lễ Tốt Nghiệp & Tri Ân",
    timeframe: "Mùa tốt nghiệp các trường đại học & THPT",
    audience: "Tân cử nhân, sinh viên, bạn bè tặng nhau",
    stockAdvice: "Nên nhập: Hoa hướng dương, Cúc tana, Cúc họa mi, Hồng vàng",
    colorAdvice: "Tông vàng rực rỡ, cam nhiệt huyết, trắng hy vọng",
    keywords: ["tốt nghiệp", "cử nhân", "sản phẩm"],
    badgeClass: "bg-warning-bg text-warning-text border-warning-border",
  },
  {
    id: "grand_opening",
    title: "4. Khai Trương & Sự Kiện Doanh Nghiệp",
    timeframe: "Mở cửa hàng, thành lập công ty, đối tác",
    audience: "Khách hàng B2B, doanh nghiệp, bạn bè mở tiệm",
    stockAdvice: "Nên nhập: Lan hồ điệp chậu, Hồng môn đỏ, Đồng tiền, Thiên điểu",
    colorAdvice: "Tông đỏ tài lộc, vàng phát tài, kệ hoa đứng uy nghi",
    keywords: ["khai trương", "công ty", "đối tác"],
    badgeClass: "bg-success-bg text-success-text border-success-border",
  },
];

export function BriefOccasionsView({
  opportunities,
  onSelectOpportunity,
}: BriefOccasionsViewProps) {
  const [activeOccasionId, setActiveOccasionId] = useState<string>("birthday");

  const currentSection =
    OCCASION_SECTIONS.find((s) => s.id === activeOccasionId) ?? OCCASION_SECTIONS[0]!;

  // Lọc các sản phẩm khớp với dịp lễ đang chọn
  const matchingItems = opportunities.filter((item) => {
    const text = `${item.topicName} ${item.opportunitySummary} ${item.audience || ""}`.toLowerCase();
    return currentSection.keywords.some((kw) => text.includes(kw));
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 4 Nút Chọn Sự Kiện Mùa Vụ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {OCCASION_SECTIONS.map((sec) => {
          const count = opportunities.filter((item) => {
            const text = `${item.topicName} ${item.opportunitySummary} ${item.audience || ""}`.toLowerCase();
            return sec.keywords.some((kw) => text.includes(kw));
          }).length;

          const isActive = activeOccasionId === sec.id;

          return (
            <Button variant="outline"
              key={sec.id}
              type="button"
              onClick={() => setActiveOccasionId(sec.id)}
              className={`text-[length:inherit] h-auto font-[inherit] gap-0 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                isActive
                  ? "border-accent bg-accent-bg/80 ring-2 ring-accent/50 shadow-xs hover:bg-accent-bg/80"
                  : "border-border bg-white hover:border-accent-border hover:shadow-xs hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-caption font-extrabold text-text">{sec.title}</span>
                {isActive && <CheckCircle2 size={14} className="text-accent-text" />}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-caption text-text-muted">{sec.timeframe}</span>
                <span className="text-caption font-black text-accent-text bg-white px-2 py-0.5 rounded-md border border-accent-border">
                  {count} sản phẩm
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Chi Tiết Hướng Dẫn Nhập Kho Cho Sự Kiện Đang Chọn */}
      <div className="rounded-2xl border border-accent-border/90 bg-gradient-to-br from-accent-bg/60 via-white to-bg p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-accent-border pb-3">
          <div>
            <h3 className="text-body-sm font-extrabold text-text flex items-center gap-2">
              Kế Hoạch Chuẩn Bị: {currentSection.title}
            </h3>
            <p className="text-caption text-text-muted mt-0.5">
              Khách hàng mục tiêu: <strong className="text-text">{currentSection.audience}</strong>
            </p>
          </div>
          <span className="text-caption font-bold text-accent-text bg-accent-bg/80 px-3 py-1 rounded-full self-start sm:self-auto">
            {matchingItems.length} sản phẩm gợi ý trong kho
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption text-text">
          <div className="bg-white p-3 rounded-xl border border-accent-border space-y-1">
            <span className="font-bold text-accent-text block text-caption">📦 Loài hoa chủ lực nên nhập:</span>
            <p className="text-text-muted">{currentSection.stockAdvice}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-accent-border space-y-1">
            <span className="font-bold text-accent-text block text-caption">🎨 Tông màu thiết kế gợi ý:</span>
            <p className="text-text-muted">{currentSection.colorAdvice}</p>
          </div>
        </div>
      </div>

      {/* Grid Các Mẫu Hoa Cho Dịp Này */}
      <div className="space-y-2">
        <h4 className="text-caption font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent-text" />
          Sản phẩm gợi ý ({matchingItems.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingItems.map((item) => {
            const lifecycle = determineTrendLifecycle(item.trendScore, 0.4, 20);
            const spec = LIFECYCLE_SPECS[lifecycle];
            const dualEvidence = getDualOpportunityEvidencePreview(item);
            const evidence = dualEvidence.primary;
            const headline = getOpportunityHeadline(item);

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-border/90 bg-white shadow-2xs hover:border-accent hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-text">
                  <img
                    src={evidence.thumbnailUrl}
                    alt={evidence.alt}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-2.5 flex flex-wrap items-center gap-1.5 z-10">
                    <span className={`inline-flex items-center gap-1 text-caption font-bold px-2 py-0.5 rounded-full border ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}>
                      {spec.shortLabel}
                    </span>
                    <a
                      href={dualEvidence.tiktok.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Mở TikTok: ${dualEvidence.tiktok.title}`}
                      className="inline-flex items-center gap-1 text-caption font-black px-2 py-0.5 rounded-full bg-black/80 text-white border border-primary/30 backdrop-blur-xs shadow-xs hover:scale-105 transition"
                    >
                      <Video className="h-2.5 w-2.5 text-white" />
                      TikTok
                    </a>
                    <a
                      href={dualEvidence.youtube.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Mở YouTube: ${dualEvidence.youtube.title}`}
                      className="inline-flex items-center gap-1 text-caption font-black px-2 py-0.5 rounded-full bg-danger/90 text-white border border-danger/30 backdrop-blur-xs shadow-xs hover:scale-105 transition"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      YT
                    </a>
                  </div>
                  <div className="absolute left-3 bottom-2 flex items-center gap-2 text-caption text-white/90 font-medium">
                    <span className="truncate">{evidence.author}</span>
                    <span>• {evidence.metrics}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <h5 className="font-bold text-text text-body-sm leading-snug group-hover:text-accent-text transition line-clamp-2">
                    {/* Nút chính phủ cả thẻ (after:inset-0); thumbnail video nằm trên lớp phủ */}
                    <button
                      type="button"
                      onClick={() => onSelectOpportunity(item)}
                      className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                    >
                      {headline}
                    </button>
                  </h5>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-caption">
                    <span className="text-text-muted text-caption truncate max-w-[70%]">
                      {item.audience || currentSection.audience}
                    </span>
                    <span className="text-accent-text font-bold group-hover:translate-x-0.5 transition inline-flex items-center gap-0.5">
                      Xem mẫu <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
