"use client"

import React from "react"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { IndustryPluginContract } from "@/modules/organization/domain/industry-plugin-contract"
import type { TerminologyGetter } from "./create-product-types"

interface CreateGeneralCardProps {
  ti: TerminologyGetter
  industry: IndustryPluginContract
  name: string
  setName: (v: string) => void
  code: string
  setCode: (v: string) => void
  priceVnd: string
  setPriceVnd: (v: string) => void
  category: string
  setCategory: (v: string) => void
  categories: string[]
  status: "ACTIVE" | "DRAFT"
  setStatus: (v: "ACTIVE" | "DRAFT") => void
  imagePreview: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  industryPrefix: string
}

export function CreateGeneralCard({
  ti,
  industry,
  name,
  setName,
  code,
  setCode,
  priceVnd,
  setPriceVnd,
  category,
  setCategory,
  categories,
  status,
  setStatus,
  imagePreview,
  onFileChange,
  onRemoveImage,
  fileInputRef,
  industryPrefix,
}: CreateGeneralCardProps) {
  const sampleName = industry.aiConfig.sampleProductNames[0] || "Sản phẩm mới"

  return (
    <Card className="p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2 text-title-sm font-bold text-text">
        <ImageIcon size={18} className="text-primary" />
        <span>Ảnh đại diện và thông tin chung</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload ảnh */}
        <div className="flex flex-col gap-2">
          <span className="text-caption font-semibold text-text">
            Ảnh {ti("sampleProduct").toLowerCase()}
          </span>
          {imagePreview ? (
            <div className="relative aspect-square w-full rounded-2xl border border-border bg-surface-alt overflow-hidden group">
              <img
                src={imagePreview}
                alt={`Preview ${ti("sampleProduct").toLowerCase()}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                aria-label="Xoá ảnh đã chọn"
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-alt/50 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-alt"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload size={20} />
              </div>
              <div className="text-body-sm font-medium text-text">
                Kéo thả ảnh vào đây hoặc bấm để chọn file
              </div>
              <div className="text-caption text-text-muted">
                Hỗ trợ JPG, PNG, WebP, tối đa 15 MB
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Các trường cơ bản */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-caption font-semibold text-text mb-1">
              Tên {ti("sampleProduct").toLowerCase()} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Ví dụ: ${sampleName}`}
              required
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Mã {ti("sampleProduct").toLowerCase()} (SKU) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Để trống tự tạo (hoặc nhập ${industryPrefix}-001)`}
                required
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary uppercase"
              />
            </div>

            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Giá niêm yết (₫)
              </label>
              <input
                type="text"
                value={priceVnd}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setPriceVnd(val ? Number(val).toLocaleString("vi-VN") : "")
                }}
                placeholder="Ví dụ: 650.000"
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Trạng thái bán
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "DRAFT")}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="DRAFT">Bản nháp</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
