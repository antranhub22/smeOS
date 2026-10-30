"use client"

import React from "react"
import Link from "next/link"
import {
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package,
  Printer,
  SlidersHorizontal,
  PlusCircle,
} from "@/components/ui/icons"
import { INDUSTRY_REGISTRY } from "@/modules/organization/domain/industries"
import { Badge } from "@/components/ui/badge"

export function IndustryEcosystemBoard() {
  const industries = Object.values(INDUSTRY_REGISTRY)

  return (
    <div className="space-y-6">
      {/* Thẻ tóm tắt tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-caption font-medium">
            <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Ngành hàng kích hoạt</span>
          </div>
          <div className="text-2xl font-black text-text tracking-tight">
            {industries.length} / 7
          </div>
          <p className="text-caption text-text-muted mt-1">100% chuẩn hóa Plugin</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-caption font-medium">
            <Package className="w-4 h-4 text-success" aria-hidden="true" />
            <span>Danh mục chuẩn hóa</span>
          </div>
          <div className="text-2xl font-black text-text tracking-tight">
            {industries.reduce((acc, ind) => acc + ind.taxonomy.defaultCategories.length, 0)}
          </div>
          <p className="text-caption text-text-muted mt-1">Phân loại theo đặc thù ngành</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-caption font-medium">
            <Printer className="w-4 h-4 text-info" aria-hidden="true" />
            <span>Mẫu ấn phẩm A6</span>
          </div>
          <div className="text-2xl font-black text-text tracking-tight">
            {industries.reduce((acc, ind) => acc + ind.templates.printables.length, 0)}
          </div>
          <p className="text-caption text-text-muted mt-1">Tag mác, thẻ, menu, bảo hành</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-caption font-medium">
            <Sparkles className="w-4 h-4 text-warning" aria-hidden="true" />
            <span>Bối cảnh Studio AI</span>
          </div>
          <div className="text-2xl font-black text-text tracking-tight">
            {industries.reduce((acc, ind) => acc + ind.aiConfig.studioBackgroundStyles.length, 0)}
          </div>
          <p className="text-caption text-text-muted mt-1">Phong cách ảnh thương phẩm</p>
        </div>
      </div>

      {/* Bảng so sánh ma trận 7 ngành */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-body font-bold text-text">
              Ma trận 7 Ngành Hàng Độc Lập (Industry Plugin Registry)
            </h3>
            <p className="text-caption text-text-muted mt-0.5">
              Hệ thống tự động thích ứng terminology, định mức nguyên liệu, taxonomy và AI prompt theo từng ngành mà không cần sửa CSDL.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/van-hanh/nganh"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt border border-border hover:bg-surface text-caption font-bold text-text transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Cấu hình ma trận</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-caption font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Ngành hàng</th>
                <th className="py-3 px-4">Người làm / Sản phẩm mẫu</th>
                <th className="py-3 px-4">Danh mục & Dịp</th>
                <th className="py-3 px-4">Đơn vị & Định mức</th>
                <th className="py-3 px-4">Ấn phẩm A6</th>
                <th className="py-3 px-4">Đặc tả chuẩn</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {industries.map((ind) => (
                <tr key={ind.identity.key} className="hover:bg-surface-alt/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {ind.identity.name}
                    </div>
                    <div className="text-caption text-text-muted font-mono mt-0.5">
                      {ind.identity.key}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text">{ind.terminology.makerTitle}</div>
                    <div className="text-caption text-text-muted">
                      Mẫu: {ind.terminology.sampleProduct}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-text">
                      {ind.taxonomy.defaultCategories.length}
                    </span>{" "}
                    danh mục ·{" "}
                    <span className="font-semibold text-text">
                      {ind.taxonomy.occasions.length}
                    </span>{" "}
                    dịp
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-caption text-text">
                      {ind.bomSpec.measurementUnits.slice(0, 3).join(", ")}
                      {ind.bomSpec.measurementUnits.length > 3 ? "..." : ""}
                    </div>
                    <div className="text-caption text-text-muted">
                      {ind.bomSpec.componentRoles.length} vai trò nguyên liệu
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-text">
                      {ind.templates.printables.length} mẫu
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success" className="bg-success-bg text-success border border-success/30 font-semibold text-caption gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      5/5 Trụ cột
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/van-hanh/nganh"
                      className="inline-flex items-center gap-1 text-caption font-bold text-primary hover:underline"
                    >
                      <span>Cấu hình</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
