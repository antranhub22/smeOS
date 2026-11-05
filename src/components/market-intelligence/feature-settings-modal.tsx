"use client";

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import React, { useState } from "react";
import { Clock } from "@/components/ui/icon-set/clock"
import { FileInput } from "@/components/ui/icon-set/file-input"
import { FileOutput } from "@/components/ui/icon-set/file-output"
import { Save } from "@/components/ui/icon-set/save"
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { TrendingUp } from "@/components/ui/icon-set/trending-up"
import { Search } from "@/components/ui/icon-set/search"
import { Camera } from "@/components/ui/icon-set/camera"
;
import {
  FeatureKey,
  SettingsScheduleTab,
} from "./settings/settings-schedule-tab";
import { SettingsInputTab } from "./settings/settings-input-tab";
import { SettingsOutputTab } from "./settings/settings-output-tab";

export type { FeatureKey };

interface FeatureSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeature: FeatureKey;
}

export function FeatureSettingsModal({
  isOpen,
  onClose,
  activeFeature,
}: FeatureSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"schedule" | "input" | "output">("schedule");
  const [isSaved, setIsSaved] = useState(false);

  // Settings for Market Trends
  const [marketSchedule, setMarketSchedule] = useState({
    enabled: true,
    time: "06:00",
    notifyCopilot: true,
    notifyEmail: false,
  });
  const [marketInput, setMarketInput] = useState({
    geoVN: true,
    geoHN: true,
    geoSG: true,
    sourceGoogle: true,
    sourceTikTok: true,
    sourceYouTube: true,
    sourcePinterest: true,
    timeframe: "now 7-d",
    depth: "DEEP",
  });
  const [marketOutput, setMarketOutput] = useState({
    executiveSummary: true,
    trendLifecycle: true,
    threeScores: true,
    recommendedHooks: true,
    evidenceReferences: true,
  });

  // Settings for Keyword Advisory
  const [keywordSchedule, setKeywordSchedule] = useState({
    enabled: true,
    time: "06:30",
    trackedKeywords: ["Hoa tulip pastel", "Sản phẩm tốt nghiệp Hàn Quốc", "Lan hồ điệp khai trương"],
  });
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [keywordInput, setKeywordInput] = useState({
    defaultStyle: "Romantic & Tinh tế",
    channel: "omnichannel",
    priceTier: "MID_TIER",
  });
  const [keywordOutput, setKeywordOutput] = useState({
    commercialAdvice: true,
    audiencePersona: true,
    hooks: true,
    complementaryPairings: true,
    recommendedFormats: true,
  });

  // Settings for Product Intelligence
  const [productMatching, setProductMatching] = useState({
    fitThreshold: 70,
    autoMatchWeeklyTrends: true,
  });
  const [productInput, setProductInput] = useState({
    extractFlowers: true,
    extractColors: true,
    extractPackaging: true,
    inferOccasions: true,
  });
  const [productOutput, setProductOutput] = useState({
    matrixScores: true,
    threeZonesKeepImproveTest: true,
    topicsCount: 10,
    exportVideoStudio: true,
    exportMediaStudio: true,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }} size="lg"
      title={<span className="flex items-center gap-2">Cài đặt <span className="text-caption font-extrabold px-2.5 py-0.5 rounded-full bg-primary-muted text-primary">{activeFeature === "market" ? "Xu Hướng Thị Trường" : activeFeature === "keyword" ? "Quét Theo Từ Khóa" : "Quét Theo Ảnh Mẫu"}</span></span>}
      description="Lịch chạy và dữ liệu cho tính năng này">
      <div className="-m-5 sm:-m-6 flex flex-col">
        {/* 3 Tab Navigation */}
        <div className="flex border-b border-border px-6 bg-white gap-6 text-caption font-bold pt-2">
          <Button variant="ghost"
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`h-auto p-0 pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "schedule"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Clock size={14} />
            Lịch quét
          </Button>
          <Button variant="ghost"
            type="button"
            onClick={() => setActiveTab("input")}
            className={`h-auto p-0 pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "input"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <FileInput size={14} />
            Dữ liệu đầu vào
          </Button>
          <Button variant="ghost"
            type="button"
            onClick={() => setActiveTab("output")}
            className={`h-auto p-0 pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "output"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <FileOutput size={14} />
            Dữ liệu đầu ra
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-caption space-y-4">
          {activeTab === "schedule" && (
            <SettingsScheduleTab
              activeFeature={activeFeature}
              marketSchedule={marketSchedule}
              setMarketSchedule={setMarketSchedule}
              keywordSchedule={keywordSchedule}
              setKeywordSchedule={setKeywordSchedule}
              newKeywordInput={newKeywordInput}
              setNewKeywordInput={setNewKeywordInput}
              productMatching={productMatching}
              setProductMatching={setProductMatching}
            />
          )}

          {activeTab === "input" && (
            <SettingsInputTab
              activeFeature={activeFeature}
              marketInput={marketInput}
              setMarketInput={setMarketInput}
              keywordInput={keywordInput}
              setKeywordInput={setKeywordInput}
              productInput={productInput}
              setProductInput={setProductInput}
            />
          )}

          {activeTab === "output" && (
            <SettingsOutputTab
              activeFeature={activeFeature}
              marketOutput={marketOutput}
              setMarketOutput={setMarketOutput}
              keywordOutput={keywordOutput}
              setKeywordOutput={setKeywordOutput}
              productOutput={productOutput}
              setProductOutput={setProductOutput}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-bg/70">
          <span className="text-caption text-text-muted font-medium">
            Cấu hình chỉ áp dụng cho cửa hàng của bạn
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline"
              type="button"
              onClick={onClose}
              className="gap-0 px-3.5 py-1.5 rounded-lg border border-border text-text-muted font-bold hover:bg-white transition text-caption"
            >
              Đóng
            </Button>
            <Button variant="primary"
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition text-caption shadow-sm"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={13} className="text-white" />
                  Đã Lưu Cài Đặt!
                </>
              ) : (
                <>
                  <Save size={13} />
                  Lưu Thiết Lập
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
