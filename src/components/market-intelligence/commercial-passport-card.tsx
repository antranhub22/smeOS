"use client";

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import React from "react";
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Tag } from "@/components/ui/icon-set/tag"
import { Gift } from "@/components/ui/icon-set/gift"
import { Users } from "@/components/ui/icon-set/users"
import { BookOpen } from "@/components/ui/icon-set/book-open"
import { CheckCircle } from "@/components/ui/icon-set/check-circle"
import { DollarSign } from "@/components/ui/icon-set/dollar-sign"
import { PackagePlus } from "@/components/ui/icon-set/package-plus"
;
import type { CommercialPassport } from "@/modules/market-intelligence/domain/product-intelligence-types";

interface CommercialPassportCardProps {
  passport: CommercialPassport;
  onChange?: (updated: CommercialPassport) => void;
  readOnly?: boolean;
}

export function CommercialPassportCard({
  passport,
  onChange,
  readOnly = false,
}: CommercialPassportCardProps) {
  const handleUpdate = <K extends keyof CommercialPassport>(field: K, value: CommercialPassport[K]) => {
    if (onChange && !readOnly) {
      onChange({
        ...passport,
        [field]: value,
      });
    }
  };

  return (
    <div className="rounded-xl border border-primary-border bg-white p-4 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-primary-border pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <Sparkles size={15} />
          </span>
          <div>
            <h3 className="text-caption font-bold text-text flex items-center gap-1.5">
              Hồ Sơ Thương Mại Sinh dữ liệu bán hàng (Commercial Passport)
              <span className="px-1.5 py-0.5 rounded-md bg-primary-muted text-primary text-caption font-bold border border-primary-border">
                AI Commercial Ready
              </span>
            </h3>
            <p className="text-caption text-text-muted">
              Định vị thương mại, câu chuyện cảm xúc và điểm chốt sale từ phân tích hoa
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-caption">
        {/* Slogan & Tagline */}
        <div className="space-y-1">
          <label className="text-caption font-semibold text-text-muted flex items-center gap-1">
            <Tag size={12} className="text-primary" />
            Slogan / Tagline 1-chạm:
          </label>
          {readOnly ? (
            <div className="p-2 rounded-lg bg-bg border border-border font-semibold text-text">
              {passport.shortHeadline}
            </div>
          ) : (
            <Input
              type="text"
              value={passport.shortHeadline}
              onChange={(e) => handleUpdate("shortHeadline", e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-bg/50 px-2.5 text-caption font-semibold text-text outline-none focus:border-primary"
            />
          )}
        </div>

        {/* Chân dung khách hàng */}
        <div className="space-y-1">
          <label className="text-caption font-semibold text-text-muted flex items-center gap-1">
            <Users size={12} className="text-primary" />
            Khách hàng mục tiêu:
          </label>
          <div className="p-2 rounded-lg bg-bg border border-border text-text flex flex-col gap-0.5">
            <div>
              <span className="font-bold text-text">Người nhận:</span> {passport.targetAudience?.recipient || "Bạn gái / Người yêu"}
            </div>
            <div>
              <span className="font-bold text-text">Người mua:</span> {passport.targetAudience?.buyerPersona || "Nam giới 22–35 tuổi"}
            </div>
          </div>
        </div>
      </div>

      {/* Câu chuyện ý nghĩa loài hoa */}
      <div className="space-y-1 text-caption">
        <label className="text-caption font-semibold text-text-muted flex items-center gap-1">
          <BookOpen size={12} className="text-primary" />
          Ý nghĩa & Câu chuyện truyền cảm hứng (Storytelling):
        </label>
        {readOnly ? (
          <p className="p-2.5 rounded-lg bg-primary-muted/40 border border-primary-border text-text leading-relaxed italic">
            &quot;{passport.flowerMeaningStory}&quot;
          </p>
        ) : (
          <Textarea
            rows={2}
            value={passport.flowerMeaningStory}
            onChange={(e) => handleUpdate("flowerMeaningStory", e.target.value)}
            className="w-full rounded-lg border border-border bg-bg/50 p-2 text-caption text-text outline-none focus:border-primary"
          />
        )}
      </div>

      {/* Điểm bán hàng chính (USP) */}
      <div className="space-y-1.5 text-caption">
        <label className="text-caption font-semibold text-text-muted flex items-center gap-1">
          <CheckCircle size={12} className="text-success-text" />
          Điểm bán hàng nổi bật (Key Selling Points):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(passport.keySellingPoints || []).map((usp, idx) => (
            <div key={idx} className="flex items-start gap-1.5 p-2 rounded-lg bg-bg border border-border text-caption text-text">
              <span className="text-success-text font-bold">✓</span>
              <span>{usp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dải giá & Sản phẩm mua kèm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption pt-1 border-t border-border">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-bg border border-border">
          <DollarSign size={16} className="text-warning-text shrink-0" />
          <div>
            <div className="text-caption text-text-muted font-semibold">Dải giá đề xuất (Min - Chuẩn - Max):</div>
            <div className="font-extrabold text-text text-caption">
              {(passport.priceRange?.minPrice || 0).toLocaleString("vi-VN")}đ —{" "}
              <span className="text-primary font-black">{(passport.priceRange?.targetPrice || 0).toLocaleString("vi-VN")}đ</span> —{" "}
              {(passport.priceRange?.maxPrice || 0).toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-bg border border-border">
          <PackagePlus size={16} className="text-accent-text shrink-0" />
          <div>
            <div className="text-caption text-text-muted font-semibold">Gợi ý bán kèm (Cross-sell):</div>
            <div className="text-caption text-text font-medium truncate">
              {(passport.recommendedUpsells || []).join(", ") || "Thiệp viết tay, Bình hoa cao cấp"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
