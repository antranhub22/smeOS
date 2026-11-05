"use client";

import { NativeSelect } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import React from "react";
import { FeatureKey } from "./settings-schedule-tab";

export interface SettingsInputTabProps {
  activeFeature: FeatureKey;
  marketInput: {
    geoVN: boolean;
    geoHN: boolean;
    geoSG: boolean;
    sourceGoogle: boolean;
    sourceTikTok: boolean;
    sourceYouTube: boolean;
    sourcePinterest: boolean;
    timeframe: string;
    depth: string;
  };
  setMarketInput: React.Dispatch<
    React.SetStateAction<{
      geoVN: boolean;
      geoHN: boolean;
      geoSG: boolean;
      sourceGoogle: boolean;
      sourceTikTok: boolean;
      sourceYouTube: boolean;
      sourcePinterest: boolean;
      timeframe: string;
      depth: string;
    }>
  >;
  keywordInput: {
    defaultStyle: string;
    channel: string;
    priceTier: string;
  };
  setKeywordInput: React.Dispatch<
    React.SetStateAction<{
      defaultStyle: string;
      channel: string;
      priceTier: string;
    }>
  >;
  productInput: {
    extractFlowers: boolean;
    extractColors: boolean;
    extractPackaging: boolean;
    inferOccasions: boolean;
  };
  setProductInput: React.Dispatch<
    React.SetStateAction<{
      extractFlowers: boolean;
      extractColors: boolean;
      extractPackaging: boolean;
      inferOccasions: boolean;
    }>
  >;
}

export function SettingsInputTab({
  activeFeature,
  marketInput,
  setMarketInput,
  keywordInput,
  setKeywordInput,
  productInput,
  setProductInput,
}: SettingsInputTabProps) {
  return (
    <div className="space-y-3">
      <p className="text-text-muted">Chọn nguồn dữ liệu muốn thu thập:</p>

      {activeFeature === "market" && (
        <div className="grid grid-cols-2 gap-2 bg-bg p-3.5 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketInput.sourceGoogle}
              onCheckedChange={(checked) => setMarketInput({ ...marketInput, sourceGoogle: (checked === true) })}
            />
            Google Search Trends
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketInput.sourceTikTok}
              onCheckedChange={(checked) => setMarketInput({ ...marketInput, sourceTikTok: (checked === true) })}
            />
            TikTok Short Video Trends
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={marketInput.sourcePinterest}
              onCheckedChange={(checked) => setMarketInput({ ...marketInput, sourcePinterest: (checked === true) })}
            />
            Pinterest Visual Trends
          </label>
        </div>
      )}

      {activeFeature === "keyword" && (
        <div className="space-y-2.5 bg-bg p-3.5 rounded-xl border border-border">
          <div className="space-y-1">
            <label className="font-semibold text-text">Phong cách phối hoa mặc định:</label>
            <NativeSelect
              value={keywordInput.defaultStyle}
              onChange={(e) => setKeywordInput({ ...keywordInput, defaultStyle: e.target.value })}
              className="h-8 w-full rounded-lg border border-border bg-white px-2 text-caption"
            >
              <option value="Romantic & Tinh tế">Romantic & Tinh tế (Hàn Quốc / Pháp)</option>
              <option value="Vintage & Cổ điển">Vintage & Cổ điển (Tone cam cháy)</option>
              <option value="Hiện đại & Tối giản">Hiện đại & Tối giản (Minimalist)</option>
            </NativeSelect>
          </div>
        </div>
      )}

      {activeFeature === "product" && (
        <div className="space-y-2 bg-bg p-3.5 rounded-xl border border-border">
          <span className="font-bold text-text block">Các thành phần Vision AI cần bóc tách:</span>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productInput.extractFlowers}
              onCheckedChange={(checked) => setProductInput({ ...productInput, extractFlowers: (checked === true) })}
            />
            Tên hoa, số lượng ước tính & vai trò (Chủ đạo / Phụ trợ / Lá)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productInput.extractColors}
              onCheckedChange={(checked) => setProductInput({ ...productInput, extractColors: (checked === true) })}
            />
            Phối màu sắc (Màu chủ đạo, màu phụ trợ)
          </label>
          <label className="flex items-center gap-2 text-text font-medium cursor-pointer">
            <Checkbox
              checked={productInput.extractPackaging}
              onCheckedChange={(checked) => setProductInput({ ...productInput, extractPackaging: (checked === true) })}
            />
            Chất liệu bao bì & phụ kiện (Giấy gói, ruy băng, nơ)
          </label>
        </div>
      )}
    </div>
  );
}
