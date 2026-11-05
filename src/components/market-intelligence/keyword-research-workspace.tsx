"use client";

import { Button } from "@/components/ui/button"
import React, { useState, useMemo } from "react";
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Activity } from "@/components/ui/icon-set/activity"
import { Target } from "@/components/ui/icon-set/target"
import { Clock } from "@/components/ui/icon-set/clock"
import { RefreshCw } from "@/components/ui/icon-set/refresh-cw"
;
import { DirectResearchPanel } from "./direct-research-panel";
import { ResearchStatusBanner, type ResearchStatusInfo } from "./research-status-banner";
import { OpportunityCard, type OpportunityItem } from "./opportunity-card";
import { OpportunityDetailDrawer } from "./opportunity-detail-drawer";
import { ResearchRunsTable, type RunItem } from "./research-runs-table";
import { TimeframeDistributionBar } from "./timeframe-distribution-bar";
import { TopChampionsBlock } from "./top-champions-block";
import {
  type MarketTimeframeKey,
  type PeriodBucket,
  computeTimeframeDistribution,
  filterByTimeframe,
  filterByPeriodBucket,
  TIMEFRAME_CONFIGS,
} from "@/modules/market-intelligence/domain/trend-timeframe";
import type { CustomResearchParams } from "./custom-research-modal";

interface KeywordResearchWorkspaceProps {
  opportunities: OpportunityItem[];
  runs: RunItem[];
  onTriggerRun: (params: CustomResearchParams) => Promise<void>;
  isTriggering: boolean;
  researchStatus: ResearchStatusInfo;
  onDismissResearchStatus: () => void;
}

