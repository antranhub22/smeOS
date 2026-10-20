"use client"

import { ArrowLeft, CheckCircle2, Download, Store, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"

type ActiveTab = "products" | "branches"

type Props = {
  restoredCount: number
  validCount: number
  isImporting: boolean
  activeTab: ActiveTab
  onBack: () => void
  onClearRestored: () => void
  onDownloadTemplate: () => void
  onImport: () => void
  onTabChange: (tab: ActiveTab) => void
}

export function BulkImportHeader({ restoredCount, validCount, isImporting, activeTab, onBack, onClearRestored, onDownloadTemplate, onImport, onTabChange }: Props) {
  return (
    <header className="flex flex-shrink-0 flex-col border-b border-border bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-caption text-text-muted">Kho mẫu hoa</div>
            <h1 className="text-title font-extrabold text-primary">
              {activeTab === "branches" ? "Nhập Danh Sách Cửa Hàng Chuỗi" : "Nhập mẫu hoa từ Excel và ảnh"}
            </h1>
            {restoredCount > 0 && activeTab === "products" && (
              <div className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-success">
                <CheckCircle2 size={12} />
                <span>Đã khôi phục {restoredCount} mẫu hoa từ phiên trước</span>
                <button
                  type="button"
                  onClick={onClearRestored}
                  className="ml-1 text-danger hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label="Xóa dữ liệu đã khôi phục"
                >
                  (Xóa)
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === "products" && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplate}
              className="flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Tải file Excel mẫu</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onImport}
              disabled={isImporting || validCount === 0}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} strokeWidth={2.2} />
              <span>{isImporting ? "Đang thêm mẫu hoa vào kho…" : `Thêm vào kho mẫu hoa (${validCount})`}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-0 px-4 pb-0 -mb-px">
        <button
          type="button"
          onClick={() => onTabChange("products")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-bold border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <FileSpreadsheet size={15} />
          Kho Sản Phẩm &amp; Ảnh
        </button>
        <button
          type="button"
          onClick={() => onTabChange("branches")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-bold border-b-2 transition-colors ${
            activeTab === "branches"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <Store size={15} />
          🏪 Cửa Hàng Chuỗi
        </button>
      </div>
    </header>
  )
}
