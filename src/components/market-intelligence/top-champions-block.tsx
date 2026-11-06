"use client";

import React, { useMemo, useState } from "react";
import { Trophy } from "@/components/ui/icon-set/trophy"
import { Crown } from "@/components/ui/icon-set/crown"
import { Play } from "@/components/ui/icon-set/play"
import { Video } from "@/components/ui/icon-set/video"
import { ArrowRight } from "@/components/ui/icon-set/arrow-right"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { ExternalLink } from "@/components/ui/icon-set/external-link"
;
import {
  findPeriodChampions,
  type PeriodChampion,
  type ChampionPeriodKey,
} from "@/modules/market-intelligence/domain/trend-timeframe";
import { determineTrendLifecycle, LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";
import { getDualOpportunityEvidencePreview, getOpportunityHeadline } from "./opportunity-illustration";
import type { OpportunityItem } from "./opportunity-card";
import { VideoPreviewModal, type VideoPreviewModalData } from "./video-preview-modal";
import { Button } from "@/components/ui/button"

interface TopChampionsBlockProps {
  opportunities: OpportunityItem[];
  onSelectOpportunity?: (item: OpportunityItem) => void;
  className?: string;
}

interface PeriodTheme {
  gradient: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  ringColor: string;
  accentScore: string;
}

const PERIOD_THEMES: Record<ChampionPeriodKey, PeriodTheme> = {
  WEEK: {
    gradient: "from-primary/10 via-primary-muted/30 to-white",
    border: "border-primary-border/90 hover:border-primary",
    badgeBg: "bg-primary-muted text-primary border-primary-border",
    badgeText: "text-primary",
    ringColor: "ring-primary-border",
    accentScore: "text-primary",
  },
  MONTH: {
    gradient: "from-warning/10 via-warning-bg/30 to-white",
    border: "border-warning-border/90 hover:border-warning",
    badgeBg: "bg-warning-bg text-warning-text border-warning-border",
    badgeText: "text-warning-text",
    ringColor: "ring-warning-border",
    accentScore: "text-warning-text",
  },
  QUARTER: {
    gradient: "from-accent/10 via-accent-bg/30 to-white",
    border: "border-accent-border/90 hover:border-accent",
    badgeBg: "bg-accent-bg text-accent-text border-accent-border",
    badgeText: "text-accent-text",
    ringColor: "ring-accent-border",
    accentScore: "text-accent-text",
  },
  HALF_YEAR: {
    gradient: "from-info/10 via-info-bg/30 to-white",
    border: "border-info-border/90 hover:border-info",
    badgeBg: "bg-info-bg text-info-text border-info-border",
    badgeText: "text-info-text",
    ringColor: "ring-info-border",
    accentScore: "text-info-text",
  },
  YEAR: {
    gradient: "from-success/10 via-success-bg/30 to-white",
    border: "border-success-border/90 hover:border-success",
    badgeBg: "bg-success-bg text-success-text border-success-border",
    badgeText: "text-success-text",
    ringColor: "ring-success-border",
    accentScore: "text-success-text",
  },
};

export function TopChampionsBlock({
  opportunities,
  onSelectOpportunity,
  className = "",
}: TopChampionsBlockProps) {
  const [activeVideo, setActiveVideo] = useState<VideoPreviewModalData | null>(null);

  const champions = useMemo(
    () => findPeriodChampions(opportunities),
    [opportunities]
  );

  const hasAnyChampion = champions.some((c) => c.item !== null);
  if (!hasAnyChampion) {
    return null;
  }

  return (
    <>
      <div
        className={`rounded-2xl border border-border/90 bg-gradient-to-br from-bg via-white to-primary-muted/20 p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
      >
        {/* Header bar: Bảng Vàng Quán Quân */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-primary text-white shadow-xs">
              <Trophy size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-caption sm:text-body-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
                  Bảng Vàng Xu Hướng: Quán Quân Chu Kỳ
                </h2>
                <span className="text-caption font-black px-2 py-0.5 rounded-full bg-warning-bg text-warning-text border border-warning-border">
                  Top 1 Hall of Fame
                </span>
              </div>
              <p className="text-caption text-text-muted font-medium">
                Cơ hội đứng đầu bảng xếp hạng theo từng mốc: Tuần · Tháng · 3 Tháng · 6 Tháng · 1 Năm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-caption font-bold text-text-muted bg-white px-3 py-1 rounded-full border border-border shadow-2xs">
            <Crown size={12} className="text-warning-text" />
            <span>Điểm cơ hội cao nhất</span>
          </div>
        </div>

        {/* Grid 5 Cột: 5 Quán quân cho 5 chu kỳ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {champions.map((champ) => {
            const item = champ.item;
            const theme = PERIOD_THEMES[champ.key];

            if (!item) {
              return (
                <div
                  key={champ.key}
                  className="rounded-xl border border-dashed border-border bg-bg/50 p-4 text-center flex flex-col justify-center items-center min-h-[220px]"
                >
                  <div className="text-caption font-bold text-text-muted mb-1">{champ.label}</div>
                  <p className="text-caption text-text-muted font-medium">Chưa có cơ hội trong {champ.subLabel}</p>
                </div>
              );
            }

            const dualEvidence = getDualOpportunityEvidencePreview(item);
            const evidence = dualEvidence.primary;
            const headline = getOpportunityHeadline(item);
            const lifecycle = determineTrendLifecycle(item.trendScore, 0.4, 20);
            const spec = LIFECYCLE_SPECS[lifecycle];

            const handlePlayVideo = (e: React.MouseEvent) => {
              e.stopPropagation();
              setActiveVideo({
                title: evidence.title || headline,
                videoUrl: evidence.videoUrl,
                youtubeUrl: dualEvidence.youtube?.videoUrl,
                tiktokUrl: dualEvidence.tiktok?.videoUrl,
                thumbnailUrl: evidence.thumbnailUrl,
                author: evidence.author || dualEvidence.youtube?.author,
                metrics: evidence.metrics || dualEvidence.youtube?.metrics,
                topicName: item.topicName,
              });
            };

            return (
              <div
                key={champ.key}
                className={`group relative rounded-xl border bg-gradient-to-b ${theme.gradient} ${theme.border} p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden`}
              >
                {/* Top Banner Tag */}
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1 text-caption font-black px-2 py-0.5 rounded-full border shadow-2xs ${theme.badgeBg}`}
                  >
                    <Crown size={11} className="fill-current" />
                    {champ.label}
                  </span>
                  <span className="text-caption font-bold text-text-muted">
                    {champ.subLabel}
                  </span>
                </div>

                {/* Thumbnail Ảnh Video: Click hiển thị luôn video */}
                <Button variant="ghost"
                  type="button"
                  onClick={handlePlayVideo}
                  aria-label={`Xem video: ${headline}`}
                  className="text-[length:inherit] h-auto justify-start font-[inherit] gap-0 p-0 group/thumb relative z-10 block aspect-[16/10] w-full overflow-hidden rounded-lg bg-text mb-2.5 cursor-pointer"
                >
                  <img
                    src={evidence.thumbnailUrl}
                    alt={evidence.alt}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 group-hover/thumb:from-black/90 transition-colors" />

                  {/* Play Button Overlay ở trung tâm */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform transition-all duration-200 group-hover/thumb:scale-115 group-hover/thumb:bg-primary backdrop-blur-xs">
                      <Play size={16} className="fill-current translate-x-0.5" />
                    </div>
                  </div>

                  <div className="absolute left-2 top-2">
                    <span
                      className={`inline-flex items-center text-caption font-bold px-1.5 py-0.5 rounded-md border ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}
                    >
                      {spec.shortLabel}
                    </span>
                  </div>

                  <div className="absolute right-2 top-2 bg-black/75 px-1.5 py-0.5 rounded-md text-right text-white">
                    <span className="text-caption font-black">{Math.round(item.contentOpportunityScore)}</span>
                    <span className="text-caption opacity-70 block -mt-0.5">ĐIỂM</span>
                  </div>

                  <div className="absolute left-2 bottom-1.5 text-white/90 text-caption font-bold flex items-center gap-1 group-hover/thumb:text-primary transition-colors">
                    <Play size={10} className="fill-current text-primary" />
                    <span className="truncate max-w-[130px]">{item.topicName}</span>
                  </div>
                </Button>

                {/* Title & Headline */}
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-text text-caption leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {/* Nút chính phủ cả thẻ (after:inset-0); ô xem video nằm trên lớp phủ */}
                    <Button variant="ghost"
                      type="button"
                      onClick={() => onSelectOpportunity?.(item)}
                      className="text-[length:inherit] h-auto justify-start font-[inherit] gap-0 p-0 hover:bg-transparent inline-block text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                    >
                      {headline}
                    </Button>
                  </h3>
                </div>

                {/* Mini Metrics Bar & Chi tiết */}
                <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-caption">
                  <div className="flex items-center gap-2 text-text-muted font-semibold">
                    <span>Nóng: <strong className="text-text">{Math.round(item.trendScore)}</strong></span>
                    <span>Viral: <strong className={theme.accentScore}>{Math.round(item.viralScore)}</strong></span>
                  </div>
                  <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Chi tiết →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal hiển thị và phát video trực tiếp */}
      <VideoPreviewModal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        data={activeVideo}
      />
    </>
  );
}