export function KeywordResearchWorkspace({
  opportunities,
  runs,
  onTriggerRun,
  isTriggering,
  researchStatus,
  onDismissResearchStatus,
}: KeywordResearchWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"results" | "runs">("results");
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<MarketTimeframeKey>("ALL");
  const [selectedBucket, setSelectedBucket] = useState<PeriodBucket | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "IMPORTANT" | "RISING">("ALL");

  // 1. Phân bổ cơ hội theo Ngày / Tuần / Tháng / 3 Tháng
  const distribution = useMemo(
    () => computeTimeframeDistribution(opportunities),
    [opportunities]
  );

  // 2. Lọc theo mốc thời gian 2 tầng (chọn cụ thể ngày/tuần/tháng hoặc Scope)
  const filteredByTime = useMemo(() => {
    if (selectedBucket) {
      return filterByPeriodBucket(opportunities, selectedBucket);
    }
    return filterByTimeframe(opportunities, selectedTimeframe);
  }, [opportunities, selectedBucket, selectedTimeframe]);

  // 3. Lọc tiếp theo tiêu chí điểm số / xu hướng
  const filtered = filteredByTime.filter((item) => {
    if (activeFilter === "IMPORTANT") return item.contentOpportunityScore >= 75;
    if (activeFilter === "RISING") return item.viralScore >= 65 || item.trendScore >= 65;
    return true;
  });

  const currentFilterLabel = selectedBucket
    ? selectedBucket.label
    : TIMEFRAME_CONFIGS[selectedTimeframe].label;

  return (
    <div className="space-y-6">
      {/* 1. Bảng điều khiển Quét Từ Khóa Trực Tiếp */}
      <DirectResearchPanel
        onTriggerRun={onTriggerRun}
        isSubmitting={isTriggering}
      />

      {/* 2. Banner trạng thái nghiên cứu thời gian thực */}
      <ResearchStatusBanner
        status={researchStatus}
        onViewResults={() => {
          setActiveSubTab("results");
          const el = document.getElementById("keyword-results-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onDismiss={onDismissResearchStatus}
      />

      {/* 3. Bảng Vàng Xu Hướng: Quán Quân Top 1 của Tuần - Tháng - 3 Tháng - 6 Tháng - 1 Năm */}
      <TopChampionsBlock
        opportunities={opportunities}
        onSelectOpportunity={setSelectedOpportunity}
      />

      {/* 4. Bộ lọc 2 tầng: Chọn Ngày/Tuần/Tháng/3 Tháng & Mốc cụ thể */}
      <TimeframeDistributionBar
        activeTimeframe={selectedTimeframe}
        onSelectTimeframe={(key) => {
          setSelectedTimeframe(key);
          setSelectedBucket(null);
        }}
        selectedBucket={selectedBucket}
        onSelectBucket={setSelectedBucket}
        distribution={distribution}
        items={opportunities}
      />

      {/* 4. Sub Tabs & Filter Bar */}
      <div id="keyword-results-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex gap-4 text-caption font-bold">
          <Button variant="ghost"
            type="button"
            onClick={() => setActiveSubTab("results")}
            className={`text-[length:inherit] h-auto p-0 pb-2 flex items-center gap-1.5 border-b-2 transition ${
              activeSubTab === "results"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Sparkles size={14} />
            Cơ hội ({filtered.length})
          </Button>
          <Button variant="ghost"
            type="button"
            onClick={() => setActiveSubTab("runs")}
            className={`text-[length:inherit] h-auto p-0 pb-2 flex items-center gap-1.5 border-b-2 transition ${
              activeSubTab === "runs"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Activity size={14} />
            Lịch sử quét ({runs.length})
          </Button>
        </div>

        {activeSubTab === "results" && (
          <div className="flex items-center gap-1.5 text-caption font-bold">
            <span className="text-text-muted">Lọc nhanh:</span>
            <Button variant="ghost"
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`text-[length:inherit] h-auto font-[inherit] gap-0 px-2.5 py-0.5 rounded-full transition ${
                activeFilter === "ALL"
                  ? "bg-primary text-white hover:bg-primary"
                  : "bg-surface-alt text-text-muted hover:bg-border"
              }`}
            >
              Tất cả ({filteredByTime.length})
            </Button>
            <Button variant="ghost"
              type="button"
              onClick={() => setActiveFilter("IMPORTANT")}
              className={`text-[length:inherit] h-auto font-[inherit] gap-0 px-2.5 py-0.5 rounded-full transition ${
                activeFilter === "IMPORTANT"
                  ? "bg-primary text-white hover:bg-primary"
                  : "bg-surface-alt text-text-muted hover:bg-border"
              }`}
            >
              🔥 Điểm &gt; 75
            </Button>
            <Button variant="ghost"
              type="button"
              onClick={() => setActiveFilter("RISING")}
              className={`text-[length:inherit] h-auto font-[inherit] gap-0 px-2.5 py-0.5 rounded-full transition ${
                activeFilter === "RISING"
                  ? "bg-primary text-white hover:bg-primary"
                  : "bg-surface-alt text-text-muted hover:bg-border"
              }`}
            >
              📈 Xu hướng bứt phá
            </Button>
          </div>
        )}
      </div>

      {/* 5. Tab Content */}
      {activeSubTab === "results" ? (
        filtered.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-bg/50 space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-alt text-text-muted">
              <Clock size={20} />
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-text text-body-sm font-bold">
                Chưa có kết quả quét trong &ldquo;{currentFilterLabel}&rdquo;
              </p>
              <p className="text-text-muted text-caption mt-1">
                {selectedBucket || selectedTimeframe !== "ALL"
                  ? "Hãy chọn mốc ngày/tuần khác hoặc chọn 'Tất cả' để xem toàn bộ kết quả đã quét."
                  : "Hãy nhập từ khóa hoa ở khung trên và nhấn 'Quét Xu Hướng'."}
              </p>
            </div>
            {(selectedBucket || selectedTimeframe !== "ALL") && (
              <Button variant="primary"
                type="button"
                onClick={() => {
                  setSelectedTimeframe("ALL");
                  setSelectedBucket(null);
                }}
                className="h-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold bg-primary text-white hover:bg-primary-dark shadow-xs transition"
              >
                <RefreshCw size={13} />
                Xem tất cả ({opportunities.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <OpportunityCard
                key={item.id}
                item={item}
                onSelect={setSelectedOpportunity}
              />
            ))}
          </div>
        )
      ) : (
        <ResearchRunsTable runs={runs} />
      )}

      {/* Slide-over Drawer kể câu chuyện chuyên sâu (Micro Story) */}
      <OpportunityDetailDrawer
        item={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
}
