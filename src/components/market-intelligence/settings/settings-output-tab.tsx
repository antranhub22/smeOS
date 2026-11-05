"use client";

import { Checkbox } from "@/components/ui/checkbox"
import React from "react";
import { FeatureKey } from "./settings-schedule-tab";

export interface SettingsOutputTabProps {
  activeFeature: FeatureKey;
  marketOutput: {
    executiveSummary: boolean;
    trendLifecycle: boolean;
    threeScores: boolean;
    recommendedHooks: boolean;
    evidenceReferences: boolean;
  };
  setMarketOutput: React.Dispatch<
    React.SetStateAction<{
      executiveSummary: boolean;
      trendLifecycle: boolean;
      threeScores: boolean;
      recommendedHooks: boolean;
      evidenceReferences: boolean;
    }>
  >;
  keywordOutput: {
    commercialAdvice: boolean;
    audiencePersona: boolean;
    hooks: boolean;
    complementaryPairings: boolean;
    recommendedFormats: boolean;
  };
  setKeywordOutput: React.Dispatch<
    React.SetStateAction<{
      commercialAdvice: boolean;
      audiencePersona: boolean;
      hooks: boolean;
      complementaryPairings: boolean;
      recommendedFormats: boolean;
    }>
  >;
  productOutput: {
    matrixScores: boolean;
    threeZonesKeepImproveTest: boolean;
    topicsCount: number;
    exportVideoStudio: boolean;
    exportMediaStudio: boolean;
  };
  setProductOutput: React.Dispatch<
    React.SetStateAction<{
      matrixScores: boolean;
      threeZonesKeepImproveTest: boolean;
      topicsCount: number;
      exportVideoStudio: boolean;
      exportMediaStudio: boolean;
    }>
  >;
}

export function SettingsOutputTab({
  activeFeature,
  marketOutput,
  setMarketOutput,
  keywordOutput,
  setKeywordOutput,
  productOutput,
  setProductOutput,
}: SettingsOutputTabProps) {
  return (
    <div className="space-y-3">
      <p className="text-text-muted">Chọn nội dung muốn hiển thị trong báo cáo:</p>

      {activeFeature === "market" && (
        <div className="space-y-2 bg-bg p-3.5 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketOutput.executiveSummary}
              onCheckedChange={(checked) => setMarketOutput({ ...marketOutput, executiveSummary: (checked === true) })}
            />
            Tóm tắt điều hành (Executive Summary)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketOutput.trendLifecycle}
              onCheckedChange={(checked) => setMarketOutput({ ...marketOutput, trendLifecycle: (checked === true) })}
            />
            Nhãn vòng đời xu hướng (Rising, Peaking, Maturing)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketOutput.threeScores}
              onCheckedChange={(checked) => setMarketOutput({ ...marketOutput, threeScores: (checked === true) })}
            />
            3 Trục điểm số (Độ nóng, Lan tỏa, Thương mại)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketOutput.recommendedHooks}
              onCheckedChange={(checked) => setMarketOutput({ ...marketOutput, recommendedHooks: (checked === true) })}
            />
            Gợi ý câu mở đầu giật tít (Hook)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketOutput.evidenceReferences}
              onCheckedChange={(checked) => setMarketOutput({ ...marketOutput, evidenceReferences: (checked === true) })}
            />
            Dẫn chứng kèm link nguồn (5 nguồn)
          </label>
        </div>
      )}

      {activeFeature === "keyword" && (
        <div className="space-y-2 bg-bg p-3.5 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={keywordOutput.commercialAdvice}
              onCheckedChange={(checked) => setKeywordOutput({ ...keywordOutput, commercialAdvice: (checked === true) })}
            />
            Lời khuyên thương mại và định vị sản phẩm
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={keywordOutput.audiencePersona}
              onCheckedChange={(checked) => setKeywordOutput({ ...keywordOutput, audiencePersona: (checked === true) })}
            />
            Tệp khách hàng mục tiêu & tâm lý mua
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={keywordOutput.hooks}
              onCheckedChange={(checked) => setKeywordOutput({ ...keywordOutput, hooks: (checked === true) })}
            />
            Hook tiêu đề video / bài đăng
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={keywordOutput.recommendedFormats}
              onCheckedChange={(checked) => setKeywordOutput({ ...keywordOutput, recommendedFormats: (checked === true) })}
            />
            Gợi ý định dạng sản phẩm (Bó, Giỏ, Kệ, Bình)
          </label>
        </div>
      )}

      {activeFeature === "product" && (
        <div className="space-y-2 bg-bg p-3.5 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productOutput.matrixScores}
              onCheckedChange={(checked) => setProductOutput({ ...productOutput, matrixScores: (checked === true) })}
            />
            Ma trận đối soát Trend Fit 3 chiều
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productOutput.threeZonesKeepImproveTest}
              onCheckedChange={(checked) => setProductOutput({ ...productOutput, threeZonesKeepImproveTest: (checked === true) })}
            />
            Khuyến nghị cải tiến 3 vùng (GIỮ hoa / CẢI TIẾN giấy gói / THỬ NGHIỆM)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productOutput.exportVideoStudio}
              onCheckedChange={(checked) => setProductOutput({ ...productOutput, exportVideoStudio: (checked === true) })}
            />
            Tạo sẵn kịch bản xuất sang Video Studio
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productOutput.exportMediaStudio}
              onCheckedChange={(checked) => setProductOutput({ ...productOutput, exportMediaStudio: (checked === true) })}
            />
            Tạo sẵn biến thể xuất sang Media Studio
          </label>
        </div>
      )}
    </div>
  );
}
