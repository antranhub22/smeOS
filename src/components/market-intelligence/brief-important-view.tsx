"use client";

import React from "react";
import { Flame } from "@/components/ui/icon-set/flame"
import { ArrowRight } from "@/components/ui/icon-set/arrow-right"
import { Tag } from "@/components/ui/icon-set/tag"
import { Play } from "@/components/ui/icon-set/play"
import { Video } from "@/components/ui/icon-set/video"
import { ExternalLink } from "@/components/ui/icon-set/external-link"
;
import type { OpportunityItem } from "./opportunity-card";
import { determineTrendLifecycle, LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";
import { getDualOpportunityEvidencePreview, getOpportunityHeadline } from "./opportunity-illustration";
import { Button } from "@/components/ui/button"

interface BriefImportantViewProps {
  opportunities: OpportunityItem[];
  onSelectOpportunity: (item: OpportunityItem) => void;
}

export function BriefImportantView({
  opportunities,
  onSelectOpportunity,
}: BriefImportantViewProps) {
  // Sắp xếp ưu tiên các cơ hội mới nhất lên đầu, sau đó đến điểm cơ hội
  const sorted = [...opportunities].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return b.contentOpportunityScore - a.contentOpportunityScore;
  });

  const topItems = sorted.slice(0, 10);

  if (topItems.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-muted text-primary mb-3">
          <Flame size={24} />
        </div>
        <h3 className="font-bold text-text text-body">Chưa có cơ hội thị trường nào</h3>
        <p className="text-caption text-text-muted mt-1 max-w-sm mx-auto">
          Kích hoạt quét tín hiệu xu hướng để hệ thống phân tích và đề xuất cơ hội kinh doanh cho cửa hàng của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header chỉ mục */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-body-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Cơ hội nổi bật nhất
          </h3>
          <p className="text-caption text-text-muted mt-0.5">
            Xếp hạng theo tín hiệu thị trường kết hợp tệp khách hàng của tiệm
          </p>
        </div>
        <span className="text-caption font-bold text-text-muted">
          Top {topItems.length} cơ hội
        </span>
      </div>

      {/* Danh Sách Xếp Hạng Top Cơ Hội */}
      <div className="space-y-3">
        {topItems.map((item, idx) => {
          const lifecycle = determineTrendLifecycle(item.trendScore, 0.4, 20);
          const spec = LIFECYCLE_SPECS[lifecycle];
          const evidence = getDualOpportunityEvidencePreview(item);
          const headline = getOpportunityHeadline(item);
          const rankColors = [
            "bg-accent-text text-white shadow-xs", // #1
            "bg-text-muted text-white shadow-xs", // #2
            "bg-warning-text text-white shadow-xs", // #3
            "bg-border text-text",       // #4+
          ];
          const rankClass = rankColors[idx] || rankColors[3];

          return (
            <div
              key={`${item.id}-${idx}`}
              className="group relative rounded-2xl border border-border/90 bg-white p-4 shadow-2xs hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Cột trái: Rank, Khung Dual Thumbnail (TikTok & YouTube) & Tên cơ hội */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-caption font-black flex-shrink-0 ${rankClass}`}
                >
                  #{idx + 1}
                </span>

                {/* Khung Chứa Cả 2 Thumbnail: TikTok & YouTube */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {/* Thumbnail TikTok */}
                  <a
                    href={evidence.tiktok.videoUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Mở xem dẫn chứng video thật trên TikTok: ${evidence.tiktok.title}`}
                    className="relative z-10 block h-16 w-16 sm:w-20 rounded-xl overflow-hidden flex-shrink-0 bg-text group/tiktok shadow-xs border border-border/90 cursor-pointer hover:border-primary transition-all hover:scale-[1.03]"
                  >
                    <img
                      src={evidence.tiktok.thumbnailUrl}
                      alt={evidence.tiktok.alt}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover/tiktok:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Platform Badge TikTok */}
                    <div className="absolute top-1 left-1">
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/85 text-white text-caption font-black uppercase tracking-wider backdrop-blur-xs border border-primary/30">
                        <Video className="h-2 w-2 text-white" />
                        TikTok
                      </span>
                    </div>

                    {/* Play icon overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover/tiktok:opacity-100 transition-opacity">
                      <div className="h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center border border-primary/40">
                        <Play className="h-2.5 w-2.5 fill-current translate-x-0.2 text-white" />
                      </div>
                    </div>

                    {/* Metrics/Author at bottom */}
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between text-caption text-white/95 font-semibold drop-shadow-xs">
                      <span className="truncate" title={evidence.tiktok.author}>
                        {evidence.tiktok.author}
                      </span>
                    </div>
                  </a>

                  {/* Thumbnail YouTube */}
                  <a
                    href={evidence.youtube.videoUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Mở xem dẫn chứng video thật trên YouTube: ${evidence.youtube.title}`}
                    className="relative z-10 block h-16 w-20 sm:w-24 rounded-xl overflow-hidden flex-shrink-0 bg-text group/yt shadow-xs border border-border/90 cursor-pointer hover:border-danger transition-all hover:scale-[1.03]"
                  >
                    <img
                      src={evidence.youtube.thumbnailUrl}
                      alt={evidence.youtube.alt}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Platform Badge YouTube */}
                    <div className="absolute top-1 left-1">
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-danger/90 text-white text-caption font-black uppercase tracking-wider backdrop-blur-xs">
                        <Play className="h-2 w-2 fill-current" />
                        YT
                      </span>
                    </div>

                    {/* Play icon overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover/yt:opacity-100 transition-opacity">
                      <div className="h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/40">
                        <Play className="h-2.5 w-2.5 fill-current translate-x-0.2 text-white" />
                      </div>
                    </div>

                    {/* Metrics/Author at bottom */}
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between text-caption text-white/95 font-semibold drop-shadow-xs">
                      <span className="truncate" title={evidence.youtube.author}>
                        {evidence.youtube.author}
                      </span>
                    </div>
                  </a>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-caption font-bold px-2 py-0.5 rounded-full border ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}>
                      {spec.shortLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-caption font-bold text-success-text bg-success-bg/90 px-2 py-0.5 rounded-full border border-success-border/80 shadow-2xs">
                      ⚡ {evidence.primary.metrics}
                    </span>
                  </div>

                  <h4 className="font-bold text-text text-body-sm group-hover:text-primary transition truncate">
                    {/* Nút chính phủ cả thẻ (after:inset-0); thumbnail video nằm trên lớp phủ */}
                    <Button variant="ghost"
                      type="button"
                      onClick={() => onSelectOpportunity(item)}
                      className="text-[length:inherit] h-auto justify-start font-[inherit] gap-0 p-0 hover:bg-transparent block w-full truncate text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                    >
                      {headline}
                    </Button>
                  </h4>
                </div>
              </div>

              {/* Cột giữa: 3 chỉ số thương mại */}
              <div className="flex items-center gap-3.5 text-caption flex-shrink-0 bg-bg/80 px-3.5 py-2 rounded-xl border border-border">
                <div>
                  <span className="text-caption text-text-muted block font-semibold">Độ nóng</span>
                  <div className="font-bold text-text">{Math.round(item.trendScore)}/100</div>
                </div>

                <div className="border-l border-border pl-3.5">
                  <span className="text-caption text-text-muted block font-semibold">Lan tỏa</span>
                  <div className="font-bold text-primary">{Math.round(item.viralScore)}/100</div>
                </div>

                <div className="border-l border-border pl-3.5">
                  <span className="text-caption text-text-muted block font-semibold">Sức mua</span>
                  <div className="font-bold text-success-text">{Math.round(item.commercialScore)}/100</div>
                </div>
              </div>

              {/* Cột phải: Điểm cơ hội & CTA */}
              <div className="flex items-center justify-between sm:justify-start gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-title-sm font-black text-primary leading-none block">
                    {Math.round(item.contentOpportunityScore)}
                  </span>
                  <span className="text-caption text-text-muted uppercase font-bold tracking-wider">
                    Điểm cơ hội
                  </span>
                </div>
                <div className="flex items-center gap-1 text-caption font-bold text-primary group-hover:translate-x-0.5 transition">
                  <span>Chi tiết</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
