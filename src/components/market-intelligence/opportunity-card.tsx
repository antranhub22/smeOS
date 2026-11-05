"use client";

import { Button } from "@/components/ui/button"
import React from "react";
import { Video } from "@/components/ui/icon-set/video"
import { Play } from "@/components/ui/icon-set/play"
;
import { determineTrendLifecycle, LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";
import { getOpportunityTimeframeMeta } from "@/modules/market-intelligence/domain/trend-timeframe";
import { getOpportunityHeadline } from "./opportunity-illustration";

export interface EvidenceReference {
  title: string;
  type: "ARTICLE" | "TIKTOK_REELS" | "IMAGE_PINTEREST" | "GOOGLE_TRENDS" | "YOUTUBE" | "FACEBOOK";
  url: string;
  platform: string;
  engagementNote?: string;
  thumbnailUrl?: string;
  author?: string;
  metrics?: string;
}

export interface OpportunityItem {
  id: string;
  topicName: string;
  audience: string | null;
  opportunitySummary: string;
  contentAngles: unknown;
  recommendedFormats: unknown;
  recommendedHooks: unknown;
  evidenceReferences?: EvidenceReference[];
  trendScore: number;
  viralScore: number;
  commercialScore: number;
  contentOpportunityScore: number;
  createdAt: string;
}

interface OpportunityCardProps {
  item: OpportunityItem;
  onSelect?: (item: OpportunityItem) => void;
}

export function OpportunityCard({ item, onSelect }: OpportunityCardProps) {
  const references = item.evidenceReferences ?? [];
  const lifecycle = determineTrendLifecycle(item.trendScore, 0.4, 20);
  const spec = LIFECYCLE_SPECS[lifecycle];
  const headline = getOpportunityHeadline(item);
  const timeframeMeta = getOpportunityTimeframeMeta(item.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
      className="group relative rounded-2xl border border-border/90 bg-white p-5 shadow-xs hover:border-primary-border hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      {/* Top Bar: Badges + Điểm cơ hội */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-caption font-bold px-2 py-0.5 rounded-full border shadow-2xs ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {spec.shortLabel}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-caption px-2 py-0.5 rounded-full border shadow-2xs ${timeframeMeta.badgeClass}`}
          >
            {timeframeMeta.label}
          </span>

          {/* K3 Chỉ báo Video Dẫn Chứng Kép Gọn (PO 26/09/2026) */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-muted text-primary border border-primary-border text-caption font-bold shadow-2xs"
            title="Đã đính kèm 2 video dẫn chứng thực tế (TikTok & YouTube). Mở chi tiết để xem đầy đủ."
          >
            <Video className="h-3 w-3 text-primary" />
            <span>2 video dẫn chứng</span>
            <span className="flex items-center gap-1 ml-0.5">
              <span className="text-caption bg-black text-primary px-1 py-0.2 rounded font-black">
                TikTok
              </span>
              <span className="text-caption bg-danger text-white px-1 py-0.2 rounded font-black flex items-center gap-0.5">
                <Play className="h-2 w-2 fill-current" /> YT
              </span>
            </span>
          </div>
        </div>

        {/* Điểm cơ hội */}
        <div className="text-right flex-shrink-0 bg-primary-muted/80 px-2.5 py-1 rounded-xl border border-primary-border shadow-2xs">
          <div className="text-title-sm font-black text-primary leading-none">
            {Math.round(item.contentOpportunityScore)}
          </div>
          <span className="text-caption text-text-muted uppercase font-bold tracking-wider">
            Điểm cơ hội
          </span>
        </div>
      </div>

      {/* Headline cơ hội (Chống tràn từ khóa thô) */}
      <h3 className="font-bold text-text text-body-sm sm:text-body leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {headline}
      </h3>

      {/* 3 Trục Điểm số Xu hướng Tinh gọn */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-bg/80 rounded-xl border border-border text-center text-caption">
        <div>
          <span className="text-text-muted block text-caption font-semibold">Độ nóng</span>
          <span className="font-bold text-text text-caption sm:text-body-sm">
            {Math.round(item.trendScore)}/100
          </span>
        </div>
        <div>
          <span className="text-text-muted block text-caption font-semibold">Lan tỏa</span>
          <span className="font-bold text-primary text-caption sm:text-body-sm">
            {Math.round(item.viralScore)}/100
          </span>
        </div>
        <div>
          <span className="text-text-muted block text-caption font-semibold">Thương mại</span>
          <span className="font-bold text-success-text text-caption sm:text-body-sm">
            {Math.round(item.commercialScore)}/100
          </span>
        </div>
      </div>

      {/* Footer bar: Tệp khách hàng & CTA Khám phá */}
      <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-caption">
        <div className="text-caption text-text-muted truncate max-w-[60%]">
          {item.audience ? (
            <span>
              <strong className="text-text">Khách:</strong> {item.audience}
            </span>
          ) : (
            <span className="italic text-text-muted">{references.length} nguồn dẫn chứng</span>
          )}
        </div>

        <Button variant="ghost"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(item);
          }}
          className="h-auto p-0 inline-flex items-center gap-1 text-caption font-bold text-primary group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        >
          <span>Khám phá kịch bản</span>
          <span>→</span>
        </Button>
      </div>
    </div>
  );
}
