import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { KpiTile } from "@/components/ui/kpi-tile"
import { LayoutGrid, Layers, Building2, ShieldCheck, Monitor } from "@/components/ui/icons"
import { discoverScreens } from "@/modules/platform/infra/screen-scanner"
import { ScreenLibraryExplorer } from "./screen-library-explorer"

export const metadata = {
  title: "Thư viện Màn hình Toàn hệ thống | Vận hành Nền tảng smeOS",
  description: "Liệt kê và điều hướng trực tiếp 100% màn hình thực tế trong hệ sinh thái đa tenant smeOS",
}

export default function ThuVienManHinhPage() {
  const catalog = discoverScreens()

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
      <PageHeader
        title="Thư viện Màn hình Toàn hệ thống"
        description="Không gian đối soát, kiểm tra trực tiếp và phân loại 100% màn hình thực tế trong hệ sinh thái đa tenant smeOS. Dữ liệu được quét tự động và cập nhật tức thì theo mã nguồn."
      />

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile
          label="Tổng số màn hình"
          value={catalog.total}
          icon={<Monitor className="h-5 w-5 text-primary" />}
          description="Được quét tự động từ mã nguồn src/app"
        />
        <KpiTile
          label="StoreOS (Cửa hàng)"
          value={catalog.byTier.STORE}
          icon={<LayoutGrid className="h-5 w-5 text-success" />}
          description="Bán hàng, sản phẩm, đơn hàng, AI"
        />
        <KpiTile
          label="SaaS Mother & Chuỗi"
          value={catalog.byTier.MOTHER + catalog.byTier.CHAIN}
          icon={<Building2 className="h-5 w-5 text-info" />}
          description={`${catalog.byTier.MOTHER} Vận hành · ${catalog.byTier.CHAIN} Điều phối chuỗi`}
        />
        <KpiTile
          label="Bao phủ Screen Contract"
          value={`${catalog.coveragePercent}%`}
          icon={<ShieldCheck className="h-5 w-5 text-accent" />}
          description={`${catalog.coveredV2} v2 chuẩn · ${catalog.coveredV1} v1 · ${catalog.exempt} miễn trừ`}
        />
      </div>

      {/* Interactive Explorer with Filters, Search, and Direct Links */}
      <ScreenLibraryExplorer initialCatalog={catalog} />
    </div>
  )
}
