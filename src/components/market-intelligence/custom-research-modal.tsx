"use client";

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { NativeSelect } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import React, { useState } from "react";
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Search } from "@/components/ui/icon-set/search"
import { Zap } from "@/components/ui/icon-set/zap"
import { Compass } from "@/components/ui/icon-set/compass"
;
import { ResearchParameterFields } from "./research-parameter-fields";

export interface CustomResearchParams {
  keyword: string;
  geo: string;
  timeframe?: string;
  channel?: string;
  runType: "MANUAL" | "DAILY_DEEP" | "INTRADAY_PULSE" | "WEEKLY_DEEP";
}

interface CustomResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrigger: (params: CustomResearchParams) => Promise<void>;
  isSubmitting: boolean;
}

const QUICK_SUGGESTIONS = [
  "Hoa tulip pastel",
  "Hoa mẫu đơn nhập khẩu",
  "Sản phẩm tốt nghiệp Hàn Quốc",
  "Lan hồ điệp khai trương",
  "Hoa cẩm tú cầu tone xanh",
];

export function CustomResearchModal({
  isOpen,
  onClose,
  onTrigger,
  isSubmitting,
}: CustomResearchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [geo, setGeo] = useState("VN");
  const [timeframe, setTimeframe] = useState("now 7-d");
  const [channel, setChannel] = useState("web");
  const [runType, setRunType] = useState<CustomResearchParams["runType"]>("MANUAL");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTrigger({
      keyword: keyword.trim() || "sản phẩm xu hướng",
      geo,
      timeframe,
      channel,
      runType,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }} size="md"
      title={<span className="flex items-center gap-2"><Compass size={18} strokeWidth={2.2} className="text-primary" />Thiết lập nghiên cứu</span>}
      description="Chọn từ khóa, khu vực và kênh muốn quét">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Keyword Input */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-text flex items-center gap-1.5">
              <Search size={14} className="text-primary" />
              Chủ đề / Từ khóa hoa cần nghiên cứu
            </label>
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="VD: Hoa tulip pastel, Sản phẩm tốt nghiệp, Lan hồ điệp..."
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-caption text-text outline-none focus:border-primary transition"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-caption text-text-muted self-center">Gợi ý nhanh:</span>
              {QUICK_SUGGESTIONS.map((sug) => (
                <Button variant="ghost"
                  key={sug}
                  type="button"
                  onClick={() => setKeyword(sug)}
                  className="gap-0 rounded-full bg-surface-alt px-2.5 py-0.5 text-caption font-medium text-text-muted hover:bg-primary-muted hover:text-primary transition"
                >
                  + {sug}
                </Button>
              ))}
            </div>
          </div>

          {/* Khu vực, khung thời gian, kênh — nguồn dùng chung với Quét nhanh */}
          <div className="grid grid-cols-2 gap-3">
            <ResearchParameterFields
              geo={geo}
              onGeoChange={setGeo}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              channel={channel}
              onChannelChange={setChannel}
              selectClassName="h-10 w-full rounded-xl border border-border bg-surface px-3 text-caption text-text outline-none focus:border-primary transition"
            />

            <div className="space-y-1.5">
              <label className="text-caption font-bold text-text flex items-center gap-1.5">
                <Zap size={14} className="text-primary" />
                Chế độ phân tích
              </label>
              <NativeSelect
                value={runType}
                onChange={(e) => setRunType(e.target.value as CustomResearchParams["runType"])}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-caption text-text outline-none focus:border-primary transition"
              >
                <option value="MANUAL">Quét nhanh theo yêu cầu</option>
                <option value="INTRADAY_PULSE">Bắt sóng trong ngày (Pulse)</option>
                <option value="DAILY_DEEP">Nghiên cứu sâu (Deep Research)</option>
                <option value="WEEKLY_DEEP">Tổng hợp tuần (Weekly)</option>
              </NativeSelect>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="gap-0 rounded-xl border border-border px-4 py-2 text-caption font-semibold text-text hover:bg-surface-alt transition"
            >
              Hủy
            </Button>
            <Button variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-caption font-bold text-white hover:bg-primary/90 shadow-sm transition disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isSubmitting ? "Đang nạp vào hàng đợi AI..." : "Bắt đầu nghiên cứu"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
