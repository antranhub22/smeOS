"use client";

import React from "react";
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { AlertTriangle } from "@/components/ui/icon-set/alert-triangle"
import { XCircle } from "@/components/ui/icon-set/x-circle"
import { TrendingUp } from "@/components/ui/icon-set/trending-up"
import { BarChart3 } from "@/components/ui/icon-set/bar-chart3"
;
import type { ProductTrendFitItem } from "@/modules/market-intelligence/domain/product-intelligence-types";
import { LIFECYCLE_SPECS } from "@/modules/market-intelligence/domain/trend-lifecycle";

interface ProductTrendFitMatrixProps {
  matrix: ProductTrendFitItem[];
  trendFitScore: number;
  audienceFitScore: number;
  contentFitScore: number;
  overallFit: "HIGH" | "MEDIUM" | "LOW";
}

export function ProductTrendFitMatrix({
  matrix,
  trendFitScore,
  audienceFitScore,
  contentFitScore,
  overallFit,
}: ProductTrendFitMatrixProps) {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm space-y-4 p-5">
      {/* Header Điểm số Tổng quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <BarChart3 size={18} />
          </span>
          <div>
            <h3 className="text-body-sm font-bold text-text">3. Ma trận đối soát thị trường</h3>
            <p className="text-caption text-text-muted">
              So khớp thuộc tính sản phẩm với nhu cầu thực tế đang thịnh hành trên Google, TikTok &amp; YouTube
            </p>
          </div>
        </div>

        {/* 3 Trục Điểm số */}
        <div className="flex items-center gap-2 text-caption">
          <div className="bg-primary-muted border border-primary-border px-3 py-1.5 rounded-xl text-center">
            <span className="text-caption text-text-muted block font-medium">Khớp xu hướng</span>
            <span className="text-body-sm font-black text-primary">{trendFitScore}/100</span>
          </div>
          <div className="bg-accent-bg border border-accent-border px-3 py-1.5 rounded-xl text-center">
            <span className="text-caption text-text-muted block font-medium">Khớp khách hàng</span>
            <span className="text-body-sm font-black text-accent-text">{audienceFitScore}/100</span>
          </div>
          <div className="bg-success-bg border border-success-border px-3 py-1.5 rounded-xl text-center">
            <span className="text-caption text-text-muted block font-medium">Khớp nội dung</span>
            <span className="text-body-sm font-black text-success-text">{contentFitScore}/100</span>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết đối soát từng thuộc tính */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-caption text-left">
          <thead className="bg-bg/80 text-text-muted font-semibold">
            <tr>
              <th className="px-3.5 py-2.5">Thuộc tính sản phẩm</th>
              <th className="px-3.5 py-2.5">Giá trị của sản phẩm</th>
              <th className="px-3.5 py-2.5">Tín hiệu nhu cầu thị trường</th>
              <th className="px-3.5 py-2.5">Vòng đời</th>
              <th className="px-3.5 py-2.5 text-center">Mức độ khớp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matrix.map((item, idx) => {
              const spec = LIFECYCLE_SPECS[item.lifecycle];
              return (
                <tr key={idx} className="hover:bg-bg/50">
                  <td className="px-3.5 py-3 font-semibold text-text">{item.attribute}</td>
                  <td className="px-3.5 py-3 text-text-muted font-medium">{item.productValue}</td>
                  <td className="px-3.5 py-3 text-text-muted">
                    <div>{item.marketSignal}</div>
                    <div className="text-caption text-text-muted italic mt-0.5">{item.note}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-caption font-bold border ${spec.bgClass} ${spec.colorClass} ${spec.borderClass}`}>
                      {spec.shortLabel}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    {item.matchStatus === "MATCH" ? (
                      <span className="inline-flex items-center gap-1 text-caption font-bold text-success-text bg-success-bg px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Khớp chuẩn
                      </span>
                    ) : item.matchStatus === "PARTIAL" ? (
                      <span className="inline-flex items-center gap-1 text-caption font-bold text-warning-text bg-warning-bg px-2 py-0.5 rounded-full">
                        <AlertTriangle size={12} /> Khớp 1 phần
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-caption font-bold text-primary bg-primary-muted px-2 py-0.5 rounded-full">
                        <XCircle size={12} /> Lệch sóng
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
