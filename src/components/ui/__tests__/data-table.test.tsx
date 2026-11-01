import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DataTable, Pagination, type ColumnDef } from "../data-table"
import { SearchFilterBar } from "../search-filter-bar"

interface ProductRow {
  id: string
  name: string
  price: number
}

const columns: ColumnDef<ProductRow>[] = [
  { id: "name", header: "Tên sản phẩm", cell: (r) => r.name, sortable: true },
  { id: "price", header: "Giá bán", cell: (r) => `${r.price.toLocaleString("vi-VN")} đ` },
]

const sampleData: ProductRow[] = [
  { id: "p1", name: "Bó hoa hồng đỏ", price: 350000 },
  { id: "p2", name: "Hộp hoa cẩm chướng", price: 420000 },
]

describe("DataTable & SearchFilterBar Components", () => {
  it("renders desktop table with columns, headers, rows, and density tokens", () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={columns}
        data={sampleData}
        getRowId={(r) => r.id}
      />
    )

    expect(html).toContain("Tên sản phẩm")
    expect(html).toContain("Giá bán")
    expect(html).toContain("Bó hoa hồng đỏ")
    expect(html).toContain("Hộp hoa cẩm chướng")
    expect(html).toContain("350.000 đ")
    expect(html).toContain("py-[var(--table-py,10px)]")
  })

  it("renders empty message when data is empty", () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="Không tìm thấy sản phẩm nào"
      />
    )

    expect(html).toContain("Không tìm thấy sản phẩm nào")
  })

  it("renders Pagination navigation controls", () => {
    const handlePageChange = vi.fn()
    const html = renderToStaticMarkup(
      <Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />
    )

    expect(html).toContain("Trang")
    expect(html).toContain("2")
    expect(html).toContain("5")
    expect(html).toContain('aria-label="Trang trước"')
    expect(html).toContain('aria-label="Trang sau"')
  })

  it("renders SearchFilterBar with search input and reset button when active", () => {
    const html = renderToStaticMarkup(
      <SearchFilterBar
        searchValue="hoa hồng"
        onSearchChange={() => {}}
        activeFilterCount={2}
        onResetFilters={() => {}}
      />
    )

    expect(html).toContain('value="hoa hồng"')
    expect(html).toContain("Xoá bộ lọc")
    expect(html).toContain("2") // Filter badge count
  })
})
