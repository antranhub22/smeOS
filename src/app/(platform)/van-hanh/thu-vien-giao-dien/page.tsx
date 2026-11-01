import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { ToastProvider } from "@/components/ui/toast"
import { LiveRegionProvider } from "@/components/ui/live-region"
import { CatalogSections } from "./catalog-sections"

export const metadata = {
  title: "Thư viện Giao diện & Design System | Vận hành Nền tảng",
  description: "Trưng bày danh mục các thành phần giao diện Design System chuẩn Enterprise của smeOS",
}

export default function ThuVienGiaoDienPage() {
  return (
    <LiveRegionProvider>
      <ToastProvider>
        <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
          <PageHeader
            title="Thư viện Giao diện (UI Catalog)"
            description="Không gian đối soát, xem trước và kiểm thử toàn bộ các thành phần Design System của smeOS theo tiêu chuẩn Enterprise."
          />
          <CatalogSections />
        </div>
      </ToastProvider>
    </LiveRegionProvider>
  )
}
