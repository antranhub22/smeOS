"use client";

import { TrendingUp } from "@/components/ui/icon-set/trending-up"
import { Zap } from "@/components/ui/icon-set/zap"
import { Video } from "@/components/ui/icon-set/video"
import { ArrowRight } from "@/components/ui/icon-set/arrow-right"
import { Tag } from "@/components/ui/icon-set/tag"
import { Play } from "@/components/ui/icon-set/play"
;
import type { OpportunityItem } from "./opportunity-card";
import { determineTrendLifecycle, LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";
import { getDualOpportunityEvidencePreview, getOpportunityHeadline } from "./opportunity-illustration";

interface BriefRisingViewProps {
  opportunities: OpportunityItem[];
  onSelectOpportunity: (item: OpportunityItem) => void;
}

export function BriefRisingView({
  opportunities,
  onSelectOpportunity,
}: BriefRisingViewProps) {
  // Sắp xếp ưu tiên các cơ hội mới nhất lên đầu, sau đó đến điểm Trend & Viral
  const sorted = [...opportunities].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return b.trendScore + b.viralScore - (a.trendScore + a.viralScore);
  });
  const risingItems = sorted.slice(0, 8);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner Bảng Xếp Hạng Xu Hướng */}
      <div className="rounded-2xl border border-success-border/90 bg-gradient-to-br from-success-bg/70 via-white to-bg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-white shadow-sm flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-body-sm font-extrabold text-text">Xu hướng tăng trưởng nhanh nhất</h3>
            <p className="text-caption text-text-muted mt-0.5">
              Các phong cách hoa và từ khóa có tốc độ lan tỏa nhanh nhất trên TikTok và Google Search trong 7 ngày qua
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-caption font-bold text-success-text bg-success-bg/60 px-3 py-1.5 rounded-xl border border-success-border self-start sm:self-auto">
          <Zap size={13} className="text-success-text" />
          <span>{risingItems.length} xu hướng đang bứt phá</span>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="space-y-3">
        {risingItems.map((item, idx) => {
          const lifecycle = determineTrendLifecycle(item.trendScore, 0.4, 20);
          const spec = LIFECYCLE_SPECS[lifecycle];
          const rankColors = [
            "bg-warning text-white shadow-xs", // #1
            "bg-text-muted text-white shadow-xs", // #2
            "bg-warning-text text-white shadow-xs", // #3
            "bg-border text-text",       // #4+
          ];
          const rankClass = rankColors[idx] || rankColors[3];
          const evidence = getDualOpportunityEvidencePreview(item);
          const headline = getOpportunityHeadline(item);

          return (
            <div
              role="button"
              tabIndex={0}
              key={`${item.id}-${idx}`}
              onClick={() => onSelectOpportunity(item)}
              className="group rounded-2xl border border-border/90 bg-white p-4 shadow-2xs hover:border-success hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Cột trái: Rank, Khung Dual Thumbnail (TikTok & YouTube) & Tên xu hướng */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-caption font-black flex-shrink-0 ${rankClass}`}
                >
                  #{idx + 1}
                </span>

                {/* Khung Chứa Cả 2 Thumbnail: TikTok & YouTube */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {/* Thumbnail TikTok */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if (evidence.tiktok.videoUrl) {
                        e.stopPropagation();
                        window.open(evidence.tiktok.videoUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    title={`Mở xem dẫn chứng video thật trên TikTok: ${evidence.tiktok.title}`}
                    className="relative h-16 w-16 sm:w-20 rounded-xl overflow-hidden flex-shrink-0 bg-text group/tiktok shadow-xs border border-border/90 cursor-pointer hover:border-primary transition-all hover:scale-[1.03]"
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
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/85 text-primary text-caption font-black uppercase tracking-wider backdrop-blur-xs border border-primary/30">
                        <Video className="h-2 w-2 text-primary" />
                        TikTok
                      </span>
                    </div>

                    {/* Play Icon hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover/tiktok:opacity-100 transition-opacity">
                      <div className="h-5 w-5 rounded-full bg-black/60 text-primary flex items-center justify-center border border-primary/40">
                        <Play className="h-2.5 w-2.5 fill-current translate-x-0.2 text-primary" />
                      </div>
                    </div>

                    {/* Author/Metrics */}
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between text-caption text-white/95 font-semibold drop-shadow-xs">
                      <span className="truncate" title={evidence.tiktok.author}>
                        {evidence.tiktok.author}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail YouTube */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if (evidence.youtube.videoUrl) {
                        e.stopPropagation();
                        window.open(evidence.youtube.videoUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    title={`Mở xem dẫn chứng video thật trên YouTube: ${evidence.youtube.title}`}
                    className="relative h-16 w-20 sm:w-24 rounded-xl overflow-hidden flex-shrink-0 bg-text group/yt shadow-xs border border-border/90 cursor-pointer hover:border-danger transition-all hover:scale-[1.03]"
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

                    {/* Play Icon hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover/yt:opacity-100 transition-opacity">
                      <div className="h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/40">
                        <Play className="h-2.5 w-2.5 fill-current translate-x-0.2 text-white" />
                      </div>
                    </div>

                    {/* Author/Metrics */}
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between text-caption text-white/95 font-semibold drop-shadow-xs">
                      <span className="truncate" title={evidence.youtube.author}>
                        {evidence.youtube.author}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-caption font-bold px-2 py-0.5 rounded-full border ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}>
                      {spec.shortLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-caption font-bold text-success-text bg-success-bg/90 px-2 py-0.5 rounded-full border border-success-border/80 shadow-2xs">
                      ⚡ {evidence.tiktok.metrics}
                    </span>
                  </div>

                  <h4 className="font-bold text-text text-body-sm group-hover:text-success-text transition truncate">
                    {headline}
                  </h4>
                </div>
              </div>

              {/* Cột giữa: Tín hiệu sóng (Trend vs Viral) */}
              <div className="flex items-center gap-4 text-caption flex-shrink-0 bg-bg/80 px-3.5 py-2 rounded-xl border border-border">
                <div>
                  <span className="text-caption text-text-muted block font-semibold">Độ nóng sóng</span>
                  <div className="flex items-center gap-1 font-bold text-text">
                    <TrendingUp size={13} className="text-info-text" />
                    <span>{Math.round(item.trendScore)}/100</span>
                  </div>
                </div>

                <div className="border-l border-border pl-4">
                  <span className="text-caption text-text-muted block font-semibold">Tốc độ Viral</span>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <Video size={13} className="text-primary" />
                    <span>{Math.round(item.viralScore)}/100</span>
                  </div>
                </div>
              </div>

              {/* Cột phải: CTA */}
              <div className="flex items-center justify-end sm:justify-start gap-1 text-caption font-bold text-success-text group-hover:translate-x-0.5 transition flex-shrink-0">
                <span>Xem phân tích sóng</span>
                <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
