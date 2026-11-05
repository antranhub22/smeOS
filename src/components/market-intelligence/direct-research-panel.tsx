"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useState } from "react";
import { Search } from "@/components/ui/icon-set/search"
import { Zap } from "@/components/ui/icon-set/zap"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { SlidersHorizontal } from "@/components/ui/icon-set/sliders-horizontal"
import { ChevronDown } from "@/components/ui/icon-set/chevron-down"
import { Layers } from "@/components/ui/icon-set/layers"
;
import type { CustomResearchParams } from "./custom-research-modal";
import { ResearchParameterFields } from "./research-parameter-fields";
import {
  MARKET_TAXONOMY_CATEGORIES,
  getSeasonalRecommendedKeywords,
} from "@/modules/market-intelligence/domain/market-taxonomy";

interface DirectResearchPanelProps {
  onTriggerRun: (params: CustomResearchParams) => Promise<void>;
  isSubmitting: boolean;
}

export function DirectResearchPanel({
  onTriggerRun,
  isSubmitting,
}: DirectResearchPanelProps) {
  const [keyword, setKeyword] = useState("");
  const [geo, setGeo] = useState("VN");
  const [timeframe, setTimeframe] = useState("now 7-d");
  const [channel, setChannel] = useState("omnichannel");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("seasonal");

  const seasonalKeywords = getSeasonalRecommendedKeywords();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim() || "Sản phẩm xu hướng";
    await onTriggerRun({
      keyword: query,
      geo,
      timeframe,
      channel,
      runType: "MANUAL",
    });
  };

  // Lấy danh sách từ khóa gợi ý theo tab danh mục
  const currentSuggestions = activeCategoryTab === "seasonal"
    ? seasonalKeywords
    : MARKET_TAXONOMY_CATEGORIES.find((c) => c.id === activeCategoryTab)?.keywords.slice(0, 8) ?? seasonalKeywords;

  return (
    <div className="rounded-2xl border border-border/90 bg-white p-4 sm:p-5 shadow-xs transition-all space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <Search size={15} />
          </div>
          <div>
            <h2 className="text-caption sm:text-body-sm font-bold text-text">
              Quét nhanh theo từ khóa thị trường
            </h2>
            <p className="text-caption text-text-muted">
              Tra cứu trực tiếp chỉ số Google Trends, video viral TikTok và tiềm năng chốt đơn
            </p>
          </div>
        </div>

        <Button variant="outline"
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-auto inline-flex items-center gap-1.5 text-caption font-semibold text-text-muted hover:text-primary bg-bg hover:bg-primary-muted/60 px-2.5 py-1 rounded-lg border border-border/70 transition"
        >
          <SlidersHorizontal size={12} className={showAdvanced ? "text-primary" : "text-text-muted"} />
          <span>{showAdvanced ? "Ẩn tùy chỉnh" : "Tùy chỉnh"}</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvanced ? "rotate-180 text-primary" : ""}`} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Thanh tìm kiếm chính 1 dòng */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập từ khóa hoặc chọn từ 210 từ khóa chuẩn (VD: Sản phẩm tốt nghiệp hướng dương, Hoa 20/10...)"
              className="h-10 w-full rounded-xl border border-border bg-bg/60 pl-9 pr-3 text-caption text-text placeholder:text-text-muted outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-border transition"
            />
          </div>

          <Button variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="py-0 w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 h-10 text-caption font-bold text-white hover:bg-primary-dark shadow-xs hover:shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                Đang quét...
              </>
            ) : (
              <>
                <Zap size={14} />
                Quét Xu Hướng
              </>
            )}
          </Button>
        </div>

        {/* Category switcher for quick suggestions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-caption text-text-muted font-medium flex-shrink-0 flex items-center gap-1">
              <Layers size={11} /> Nhóm từ khóa:
            </span>
            <Button variant="ghost"
              type="button"
              onClick={() => setActiveCategoryTab("seasonal")}
              className={`h-auto gap-0 flex-shrink-0 text-caption px-2 py-0.5 rounded-md font-semibold transition ${
                activeCategoryTab === "seasonal"
                  ? "bg-primary text-white shadow-2xs hover:bg-primary"
                  : "bg-surface-alt text-text-muted hover:bg-border"
              }`}
            >
              Mùa thu này
            </Button>
            {MARKET_TAXONOMY_CATEGORIES.slice(0, 5).map((cat) => (
              <Button variant="ghost"
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`h-auto gap-0 flex-shrink-0 text-caption px-2 py-0.5 rounded-md font-medium transition ${
                  activeCategoryTab === cat.id
                    ? "bg-primary text-white shadow-2xs hover:bg-primary"
                    : "bg-surface-alt text-text-muted hover:bg-border"
                }`}
              >
                {cat.shortName}
              </Button>
            ))}
          </div>

          {/* Quick suggestions chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {currentSuggestions.map((sug) => (
              <Button variant="outline"
                key={sug}
                type="button"
                onClick={() => setKeyword(sug)}
                className={`h-auto gap-0 rounded-full px-2.5 py-0.5 text-caption font-medium border transition ${
                  keyword === sug
                    ? "bg-primary-muted text-primary border-primary-border font-semibold hover:bg-primary-muted"
                    : "bg-bg text-text-muted hover:bg-primary-muted hover:text-primary hover:border-primary-border border-border/80"
                }`}
              >
                + {sug}
              </Button>
            ))}
          </div>
        </div>

        {/* Khu vực tham số tùy chỉnh nâng cao (toggle mở rộng) */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-border">
            <ResearchParameterFields
              geo={geo}
              timeframe={timeframe}
              channel={channel}
              onGeoChange={setGeo}
              onTimeframeChange={setTimeframe}
              onChannelChange={setChannel}
            />
          </div>
        )}
      </form>
    </div>
  );
}
