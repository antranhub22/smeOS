"use client";

import { Button } from "@/components/ui/button"
import React from "react";
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { AlertTriangle } from "@/components/ui/icon-set/alert-triangle"
import { FlaskConical } from "@/components/ui/icon-set/flask-conical"
import { Lightbulb } from "@/components/ui/icon-set/lightbulb"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
;
import type { ProductImprovement } from "@/modules/market-intelligence/domain/product-intelligence-types";

interface ProductImprovementCardProps {
  improvements: ProductImprovement;
  onCreateVariation?: () => void;
}

export function ProductImprovementCard({
  improvements,
  onCreateVariation,
}: ProductImprovementCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-bg text-warning-text">
            <Lightbulb size={18} />
          </span>
          <div>
            <h3 className="text-body-sm font-bold text-text">4. Khuyến nghị cải tiến sản phẩm</h3>
            <p className="text-caption text-text-muted">
              Định hướng cải tiến thẩm mỹ và bao gói nhằm tối đa hóa tỷ lệ chốt đơn và chia sẻ mạng xã hội
            </p>
          </div>
        </div>

        {onCreateVariation && (
          <Button variant="ghost"
            type="button"
            onClick={onCreateVariation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-bold rounded-lg bg-surface-alt hover:bg-border text-text transition"
          >
            <Sparkles size={13} className="text-primary" />
            Tạo biến thể marketing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cột 1: KEEP (Nên giữ lại) */}
        <div className="rounded-xl border border-success-border bg-success-bg/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-success-text font-bold text-caption">
            <CheckCircle2 size={16} className="text-success" />
            <span>Giữ — Điểm mạnh nên giữ lại</span>
          </div>
          <ul className="space-y-2 text-caption text-success-text font-medium leading-relaxed">
            {improvements.keep.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-success-text font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 2: IMPROVE (Cần cải thiện) */}
        <div className="rounded-xl border border-warning-border bg-warning-bg/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-warning-text font-bold text-caption">
            <AlertTriangle size={16} className="text-warning-text" />
            <span>Cải tiến — Điểm cần khắc phục</span>
          </div>
          <ul className="space-y-2 text-caption text-warning-text font-medium leading-relaxed">
            {improvements.improve.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-warning-text font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: TEST (Nên thử nghiệm) */}
        <div className="rounded-xl border border-accent-border bg-accent-bg/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-accent-text font-bold text-caption">
            <FlaskConical size={16} className="text-accent-text" />
            <span>Thử nghiệm — Biến thể nên thử</span>
          </div>
          <ul className="space-y-2 text-caption text-accent-text font-medium leading-relaxed">
            {improvements.test.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-accent-text font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
